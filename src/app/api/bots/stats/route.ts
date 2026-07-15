import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bots/stats - Public stats (total active rentals + total served)
// Cache 5 menit — angka statistik tidak perlu real-time
export async function GET() {
  try {
    const [totalActive, totalServed] = await Promise.all([
      prisma.rental.count({ where: { status: "ACTIVE" } }),
      prisma.rental.count(),
    ]);

    const response = NextResponse.json({ success: true, totalActive, totalServed });
    // Cache 5 menit di Vercel Edge — hemat DB query & function invocations
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
    return response;
  } catch {
    return NextResponse.json({ success: true, totalActive: 0, totalServed: 0 });
  }
}
