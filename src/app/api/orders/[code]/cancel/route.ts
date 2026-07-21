import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelTransaction } from "@/lib/pakasir";
import { sendTelegramNotification, formatOrderCancelled } from "@/lib/telegram";

// POST /api/orders/[code]/cancel - Batalkan order (user)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const order = await prisma.order.findUnique({
      where: { orderCode: code },
      include: { botType: true },
    });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order tidak ditemukan" }, { status: 404 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json({ success: false, message: "Order tidak bisa dibatalkan" }, { status: 400 });
    }

    // Cancel di payment provider
    await cancelTransaction(code, order.totalPrice);

    // Update status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });

    await prisma.orderLog.create({
      data: {
        orderId: order.id,
        action: "USER_CANCEL",
        details: "Dibatalkan oleh user",
      },
    });

    // Notifikasi Telegram
    await sendTelegramNotification(
      formatOrderCancelled({
        orderCode: order.orderCode,
        botTypeName: order.botType.name,
        reason: "Dibatalkan oleh user",
        cancelledBy: "user",
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json({ success: false, message: "Gagal membatalkan" }, { status: 500 });
  }
}
