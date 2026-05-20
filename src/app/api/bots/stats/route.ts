import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bots/stats - Public stats (total active subscriptions)
export async function GET() {
  try {
    const totalActive = await prisma.order.count({
      where: { status: "ACTIVE" },
    });

    return NextResponse.json({ success: true, totalActive });
  } catch {
    return NextResponse.json({ success: true, totalActive: 0 });
  }
}
