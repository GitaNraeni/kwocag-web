import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bot-integration/webhook - Ambil order yang baru aktif (belum di-join)
// Query params:
//   ?instance=1 → hanya ambil order untuk bot instance 1
//   ?slug=bot-store → hanya ambil order untuk tipe bot tertentu
// Header: x-api-key
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const instance = searchParams.get("instance");
  const slug = searchParams.get("slug");

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    logs: { none: { action: "BOT_JOINED" } },
  };

  // Filter by instance number
  if (instance) {
    where.botInstance = parseInt(instance);
  }

  // Filter by bot type slug
  if (slug) {
    where.botType = { slug };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { botType: true },
    orderBy: { paidAt: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: orders.map((o) => ({
      orderId: o.id,
      orderCode: o.orderCode,
      botType: o.botType.slug,
      botTypeName: o.botType.name,
      botInstance: (o as any).botInstance || 1,
      groupLink: o.groupLink,
      expiresAt: o.expiresAt,
      contactPhone: o.contactPhone,
    })),
  });
}

// POST /api/bot-integration/webhook - Konfirmasi bot sudah join grup
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: "orderId wajib diisi" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order tidak ditemukan" }, { status: 404 });
    }

    await prisma.orderLog.create({
      data: { orderId, action: "BOT_JOINED", details: "Bot berhasil join ke grup" },
    });

    return NextResponse.json({ success: true, message: "Marked as joined" });
  } catch (error) {
    console.error("Webhook confirm error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
