import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bot-integration/check?group=linkgrup - Cek apakah grup masih aktif sewa
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const groupLink = searchParams.get("group");

  if (!groupLink) {
    return NextResponse.json(
      { success: false, message: "Parameter 'group' wajib diisi" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findFirst({
    where: {
      groupLink: { contains: groupLink },
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    include: { botType: true },
    orderBy: { expiresAt: "desc" },
  });

  if (!order) {
    return NextResponse.json({
      success: true,
      active: false,
      message: "Tidak ada sewa aktif untuk grup ini",
    });
  }

  return NextResponse.json({
    success: true,
    active: true,
    data: {
      orderCode: order.orderCode,
      botType: order.botType.slug,
      botTypeName: order.botType.name,
      expiresAt: order.expiresAt,
    },
  });
}
