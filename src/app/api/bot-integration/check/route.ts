import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bot-integration/check?group=linkgrup&groupId=xxx - Cek apakah grup masih aktif sewa
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const groupLink = searchParams.get("group");
  const groupId = searchParams.get("groupId");

  if (!groupLink && !groupId) {
    return NextResponse.json(
      { success: false, message: "Parameter 'group' atau 'groupId' wajib diisi" },
      { status: 400 }
    );
  }

  const where: any = { status: "ACTIVE", expiresAt: { gt: new Date() } };
  if (groupId) {
    where.groupId = groupId.replace("@g.us", "");
  } else if (groupLink) {
    where.groupLink = { contains: groupLink };
  }

  const rental = await prisma.rental.findFirst({
    where,
    include: { botType: true },
    orderBy: { expiresAt: "desc" },
  });

  if (!rental) {
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
      groupId: rental.groupId,
      groupName: rental.groupName,
      botType: rental.botType.slug,
      botTypeName: rental.botType.name,
      expiresAt: rental.expiresAt,
    },
  });
}
