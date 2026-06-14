import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths yang TIDAK di-redirect saat maintenance (Versi Lengkap Lu)
const BYPASS_PATHS = [
  "/maintenance",
  "/admin",
  "/api/admin",
  "/api/site",
  "/api/bot-integration",
  "/api/cron",
  "/api/payment/callback",
  "/_next",
  "/favicon.ico",
];

// Kita bikin cache biar gak nembak DB terus-terusan
let maintenanceCache = {
  status: false,
  lastCheck: 0
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Skip bypass paths
  if (BYPASS_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Cek Maintenance (Update cache setiap 30 detik biar gak berat ke DB)
  const now = Date.now();
  if (now - maintenanceCache.lastCheck > 30000) {
    try {
      // PENTING: Pake URL absolute di middleware
      const res = await fetch(`${req.nextUrl.origin}/api/site`, { cache: "no-store" });
      const data = await res.json();
      
      if (data.success) {
        maintenanceCache = {
          status: data.data.maintenance,
          lastCheck: now
        };
      }
    } catch (e) {
      // Kalau fetch gagal, kita pake status TERAKHIR yang kesimpen di cache, jadi gak nembus!
      console.error("Middleware Maintenance Check Failed");
    }
  }

  // 3. Redirect kalau maintenance aktif
  if (maintenanceCache.status) {
    return NextResponse.redirect(new URL("/maintenance", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match semua kecuali static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};