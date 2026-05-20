/**
 * Payment Gateway - Multi Provider (Pakasir + Ramashop)
 */

import { prisma } from "./prisma";

const PAKASIR_BASE = "https://app.pakasir.com/api";
const RAMASHOP_BASE = "https://ramashop.my.id/api/public";

async function getConfig() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    return {
      provider: (settings as any)?.paymentProvider || "pakasir",
      pakasirApiKey: settings?.pakasirApiKey || process.env.PAKASIR_API_KEY || "",
      pakasirSlug: settings?.pakasirSlug || process.env.PAKASIR_PROJECT_SLUG || "",
      ramashopApiKey: (settings as any)?.ramashopApiKey || "",
    };
  } catch {
    return {
      provider: "pakasir",
      pakasirApiKey: process.env.PAKASIR_API_KEY || "",
      pakasirSlug: process.env.PAKASIR_PROJECT_SLUG || "",
      ramashopApiKey: "",
    };
  }
}

interface PaymentResult {
  success: boolean;
  paymentUrl?: string; // URL untuk generate QR (pakasir) atau langsung QR image (ramashop)
  qrImage?: string;    // Direct QR image URL (ramashop)
  paymentId?: string;  // ID transaksi untuk polling
  message?: string;
}

/**
 * Buat pembayaran baru
 */
export async function createPayment(params: { orderCode: string; amount: number }): Promise<PaymentResult> {
  const cfg = await getConfig();

  if (cfg.provider === "ramashop") {
    return createRamashopPayment(cfg.ramashopApiKey, params);
  }
  return createPakasirPayment(cfg.pakasirApiKey, cfg.pakasirSlug, params);
}

/**
 * Cek status pembayaran
 */
export async function getTransactionDetail(orderId: string, amount: number) {
  const cfg = await getConfig();

  if (cfg.provider === "ramashop") {
    return checkRamashopStatus(cfg.ramashopApiKey, orderId);
  }
  return checkPakasirStatus(cfg.pakasirApiKey, cfg.pakasirSlug, orderId, amount);
}

/**
 * Cancel transaksi
 */
export async function cancelTransaction(orderId: string, amount: number) {
  const cfg = await getConfig();
  if (cfg.provider === "pakasir") {
    try {
      await fetch(`${PAKASIR_BASE}/transactioncancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: cfg.pakasirApiKey, project: cfg.pakasirSlug, order_id: orderId, amount }),
      });
    } catch { /* skip */ }
  }
  // Ramashop gak ada cancel endpoint
}

/**
 * Generate payment URL (untuk QR code)
 */
export async function getPaymentUrl(amount: number, orderId: string): Promise<string> {
  const cfg = await getConfig();
  if (cfg.provider === "pakasir") {
    return `https://app.pakasir.com/pay/${cfg.pakasirSlug}/${amount}?order_id=${encodeURIComponent(orderId)}&qris_only=1`;
  }
  // Ramashop: QR image sudah di-return saat create
  return "";
}

// ============ PAKASIR ============

async function createPakasirPayment(apiKey: string, slug: string, params: { orderCode: string; amount: number }): Promise<PaymentResult> {
  try {
    await fetch(`${PAKASIR_BASE}/transactioncreate/qris`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, project: slug, order_id: params.orderCode, amount: params.amount }),
    });

    const paymentUrl = `https://app.pakasir.com/pay/${slug}/${params.amount}?order_id=${encodeURIComponent(params.orderCode)}&qris_only=1`;

    return { success: true, paymentUrl, paymentId: params.orderCode };
  } catch (error) {
    console.error("Pakasir error:", error);
    return { success: false, message: "Payment gateway error" };
  }
}

async function checkPakasirStatus(apiKey: string, slug: string, orderId: string, amount: number) {
  try {
    const res = await fetch(
      `${PAKASIR_BASE}/transactiondetail?api_key=${apiKey}&project=${slug}&order_id=${encodeURIComponent(orderId)}&amount=${amount}`,
      { headers: { Accept: "application/json" } }
    );
    return await res.json();
  } catch { return null; }
}

// ============ RAMASHOP ============

async function createRamashopPayment(apiKey: string, params: { orderCode: string; amount: number }): Promise<PaymentResult> {
  try {
    const res = await fetch(`${RAMASHOP_BASE}/deposit/create`, {
      method: "POST",
      headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: params.amount, method: "qris" }),
    });

    const data = await res.json();

    if (data.success && data.data) {
      return {
        success: true,
        qrImage: data.data.qrImage,
        paymentId: data.data.depositId,
        paymentUrl: data.data.qrImage, // QR image langsung
      };
    }

    return { success: false, message: data.message || "Gagal membuat pembayaran" };
  } catch (error) {
    console.error("Ramashop error:", error);
    return { success: false, message: "Payment gateway error" };
  }
}

async function checkRamashopStatus(apiKey: string, depositId: string) {
  try {
    const res = await fetch(`${RAMASHOP_BASE}/deposit/status/${depositId}`, {
      headers: { "X-API-Key": apiKey },
    });
    const data = await res.json();

    // Normalize response format supaya sama dengan Pakasir
    if (data.status && data.data) {
      const status = data.data.status;
      return {
        transaction: {
          status: status === "success" ? "completed" : status === "already" ? "completed" : status,
        },
      };
    }
    return null;
  } catch { return null; }
}
