import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/bot-integration/update-name
 * Dipanggil bot waktu ada perubahan nama grup
 * Body: { groupId: string, groupName: string }
 */
export async function PATCH(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { groupId, groupName } = await req.json();

    if (!groupId || !groupName) {
      return NextResponse.json({ success: false, message: "groupId dan groupName wajib diisi" }, { status: 400 });
    }

    const groupIdClean = groupId.replace("@g.us", "");

    // Update semua rental yang punya groupId ini
    const result = await prisma.rental.updateMany({
      where: { groupId: groupIdClean },
      data: { groupName },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error("[update-name] Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
