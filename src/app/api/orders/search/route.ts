import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders/search?phone=08xxx - Cari order by phone
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ success: false, message: "Parameter phone wajib" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { contactPhone: { contains: phone } },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { orderCode: true, status: true, createdAt: true },
  });

  return NextResponse.json({ success: true, data: orders });
}
