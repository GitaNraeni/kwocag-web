import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTransactionDetail } from "@/lib/pakasir";
import { sendTelegramNotification, formatPaymentSuccess } from "@/lib/telegram";
import { calculateExpiryDate, getDurationLabel } from "@/lib/utils";

// GET /api/orders/[code]/check-payment - Poll payment status dari Pakasir
export async function GET(
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
      return NextResponse.json({ success: false, status: "not_found" });
    }

    // Kalau sudah active/expired/cancelled, langsung return
    if (order.status !== "PENDING") {
      return NextResponse.json({ success: true, status: order.status });
    }

    // Poll ke Pakasir
    const detail = await getTransactionDetail(code, order.totalPrice);

    if (!detail) {
      return NextResponse.json({ success: true, status: "PENDING" });
    }

    // Extract status dari response Pakasir
    let txStatus = "";
    if (detail.transaction?.status) txStatus = detail.transaction.status.toLowerCase();
    else if (detail.status) txStatus = detail.status.toLowerCase();
    else if (detail.data?.status) txStatus = detail.data.status.toLowerCase();

    if (txStatus === "completed" || txStatus === "paid" || txStatus === "success" || txStatus === "settlement") {
      // Payment berhasil - activate order
      const now = new Date();
      const expiresAt = calculateExpiryDate(now, order.duration, order.customDays);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "ACTIVE",
          paidAt: now,
          expiresAt,
        },
      });

      await prisma.orderLog.create({
        data: {
          orderId: order.id,
          action: "PAYMENT_SUCCESS",
          details: `Pembayaran berhasil. Aktif sampai ${expiresAt.toLocaleDateString("id-ID")}`,
        },
      });

      await sendTelegramNotification(
        formatPaymentSuccess({
          orderCode: order.orderCode,
          botTypeName: order.botType.name,
          duration: getDurationLabel(order.duration, order.customDays),
          groupLink: order.groupLink,
          totalPrice: order.totalPrice,
          expiresAt: expiresAt.toLocaleDateString("id-ID"),
        })
      );

      return NextResponse.json({ success: true, status: "ACTIVE" });
    }

    if (txStatus === "expired" || txStatus === "failed" || txStatus === "cancelled") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json({ success: true, status: "CANCELLED" });
    }

    return NextResponse.json({ success: true, status: "PENDING" });
  } catch (error) {
    console.error("Check payment error:", error);
    return NextResponse.json({ success: true, status: "PENDING" });
  }
}
