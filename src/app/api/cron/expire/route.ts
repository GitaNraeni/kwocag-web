import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLogNotification } from "@/lib/telegram";

// GET /api/cron/expire - Auto-end rentals yang sudah lewat expiresAt
// + Auto-expire pending orders yang sudah lama (> 24 jam)
// + Cek heartbeat bot instance — notif kalau ada yang down
export async function GET() {
  try {
    const now = new Date();
    const permanentThreshold = new Date();
    permanentThreshold.setFullYear(permanentThreshold.getFullYear() + 10);

    // 1. End rentals yang sudah expired
    const expiredRentals = await prisma.rental.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
    });

    let rentalCount = 0;
    for (const rental of expiredRentals) {
      if (rental.expiresAt && rental.expiresAt.getTime() > permanentThreshold.getTime()) continue;
      await prisma.rental.update({
        where: { id: rental.id },
        data: { status: "ENDED" },
      });
      rentalCount++;
    }

    // 2. Expire pending orders yang sudah > 10 menit
    const expireThreshold = new Date(now.getTime() - 10 * 60 * 1000);
    const expiredOrders = await prisma.order.updateMany({
      where: {
        status: "PENDING",
        createdAt: { lt: expireThreshold },
      },
      data: { status: "EXPIRED" },
    });

    // 3. Cek heartbeat bot instance — kirim notif kalau > 15 menit nggak sync
    try {
      const THRESHOLD_MS = 15 * 60 * 1000; // 15 menit
      const heartbeats = await (prisma as any).botHeartbeat.findMany();

      for (const hb of heartbeats) {
        const diff = now.getTime() - new Date(hb.lastSeen).getTime();
        if (diff > THRESHOLD_MS) {
          const menit = Math.floor(diff / 60000);
          // Cari nama bot
          const botType = await prisma.botType.findFirst({
            where: { slug: hb.botTypeSlug },
            select: { name: true },
          });
          const botName = botType?.name || hb.botTypeSlug;

          await sendLogNotification(
            `⚠️ <b>BOT DOWN ALERT</b>\n\n` +
            `🤖 Bot: <b>${botName}</b>\n` +
            `📟 Instance: <b>${hb.instance}</b>\n` +
            `⏱ Tidak sync sejak: <b>${menit} menit lalu</b>\n` +
            `🕐 Terakhir online: ${new Date(hb.lastSeen).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}\n\n` +
            `Segera cek server/panel bot!`
          );
        }
      }
    } catch { /* skip heartbeat check kalau error */ }

    // 4. Cleanup ProcessedWebhook yang lebih dari 7 hari
    try {
      await (prisma as any).processedWebhook.deleteMany({
        where: { createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      });
    } catch { /* skip */ }

    return NextResponse.json({
      success: true,
      rentalsEnded: rentalCount,
      ordersExpired: expiredOrders.count,
    });
  } catch (error) {
    console.error("Cron expire error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
