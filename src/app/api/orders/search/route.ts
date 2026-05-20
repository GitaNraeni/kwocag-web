import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders/search?phone=08xxx - Cari order by phone (semua order)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ success: false, message: "Parameter phone wajib" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { contactPhone: { contains: phone } },
    include: { botType: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    success: true,
    data: orders.map(o => ({
      orderCode: o.orderCode,
      botType: o.botType.name,
      status: o.status,
      totalPrice: o.totalPrice,
      duration: o.duration,
      customDays: o.customDays,
      expiresAt: o.expiresAt,
      createdAt: o.createdAt,
    })),
  });
}
