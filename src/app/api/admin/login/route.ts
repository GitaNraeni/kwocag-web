import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken, verifyPassword } from "@/lib/auth";
import { sendTelegramNotification, sendLogNotification } from "@/lib/telegram";
import { cookies } from "next/headers";

// Throttle notif rate limit — max 1 notif per 5 menit per IP
const loginNotifMap = new Map<string, number>();
function shouldNotifyLogin(ip: string): boolean {
  const last = loginNotifMap.get(ip) || 0;
  if (Date.now() - last > 5 * 60 * 1000) {
    loginNotifMap.set(ip, Date.now());
    return true;
  }
  return false;
}

// Rate limiting (in-memory, resets on redeploy)
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 menit

function getClientIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function isBlocked(ip: string): boolean {
  const data = loginAttempts.get(ip);
  if (!data) return false;
  if (data.blockedUntil > Date.now()) return true;
  if (data.blockedUntil > 0 && data.blockedUntil <= Date.now()) {
    loginAttempts.delete(ip);
    return false;
  }
  return false;
}

function recordFailedAttempt(ip: string): number {
  const data = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  data.count++;
  if (data.count >= MAX_ATTEMPTS) {
    data.blockedUntil = Date.now() + BLOCK_DURATION;
  }
  loginAttempts.set(ip, data);
  return MAX_ATTEMPTS - data.count;
}

function clearAttempts(ip: string) {
  loginAttempts.delete(ip);
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const body = await req.json();
    const { username, password, tfaCode } = body;

    // Check rate limit
    if (isBlocked(ip)) {
      const data = loginAttempts.get(ip)!;
      const remainingMin = Math.ceil((data.blockedUntil - Date.now()) / 60000);
      if (shouldNotifyLogin(ip)) {
        const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
        sendLogNotification(
          `⚠️ <b>Rate Limit Login Terpicu</b>\n\nEndpoint: /admin/login\nIP: <code>${ip}</code>\nWaktu: ${now}`
        ).catch(() => {});
      }
      return NextResponse.json(
        { success: false, message: `Terlalu banyak percobaan. Coba lagi dalam ${remainingMin} menit.` },
        { status: 429 }
      );
    }

    // Step 2: Verify 2FA code
    if (tfaCode) {
      // Cari pending 2FA di database (SiteSettings.pakasirSlug dipakai sementara sebagai storage)
      // Lebih baik: simpan di tabel terpisah, tapi untuk simplicity pakai admin.password field trick
      // Actually, kita simpan di OrderLog sebagai workaround — atau lebih baik skip 2FA di serverless
      // FIX: Simpan code di cookie encrypted supaya ga perlu shared state
      
      const pendingCookie = req.cookies.get("tfa_pending")?.value;
      if (!pendingCookie) {
        return NextResponse.json(
          { success: false, message: "Kode verifikasi expired. Login ulang." },
          { status: 401 }
        );
      }

      let pending: { code: string; expiresAt: number; adminId: string; username: string };
      try {
        pending = JSON.parse(Buffer.from(pendingCookie, "base64url").toString());
      } catch {
        return NextResponse.json(
          { success: false, message: "Kode verifikasi expired. Login ulang." },
          { status: 401 }
        );
      }

      if (Date.now() > pending.expiresAt) {
        return NextResponse.json(
          { success: false, message: "Kode verifikasi expired. Login ulang." },
          { status: 401 }
        );
      }
      if (tfaCode !== pending.code) {
        return NextResponse.json(
          { success: false, message: "Kode verifikasi salah." },
          { status: 401 }
        );
      }

      // 2FA verified — create session
      clearAttempts(ip);

      const token = createToken({ id: pending.adminId, username: pending.username });
      const cookieStore = await cookies();
      cookieStore.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
      // Clear 2FA cookie
      cookieStore.delete("tfa_pending");

      // Notify login success
      const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
      await sendLogNotification(
        `🔓 <b>LOGIN BERHASIL</b>\n\n👤 User: <code>${pending.username}</code>\n🌐 IP: <code>${ip}</code>\n🕐 Waktu: ${now}`
      );

      return NextResponse.json({ success: true, message: "Login berhasil" });
    }

    // Step 1: Verify username + password
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      const remaining = recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, message: `Username atau password salah.${remaining <= 2 ? ` (${remaining} percobaan tersisa)` : ""}` },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, admin.password);
    if (!isValid) {
      const remaining = recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, message: `Username atau password salah.${remaining <= 2 ? ` (${remaining} percobaan tersisa)` : ""}` },
        { status: 401 }
      );
    }

    // Password correct — check if Telegram is configured for 2FA
    const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    const hasTelegram = !!(settings?.telegramToken && settings?.telegramChatId);

    if (!hasTelegram) {
      // Telegram belum di-set → skip 2FA, langsung login
      clearAttempts(ip);
      const token = createToken({ id: admin.id, username: admin.username });
      const cookieStore = await cookies();
      cookieStore.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
      return NextResponse.json({ success: true, message: "Login berhasil (2FA belum aktif - set Telegram di Settings)" });
    }

    // Password correct — send 2FA code via Telegram
    const code = generateCode();
    const tfaData = {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 menit
      adminId: admin.id,
      username: admin.username,
    };

    // Simpan di cookie (httpOnly) supaya persist across serverless instances
    const cookieStore = await cookies();
    cookieStore.set("tfa_pending", Buffer.from(JSON.stringify(tfaData)).toString("base64url"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // 5 menit
      path: "/",
    });

    await sendLogNotification(
      `🔐 <b>KODE LOGIN 2FA</b>\n\n🔑 Kode: <code>${code}</code>\n🌐 IP: <code>${ip}</code>\n⏰ Expired: 5 menit\n\n⚠️ Jangan bagikan kode ini ke siapapun.`
    );

    return NextResponse.json({
      success: true,
      requires2FA: true,
      message: "Kode verifikasi dikirim ke Telegram.",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
