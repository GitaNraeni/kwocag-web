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

export async function sendLogNotification(message: string) {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    const token = settings?.telegramToken || process.env.TELEGRAM_BOT_TOKEN || "";
    const chatId = (settings as any)?.telegramLogChatId || settings?.telegramChatId || process.env.TELEGRAM_CHAT_ID || "";
    if (!token || !chatId) return false;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
    return res.ok;
  } catch {
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
  const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  return `━━━━━━━━━━━━━━━━━━
📋 <b>ORDER BARU</b>
━━━━━━━━━━━━━━━━━━

🆔 Kode: <code>${order.orderCode}</code>
🤖 Bot: <b>${order.botTypeName}</b>
⏱ Durasi: ${order.duration}
💰 Total: <b>Rp ${order.totalPrice.toLocaleString("id-ID")}</b>

🔗 Grup: ${order.groupLink}
📱 HP: ${order.contactPhone || "-"}
📧 Email: ${order.contactEmail || "-"}

📊 Status: ${order.status}
🕐 Waktu: ${now}
━━━━━━━━━━━━━━━━━━`;
}

export function formatPaymentSuccess(order: {
  orderCode: string;
  botTypeName: string;
  duration: string;
  groupLink: string;
  totalPrice: number;
  expiresAt: string;
  isExtend?: boolean;
  contactPhone?: string | null;
  contactEmail?: string | null;
}) {
  const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  const title = order.isExtend ? "🔄 <b>SEWA DIPERPANJANG</b>" : "✅ <b>SEWA BARU BERHASIL</b>";

  return `━━━━━━━━━━━━━━━━━━
${title}
━━━━━━━━━━━━━━━━━━

🆔 Kode: <code>${order.orderCode}</code>
🤖 Bot: <b>${order.botTypeName}</b>
⏱ Durasi: ${order.duration}
💰 Total: <b>Rp ${order.totalPrice.toLocaleString("id-ID")}</b>

🔗 Grup: ${order.groupLink}
📱 HP: ${order.contactPhone || "-"}${order.contactEmail ? `\n📧 Email: ${order.contactEmail}` : ""}
📅 Aktif sampai: <b>${order.expiresAt}</b>

🕐 Dibayar: ${now}
━━━━━━━━━━━━━━━━━━`;
}

export function formatOrderCancelled(order: {
  orderCode: string;
  botTypeName: string;
  reason: string;
  cancelledBy?: "user" | "system";
}) {
  const title = order.cancelledBy === "system"
    ? "⏰ <b>ORDER EXPIRED</b>"
    : "❌ <b>ORDER DIBATALKAN</b>";

  return `━━━━━━━━━━━━━━━━━━
${title}
━━━━━━━━━━━━━━━━━━

🆔 Kode: <code>${order.orderCode}</code>
🤖 Bot: ${order.botTypeName}
📝 Alasan: ${order.reason}
━━━━━━━━━━━━━━━━━━`;
}
