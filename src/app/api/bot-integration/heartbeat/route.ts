import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/bot-integration/heartbeat
 * Dipanggil bot tiap sync untuk tanda masih hidup
 * Body: { instance: number, botTypeSlug: string }
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { instance, botTypeSlug } = await req.json();
    if (!instance || !botTypeSlug) {
      return NextResponse.json({ success: false, message: "instance dan botTypeSlug wajib diisi" }, { status: 400 });
    }

    const id = `instance_${instance}_${botTypeSlug}`;

    await (prisma as any).botHeartbeat.upsert({
      where: { id },
      update: { lastSeen: new Date() },
      create: { id, instance: parseInt(instance), botTypeSlug, lastSeen: new Date() },
    });

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[heartbeat] Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

/**
 * GET /api/bot-integration/heartbeat
 * Cek status heartbeat semua instance
 */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const heartbeats = await (prisma as any).botHeartbeat.findMany();
    return NextResponse.json({ success: true, heartbeats });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
