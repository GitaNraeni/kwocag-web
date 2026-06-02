import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders/[code] - Cek status order (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const order = await prisma.order.findUnique({
      where: { orderCode: code },
      include: {
        botType: true,
        logs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderCode: order.orderCode,
        botType: order.botType.name,
        duration: order.duration,
        customDays: order.customDays,
        groupLink: order.groupLink,
        totalPrice: order.totalPrice,
        status: order.status,
        paymentUrl: order.paymentUrl,
        qrImage: order.qrImage,
        paidAt: order.paidAt,
        expiresAt: order.expiresAt,
        createdAt: order.createdAt,
        logs: order.logs,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
