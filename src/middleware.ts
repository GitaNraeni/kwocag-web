import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BYPASS_PATHS = [
  "/maintenance",
  "/admin",
  "/api/admin",
  "/api/site",
  "/api/bot-integration",
  "/api/cron",
  "/api/payment/callback",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BYPASS_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Cek cookie dulu (fast path — di-set saat admin toggle)
  const cookieVal = req.cookies.get("site_maintenance")?.value;

  let isMaintenance = false;

  if (cookieVal !== undefined) {
    // Cookie ada → pakai langsung
    isMaintenance = cookieVal === "1";
  } else {
    // Cookie belum ada (device lain / fresh visit) → fetch DB via API
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get("host")}`;
      const res = await fetch(`${baseUrl}/api/site`, {
        next: { revalidate: 30 }, // cache 30 detik
      });
      if (res.ok) {
        const data = await res.json();
        isMaintenance = data?.data?.maintenance === true;
      }
    } catch {
      // Kalau fetch gagal, biarkan akses normal
      isMaintenance = false;
    }
  }

  if (isMaintenance) {
    const url = req.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};