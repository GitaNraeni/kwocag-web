import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Auth check
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: { botType: true },
    });
    if (!rental) {
      return NextResponse.json({ success: false, message: "Rental tidak ditemukan" }, { status: 404 });
    }
    if (rental.status === "ENDED") {
      return NextResponse.json({ success: false, message: "Rental sudah ENDED" }, { status: 400 });
    }

    // Update status di database + set expiresAt ke masa lalu agar bot detect expired
    await prisma.rental.update({
      where: { id },
      data: {
        status: "ENDED",
        expiresAt: new Date(Date.now() - 1000), // set ke masa lalu
      },
    });

    // Notify bot via endpoint delsewa — bot akan hapus dari sewa.json dan keluar grup
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kwocag.web.id";
      const apiKey = process.env.PAKASIR_API_KEY || "";
      await fetch(`${appUrl}/api/bot-integration/delsewa`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({
          groupId: rental.groupId + "@g.us",
          botTypeSlug: rental.botType.slug,
        }),
        signal: AbortSignal.timeout(10000),
      });
    } catch { /* skip kalau gagal, status database sudah ENDED */ }

    return NextResponse.json({ success: true, message: "Rental berhasil diakhiri" });
  } catch (error) {
    console.error("End rental error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
