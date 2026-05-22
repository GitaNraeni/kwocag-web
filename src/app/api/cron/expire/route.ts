import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cron/expire - Auto-expire orders yang sudah lewat expiresAt
// Bisa dipanggil via Vercel Cron atau manual
// Skip permanent orders (expiresAt > 10 tahun dari sekarang)
export async function GET() {
  try {
    const now = new Date();
    const permanentThreshold = new Date();
    permanentThreshold.setFullYear(permanentThreshold.getFullYear() + 10);

    // Cari order ACTIVE yang sudah lewat expiresAt, tapi BUKAN permanent
    const expired = await prisma.order.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: {
          lt: now,
          // Exclude null (shouldn't happen) — permanent punya expiresAt jauh di masa depan jadi ga match lt:now
        },
      },
    });

    let count = 0;
    for (const order of expired) {
      // Double check: skip kalau expiresAt > 10 tahun (permanent)
      if (order.expiresAt && order.expiresAt.getTime() > permanentThreshold.getTime()) continue;

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
