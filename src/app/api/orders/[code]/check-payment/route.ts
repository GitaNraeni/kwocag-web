import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTransactionDetail, cancelTransaction } from "@/lib/pakasir";
import { sendTelegramNotification, formatPaymentSuccess } from "@/lib/telegram";
import { calculateExpiryDate, getDurationLabel } from "@/lib/utils";
import { getGroupInviteCode } from "@/lib/sanitize";

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

    // Auto-cancel kalau udah > 15 menit (QR QRIS valid 15 menit)
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (order.createdAt < fifteenMinAgo) {
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
    console.log(`[CheckPayment] Polling ${code} with paymentId: ${pollId}`);
    const detail = await getTransactionDetail(pollId, order.totalPrice);

    if (!detail) {
      console.log(`[CheckPayment] ${code}: No response from payment gateway (timeout/error)`);
      return NextResponse.json({ success: true, status: "PENDING" });
    }

    // Extract status dari response
    let txStatus = "";
    if (detail.transaction?.status) txStatus = detail.transaction.status.toLowerCase();
    else if (detail.status) txStatus = detail.status.toLowerCase();
    else if (detail.data?.status) txStatus = detail.data.status.toLowerCase();

    console.log(`[CheckPayment] ${code}: txStatus = "${txStatus}"`);


    if (txStatus === "completed" || txStatus === "paid" || txStatus === "success" || txStatus === "settlement") {
      // Payment berhasil - set order SUCCESS
      const now = new Date();
      const inviteCode = getGroupInviteCode(order.groupLink);

      const activeRental = inviteCode
        ? await prisma.rental.findFirst({
            where: {
              groupLink: { contains: inviteCode },
              botTypeId: order.botTypeId,
              status: "ACTIVE",
              expiresAt: { gt: now },
            },
            orderBy: { expiresAt: "desc" },
          })
        : null;

      const baseDate = activeRental?.expiresAt || now;
      const expiresAt = calculateExpiryDate(baseDate, order.duration, order.customDays);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "SUCCESS",
          paidAt: now,
          expiresAt,
          rentalId: activeRental?.id || order.rentalId,
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
