import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cron/expire - Auto-end rentals yang sudah lewat expiresAt
// + Auto-expire pending orders yang sudah lama (> 24 jam)
export async function GET() {
  try {
    const now = new Date();
    const permanentThreshold = new Date();
    permanentThreshold.setFullYear(permanentThreshold.getFullYear() + 10);

    // 1. End rentals yang sudah expired
    const expiredRentals = await prisma.rental.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
    });

    let rentalCount = 0;
    for (const rental of expiredRentals) {
      if (rental.expiresAt && rental.expiresAt.getTime() > permanentThreshold.getTime()) continue;
      await prisma.rental.update({
        where: { id: rental.id },
        data: { status: "ENDED" },
      });
      rentalCount++;
    }

    // 2. Expire pending orders yang sudah > 10 menit
    const expireThreshold = new Date(now.getTime() - 10 * 60 * 1000);
    const expiredOrders = await prisma.order.updateMany({
      where: {
        status: "PENDING",
        createdAt: { lt: expireThreshold },
      },
      data: { status: "EXPIRED" },
    });

    return NextResponse.json({
      success: true,
      rentalsEnded: rentalCount,
      ordersExpired: expiredOrders.count,
    });
  } catch (error) {
    console.error("Cron expire error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
