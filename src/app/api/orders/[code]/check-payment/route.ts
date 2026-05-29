import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTransactionDetail, cancelTransaction } from "@/lib/pakasir";
import { sendTelegramNotification, formatPaymentSuccess } from "@/lib/telegram";
import { calculateExpiryDate, getDurationLabel } from "@/lib/utils";

// GET /api/orders/[code]/check-payment - Poll payment status (Pakasir/RamaShop)
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

    // Kalau sudah success/expired/cancelled, langsung return
    if (order.status !== "PENDING") {
      return NextResponse.json({ success: true, status: order.status });
    }

    // Auto-cancel kalau udah > 5 menit
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (order.createdAt < fiveMinAgo) {
      // Cancel di payment gateway
      await cancelTransaction(order.paymentId || code, order.totalPrice);
      // Update status
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "EXPIRED" },
      });
      await prisma.orderLog.create({
        data: { orderId: order.id, action: "AUTO_EXPIRED", details: "Order expired otomatis (lebih dari 5 menit)" },
      });
      return NextResponse.json({ success: true, status: "EXPIRED" });
    }

    // Poll ke payment gateway (Pakasir atau RamaShop)
    // Untuk RamaShop, perlu pake paymentId (depositId), bukan orderCode
    const pollId = order.paymentId || code;
    const detail = await getTransactionDetail(pollId, order.totalPrice);

    if (!detail) {
      return NextResponse.json({ success: true, status: "PENDING" });
    }

    // Extract status dari response Pakasir
    let txStatus = "";
    if (detail.transaction?.status) txStatus = detail.transaction.status.toLowerCase();
    else if (detail.status) txStatus = detail.status.toLowerCase();
    else if (detail.data?.status) txStatus = detail.data.status.toLowerCase();

    if (txStatus === "completed" || txStatus === "paid" || txStatus === "success" || txStatus === "settlement") {
      // Payment berhasil - set order SUCCESS
      const now = new Date();
      const expiresAt = calculateExpiryDate(now, order.duration, order.customDays);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "SUCCESS",
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

      return NextResponse.json({ success: true, status: "SUCCESS" });
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
