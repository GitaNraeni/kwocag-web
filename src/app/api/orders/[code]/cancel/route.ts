import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelTransaction } from "@/lib/pakasir";

// POST /api/orders/[code]/cancel - Batalkan order (user)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const order = await prisma.order.findUnique({ where: { orderCode: code } });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order tidak ditemukan" }, { status: 404 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json({ success: false, message: "Order tidak bisa dibatalkan" }, { status: 400 });
    }

    // Cancel di Pakasir
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json({ success: false, message: "Gagal membatalkan" }, { status: 500 });
  }
}
