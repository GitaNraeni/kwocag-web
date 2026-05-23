import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bot-integration/active - List sewa aktif (untuk script bot)
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const botTypeSlug = searchParams.get("botType");

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (botTypeSlug) {
    where.botType = { slug: botTypeSlug };
  }

  const activeRentals = await prisma.rental.findMany({
    where,
    include: { botType: true },
    orderBy: { expiresAt: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: activeRentals.map((r) => ({
      groupId: r.groupId,
      groupName: r.groupName,
      botType: r.botType.slug,
      botTypeName: r.botType.name,
      groupLink: r.groupLink,
      expiresAt: r.expiresAt,
      contactPhone: r.contactPhone,
    })),
  });
}
