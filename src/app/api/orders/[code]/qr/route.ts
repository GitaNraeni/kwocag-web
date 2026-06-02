import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orders/[code]/qr
 * Proxy QR image untuk order — fetch dari external URL di server-side
 * dan serve ke browser tanpa CORS issue.
 * Kalau qrImage berupa URL external, fetch dulu lalu forward ke browser.
 * Kalau qrImage berupa QRIS string mentah, generate via api.qrserver.com.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const order = await prisma.order.findUnique({
      where: { orderCode: code },
    });

    if (!order) {
      return new NextResponse("Order tidak ditemukan", { status: 404 });
    }

    if (order.status !== "PENDING") {
      return new NextResponse("Order sudah tidak aktif", { status: 410 });
    }

    const qrImage = (order as any).qrImage as string | null;

    // Kalau qrImage null, coba fallback ke paymentUrl (mungkin berisi URL QR dari provider lain)
    const sourceUrl = qrImage || (order as any).paymentUrl as string | null;

    if (!sourceUrl) {
      return new NextResponse("QR tidak tersedia", { status: 404 });
    }

    // Ekstrak QRIS string dari URL kalau ada parameter ?data= (dari QR generator URL)
    // Contoh: https://larabert-qrgen.hf.space/v1/create-qr-code?...&data=000201...
    let qrisData: string | null = null;
    if (sourceUrl.startsWith("http")) {
      try {
        const parsed = new URL(sourceUrl);
        const dataParam = parsed.searchParams.get("data");
        if (dataParam && dataParam.startsWith("0002")) {
          // Ini QRIS string — re-generate pakai api.qrserver.com yang reliable
          qrisData = dataParam;
        }
      } catch { /* skip */ }
    }

    // Kalau ada QRIS string, generate via api.qrserver.com di server
    if (qrisData) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrisData)}`;
      const res = await fetch(qrUrl, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        return new NextResponse("Gagal generate QR", { status: 502 });
      }
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=300",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Kalau sourceUrl adalah URL gambar langsung — proxy fetch di server
    if (sourceUrl.startsWith("http")) {
      const res = await fetch(sourceUrl, {
        headers: { "User-Agent": "Mozilla/5.0 KWOCAG-Bot/1.0" },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.error(`[QR Proxy] Fetch failed for ${sourceUrl}: ${res.status}`);
        return new NextResponse("QR tidak dapat diambil", { status: 502 });
      }

      const contentType = res.headers.get("content-type") || "image/png";
      const buffer = await res.arrayBuffer();

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=300",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Kalau sourceUrl adalah QRIS string mentah — generate QR dari api.qrserver.com
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(sourceUrl)}`;
    const res = await fetch(qrUrl, { signal: AbortSignal.timeout(10000) });

    if (!res.ok) {
      return new NextResponse("Gagal generate QR", { status: 502 });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("[QR Proxy] Error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
