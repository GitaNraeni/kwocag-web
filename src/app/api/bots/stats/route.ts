import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bots/stats - Public stats (total active rentals + total served)
export async function GET() {
  try {
    const [totalActive, totalServed] = await Promise.all([
      prisma.rental.count({ where: { status: "ACTIVE" } }),
      prisma.rental.count(),
    ]);

    return NextResponse.json({ success: true, totalActive, totalServed });
  } catch {
    return NextResponse.json({ success: true, totalActive: 0, totalServed: 0 });
  }
}
