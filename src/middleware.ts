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

  // Cek maintenance mode via API (cached di edge)
  try {
    const siteUrl = new URL("/api/site", req.url);
    const res = await fetch(siteUrl, { next: { revalidate: 30 } });
    const data = await res.json();

    if (data.success && data.data.maintenance) {
      const maintenanceUrl = new URL("/maintenance", req.url);
      return NextResponse.redirect(maintenanceUrl);
    }
  } catch {
    // Kalau gagal fetch, jangan block — lanjut aja
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match semua kecuali static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
