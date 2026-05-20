import { prisma } from "./prisma";

async function getConfig() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    if (settings?.telegramToken && settings?.telegramChatId) {
      return { token: settings.telegramToken, chatId: settings.telegramChatId };
    }
  } catch { /* fallback */ }
  return {
    token: process.env.TELEGRAM_BOT_TOKEN || "",
    chatId: process.env.TELEGRAM_CHAT_ID || "",
  };
}

export async function sendTelegramNotification(message: string) {
  try {
    const cfg = await getConfig();
    if (!cfg.token || !cfg.chatId) return false;

    const url = `https://api.telegram.org/bot${cfg.token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Telegram notification failed:", error);
    return false;
  }
}

export function formatOrderNotification(order: {
  orderCode: string;
  botTypeName: string;
  duration: string;
  groupLink: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  totalPrice: number;
  status: string;
}) {
  return `<b>Order Baru</b>

Kode: <code>${order.orderCode}</code>
Bot: ${order.botTypeName}
Durasi: ${order.duration}
Harga: Rp ${order.totalPrice.toLocaleString("id-ID")}
Grup: ${order.groupLink}
HP: ${order.contactPhone || "-"}
Email: ${order.contactEmail || "-"}
Status: ${order.status}
Waktu: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`;
}
