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
  "/_next",
  "/favicon.ico",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Loloskan jalur yang tidak perlu dicek
  if (BYPASS_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  try {
    // Membaca domain asli dari server hosting (Vercel/dll)
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
    
    // Bentuk URL yang absolut dan akurat
    const apiUrl = `${protocol}://${host}/api/site`;

    const res = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      
      // Jika status maintenance aktif di database, lakukan redirect
      if (data?.data?.maintenance === true) {
        return NextResponse.redirect(new URL("/maintenance", req.url));
      }
    }
  } catch (error) {
    // Lanjutkan jika API benar-benar sedang down agar web tidak blank
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};