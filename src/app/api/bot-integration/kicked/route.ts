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

    // Cari order aktif untuk grup ini
    const orders = await prisma.order.findMany({
      where: {
        status: "ACTIVE",
        botType: botTypeSlug ? { slug: botTypeSlug } : undefined,
        OR: [
          { groupLink: { contains: groupId.replace("@g.us", "") } },
          { notes: { contains: groupId } },
        ],
      },
      include: { botType: true },
    });

    for (const order of orders) {
      // Update status
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });

      await prisma.orderLog.create({
        data: {
          orderId: order.id,
          action: "BOT_KICKED",
          details: "Bot dikeluarkan dari grup oleh admin grup",
        },
      });

      // Notifikasi Telegram
      await sendTelegramNotification(
        `━━━━━━━━━━━━━━━━━━\n⚠️ <b>BOT DI-KICK</b>\n━━━━━━━━━━━━━━━━━━\n\n🆔 Order: <code>${order.orderCode}</code>\n🤖 Bot: ${order.botType.name}\n👥 Grup: ${order.notes || groupId}\n📝 Bot dikeluarkan dari grup\n━━━━━━━━━━━━━━━━━━`
      );
    }

    return NextResponse.json({ success: true, affected: orders.length });
  } catch (error) {
    console.error("Kicked endpoint error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
