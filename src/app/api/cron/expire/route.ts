import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cron/expire - Auto-expire orders yang sudah lewat expiresAt
// Bisa dipanggil via Vercel Cron atau manual
export async function GET() {
  try {
    const now = new Date();

    // Cari order ACTIVE yang sudah lewat expiresAt
    const expired = await prisma.order.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
    });

    let count = 0;
    for (const order of expired) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "EXPIRED" },
      });

      await prisma.orderLog.create({
        data: {
          orderId: order.id,
          action: "AUTO_EXPIRED",
          details: "Sewa berakhir otomatis",
        },
      });
      count++;
    }

    return NextResponse.json({ success: true, expired: count });
  } catch (error) {
    console.error("Cron expire error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
