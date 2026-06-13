import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramNotification, formatPaymentSuccess, sendLogNotification } from "@/lib/telegram";
import { calculateExpiryDate, getDurationLabel } from "@/lib/utils";
import { getGroupInviteCode } from "@/lib/sanitize";

// POST /api/payment/callback - Webhook dari Pakasir
// Format payload Pakasir: { order_id, amount, project, status, payment_method, completed_at }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, amount, status, completed_at } = body;

    console.log(`[Pakasir Webhook] ${order_id} - status: ${status}`);

    // Cari order berdasarkan orderCode (= order_id di Pakasir)
    const order = await prisma.order.findUnique({
      where: { orderCode: order_id },
      include: { botType: true },
    });

    if (!order) {
      console.log(`[Pakasir Webhook] Order not found: ${order_id}`);
      return NextResponse.json({ received: true });
    }

    // Hanya proses jika status completed
    if (status === "completed") {
      // Cek apakah sudah diproses
      if (order.status === "SUCCESS") {
        return NextResponse.json({ received: true });
      }

      // Validasi amount
      if (amount !== order.totalPrice) {
        console.log(`[Pakasir Webhook] Amount mismatch: expected ${order.totalPrice}, got ${amount}`);
      }

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

      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "SUCCESS",
          paidAt: completed_at ? new Date(completed_at) : now,
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
    } else if (status === "expired" || status === "failed" || status === "cancelled") {
      if (order.status === "PENDING") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "CANCELLED" },
        });

        await prisma.orderLog.create({
          data: {
            orderId: order.id,
            action: "PAYMENT_FAILED",
            details: `Pembayaran ${status}`,
          },
        });
      }
    }

    // Selalu respond 200 ke Pakasir
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Payment callback error:", error);
    await sendLogNotification(`❌ <b>PAYMENT CALLBACK ERROR</b>\n\n${(error as Error).message || "Unknown error"}`);
    return NextResponse.json({ received: true });
  }
}
