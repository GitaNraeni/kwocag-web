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
    if (!cfg.ramashopApiKey) {
      console.warn("[Payment] RamaShop API key kosong, fallback ke Pakasir");
      if (cfg.pakasirApiKey && cfg.pakasirSlug) {
        return createPakasirPayment(cfg.pakasirApiKey, cfg.pakasirSlug, params);
      }
      return { success: false, message: "API key payment gateway belum diatur" };
    }
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
    const res = await fetch(`${PAKASIR_BASE}/transactioncreate/qris`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, project: slug, order_id: params.orderCode, amount: params.amount }),
    });

    const data = await res.json().catch(() => null);

    // Cek apakah Pakasir API return QRIS string/image langsung
    const qrisString = data?.qr_string || data?.qris_string || data?.data?.qr_string || data?.data?.qris_string || data?.qr_data || data?.data?.qr_data || null;
    const qrImage = data?.qr_image || data?.data?.qr_image || data?.qris_image || data?.data?.qris_image || null;

    if (qrisString) {
      // QRIS string → generate QR image yang bisa langsung di-scan bayar
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrisString)}`;
      return { success: true, paymentUrl: qrUrl, qrImage: qrUrl, paymentId: params.orderCode };
    }

    if (qrImage) {
      return { success: true, paymentUrl: qrImage, qrImage, paymentId: params.orderCode };
    }

    // Pakasir gak return QR langsung — simpan URL halaman payment
    // Frontend akan tampilin ini dalam iframe (QR QRIS asli dari Pakasir, bisa di-scan bayar)
    const paymentPageUrl = `https://app.pakasir.com/pay/${slug}/${params.amount}?order_id=${encodeURIComponent(params.orderCode)}&qris_only=1`;
    return { success: true, paymentUrl: paymentPageUrl, paymentId: params.orderCode };
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
  // Kalau API key kosong, langsung gagal
  if (!apiKey) {
    console.error("[RamaShop] API key kosong! Set di admin settings.");
    return { success: false, message: "RamaShop API key belum diatur" };
  }

  try {
    console.log(`[RamaShop] Creating deposit: amount=${params.amount}`);
    
    const res = await fetch(`${RAMASHOP_BASE}/deposit/create`, {
      method: "POST",
      headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: params.amount, method: "qris" }),
    });

    const data = await res.json();
    console.log(`[RamaShop] Response:`, JSON.stringify(data).substring(0, 500));

    if (data.success && data.data) {
      const qrImage = data.data.qrImage || null;
      const qrString = data.data.qrString || null;
      const depositId = data.data.depositId;

      // PRIORITAS: qrString → generate QR menggunakan api.qrserver.com (lebih reliable)
      let finalQrUrl = null;

      if (qrString) {
        // Generate QR image dari QRIS string (ini QRIS asli, bisa langsung bayar)
        finalQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrString)}`;
        console.log(`[RamaShop] Generated QR from qrString via api.qrserver.com`);
      } else if (qrImage) {
        // Fallback: qrImage langsung dari RamaShop (tapi bisa expired/temporary)
        finalQrUrl = qrImage;
        console.log(`[RamaShop] Using qrImage from RamaShop: ${qrImage.substring(0, 100)}...`);
      }

      if (!finalQrUrl) {
        console.error("[RamaShop] Response success tapi qrImage dan qrString kosong:", JSON.stringify(data.data));
        return { success: false, message: "QR image tidak tersedia dari RamaShop" };
      }

      return {
        success: true,
        qrImage: finalQrUrl,
        paymentId: depositId,
        paymentUrl: finalQrUrl,
      };
    }

    console.error("[RamaShop] API error:", data.message || "Unknown error");
    return { success: false, message: data.message || "Gagal membuat pembayaran" };
  } catch (error) {
    console.error("Ramashop error:", error);
    return { success: false, message: "Payment gateway error" };
  }
}

async function checkRamashopStatus(apiKey: string, depositId: string) {
  try {
    console.log(`[RamaShop] Checking status for depositId: ${depositId}`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${RAMASHOP_BASE}/deposit/status/${depositId}`, {
      headers: { "X-API-Key": apiKey },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await res.json();
    console.log(`[RamaShop] Status response:`, JSON.stringify(data).substring(0, 300));

    // RamaShop response format: { status: true, data: { status: "success"|"pending"|"already", ... } }
    // atau: { success: true, data: { status: "success" } }
    const paymentStatus = data?.data?.status || data?.data?.payment_status || "";
    
    if (paymentStatus) {
      return {
        transaction: {
          status: paymentStatus === "success" ? "completed" 
            : paymentStatus === "already" ? "completed" 
            : paymentStatus,
        },
      };
    }

    // Fallback: cek top-level status
    if (data?.status === "success" || data?.status === true) {
      // Mungkin data langsung di top level
      return {
        transaction: { status: "completed" },
      };
    }

    return null;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[RamaShop] Status check timeout");
    } else {
      console.error("[RamaShop] Status check error:", error);
    }
    return null;
  }
}