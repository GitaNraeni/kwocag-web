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

  // WAJIB kirim slug — supaya bot hanya ambil order untuk tipe-nya sendiri
  if (!slug) {
    return NextResponse.json({
      success: true,
      data: [], // Gak return apa-apa kalau gak ada slug filter
    });
  }

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    logs: { none: { action: "BOT_JOINED" } },
    botType: { slug }, // FILTER BY SLUG — ini yang bikin bot cuma ambil order tipe-nya
  };

  // Filter by instance number
  if (instance) {
    where.botInstance = parseInt(instance);
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
    const { orderId, groupName } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: "orderId wajib diisi" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order tidak ditemukan" }, { status: 404 });
    }

    // Simpan nama grup ke notes
    const updates: Record<string, unknown> = {};
    if (groupName) updates.notes = groupName;

    if (Object.keys(updates).length > 0) {
      await prisma.order.update({ where: { id: orderId }, data: updates });
    }

    await prisma.orderLog.create({
      data: { orderId, action: "BOT_JOINED", details: groupName ? `Bot join: ${groupName}` : "Bot berhasil join ke grup" },
    });

    return NextResponse.json({ success: true, message: "Marked as joined" });
  } catch (error) {
    console.error("Webhook confirm error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
