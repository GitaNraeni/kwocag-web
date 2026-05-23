import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramNotification } from "@/lib/telegram";

// POST /api/bot-integration/kicked - Bot di-kick dari grup
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { groupId, botTypeSlug } = await req.json();
    const groupIdClean = groupId.replace("@g.us", "");

    // Cari rental aktif untuk grup ini
    const where: any = { groupId: groupIdClean, status: "ACTIVE" };
    if (botTypeSlug) {
      const botType = await prisma.botType.findUnique({ where: { slug: botTypeSlug } });
      if (botType) where.botTypeId = botType.id;
    }

    const rental = await prisma.rental.findFirst({
      where,
      include: { botType: true },
    });

    if (rental) {
      await prisma.rental.update({
        where: { id: rental.id },
        data: { status: "ENDED" },
      });

      // Notifikasi Telegram
      await sendTelegramNotification(
        `━━━━━━━━━━━━━━━━━━\n⚠️ <b>BOT DI-KICK</b>\n━━━━━━━━━━━━━━━━━━\n\n🤖 Bot: ${rental.botType.name}\n👥 Grup: ${rental.groupName || rental.groupId}\n📝 Bot dikeluarkan dari grup\n━━━━━━━━━━━━━━━━━━`
      );
    }

    return NextResponse.json({ success: true, affected: rental ? 1 : 0 });
  } catch (error) {
    console.error("Kicked endpoint error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
