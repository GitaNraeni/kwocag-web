import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/bot-integration/delsewa
// Dipanggil bot saat owner pakai command .delsewa — langsung end rental di website
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { groupId, botTypeSlug } = await req.json();
    if (!groupId || !botTypeSlug) {
      return NextResponse.json({ success: false, message: "groupId dan botTypeSlug wajib" }, { status: 400 });
    }

    const groupIdClean = groupId.replace("@g.us", "");

    const botType = await prisma.botType.findUnique({ where: { slug: botTypeSlug } });
    if (!botType) {
      return NextResponse.json({ success: false, message: "Bot type tidak ditemukan" }, { status: 404 });
    }

    const rental = await prisma.rental.findUnique({
      where: { groupId_botTypeId: { groupId: groupIdClean, botTypeId: botType.id } },
    });

    if (!rental) {
      return NextResponse.json({ success: true, message: "Rental tidak ditemukan, mungkin sudah dihapus" });
    }

    if (rental.status === "ENDED") {
      return NextResponse.json({ success: true, message: "Rental sudah ENDED" });
    }

    await prisma.rental.update({
      where: { id: rental.id },
      data: { status: "ENDED" },
    });

    // Log aktivitas
    await prisma.orderLog.create({
      data: {
        orderId: (await prisma.order.findFirst({
          where: { rentalId: rental.id },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        }))?.id || "manual",
        action: "MANUAL_ENDED",
        details: `Sewa dihentikan manual oleh owner via command .delsewa`,
      },
    }).catch(() => {}); // skip kalau nggak ada order linked

    return NextResponse.json({ success: true, message: `Rental ${groupIdClean} berhasil di-end` });
  } catch (error) {
    console.error("DelSewa error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
