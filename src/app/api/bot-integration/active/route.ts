import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bot-integration/active - List sewa aktif (untuk script bot)
// Query params: ?botType=slug atau tanpa filter = semua
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    // Pakai API key yang sama untuk simplicity, bisa diganti nanti
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const botTypeSlug = searchParams.get("botType");

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (botTypeSlug) {
    where.botType = { slug: botTypeSlug };
  }

  const activeOrders = await prisma.order.findMany({
    where,
    include: { botType: true },
    orderBy: { expiresAt: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: activeOrders.map((o) => ({
      orderCode: o.orderCode,
      botType: o.botType.slug,
      botTypeName: o.botType.name,
      groupLink: o.groupLink,
      expiresAt: o.expiresAt,
      contactPhone: o.contactPhone,
    })),
  });
}
