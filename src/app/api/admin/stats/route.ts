import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const [activeRentals, endedRentals, totalRentals] = await Promise.all([
    prisma.rental.count({ where: { status: "ACTIVE" } }),
    prisma.rental.count({ where: { status: "ENDED" } }),
    prisma.rental.count(),
  ]);

  const [pendingOrders, successOrders, expiredOrders, cancelledOrders, totalOrders] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "SUCCESS" } }),
    prisma.order.count({ where: { status: "EXPIRED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.count(),
  ]);

  const revenueResult = await prisma.order.aggregate({
    where: { status: "SUCCESS" },
    _sum: { totalPrice: true },
  });

  return NextResponse.json({
    success: true,
    data: {
      totalRentals,
      activeRentals,
      endedRentals,
      totalOrders,
      pendingOrders,
      successOrders,
      expiredOrders,
      cancelledOrders,
      totalRevenue: revenueResult._sum.totalPrice || 0,
    },
  });
}
