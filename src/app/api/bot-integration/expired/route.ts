import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bot-integration/expired - List order yang sudah expired (bot perlu leave grup)
// Script bot polling ini untuk tau grup mana yang perlu di-leave
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  // Cari order yang perlu di-leave:
  // 1. Status ACTIVE tapi sudah lewat expiresAt (expired natural)
  // 2. Status CANCELLED tapi bot belum leave (dibatalkan admin)
  const now = new Date();
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        {
          status: "ACTIVE",
          expiresAt: { lt: now },
          logs: { none: { action: "BOT_LEFT" } },
        },
        {
          status: "CANCELLED",
          logs: {
            some: { action: "BOT_JOINED" }, // bot pernah join
            none: { action: "BOT_LEFT" },   // tapi belum leave
          },
        },
      ],
    },
    include: { botType: true },
  });

  return NextResponse.json({
    success: true,
    data: orders.map((o) => ({
      orderId: o.id,
      orderCode: o.orderCode,
      botType: o.botType.slug,
      groupLink: o.groupLink,
      expiresAt: o.expiresAt,
      contactPhone: o.contactPhone,
    })),
  });
}

// POST /api/bot-integration/expired - Konfirmasi bot sudah leave & update status
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId wajib diisi" },
        { status: 400 }
      );
    }

    // Update status dan log
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order && order.status === "ACTIVE") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "EXPIRED" },
      });
    }

    await prisma.orderLog.create({
      data: {
        orderId,
        action: "BOT_LEFT",
        details: "Bot sudah leave dari grup",
      },
    });

    return NextResponse.json({ success: true, message: "Marked as left & expired" });
  } catch (error) {
    console.error("Expired confirm error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
