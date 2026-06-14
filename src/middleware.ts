import { NextRequest, NextResponse } from "next/server";

// Paths yang TIDAK di-redirect saat maintenance
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip bypass paths
  if (BYPASS_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Cek maintenance mode — prioritas cookie (cepat, tanpa fetch)
  const maintenanceCookie = req.cookies.get("x-maintenance")?.value;
  if (maintenanceCookie === "true") {
    const maintenanceUrl = new URL("/maintenance", req.url);
    return NextResponse.redirect(maintenanceUrl);
  }

  // Fallback: cek via API (kalau cookie belum ada/kedaluwarsa)
  try {
    const siteUrl = new URL("/api/site", req.nextUrl.origin);
    const res = await fetch(siteUrl.toString(), {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();

    if (data.success && data.data.maintenance) {
      const maintenanceUrl = new URL("/maintenance", req.url);
      const redirectRes = NextResponse.redirect(maintenanceUrl);
      redirectRes.cookies.set("x-maintenance", "true", {
        path: "/",
        sameSite: "lax",
        maxAge: 60,
      });
      return redirectRes;
    } else if (data.success && !data.data.maintenance && maintenanceCookie === "true") {
      // Maintenance dimatikan — clear cookie biar gak redirect terus
      const nextRes = NextResponse.next();
      nextRes.cookies.set("x-maintenance", "false", {
        path: "/",
        sameSite: "lax",
        maxAge: 0, // hapus cookie
      });
      return nextRes;
    }
  } catch {
    // Gagal fetch → jangan block
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match semua kecuali static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
