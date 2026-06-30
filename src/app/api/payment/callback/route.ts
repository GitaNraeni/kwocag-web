import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramNotification, formatPaymentSuccess, sendLogNotification } from "@/lib/telegram";
import { calculateExpiryDate, getDurationLabel } from "@/lib/utils";
import { getGroupInviteCode } from "@/lib/sanitize";
import { getTransactionDetail } from "@/lib/pakasir";

// POST /api/payment/callback - Webhook dari Pakasir
// Format payload Pakasir: { order_id, amount, project, status, payment_method, completed_at }
//
// PENTING — SECURITY: body request ini DATANG DARI LUAR dan TIDAK PUNYA signature/
// auth apa pun dari Pakasir. order_id & amount sama-sama bisa diketahui customer
// (ditampilin di halaman order mereka sendiri). Kalau kita langsung percaya
// `status === "completed"` dari body, siapa pun bisa POST manual ke endpoint ini
// dan dapet order gratis tanpa bayar. Makanya status WAJIB diverifikasi ulang
// server-to-server ke Pakasir/Ramashop (pakai getTransactionDetail, otentikasi
// pakai API key kita sendiri) sebelum order di-mark SUCCESS. Body cuma dipakai
// sebagai "trigger" buat ngecek, bukan sumber kebenaran.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, completed_at } = body;

    console.log(`[Pakasir Webhook] ${order_id} - trigger received, verifying with gateway...`);

    // Cari order berdasarkan orderCode (= order_id di Pakasir)
    const order = await prisma.order.findUnique({
      where: { orderCode: order_id },
      include: { botType: true },
    });

    if (!order) {
      console.log(`[Pakasir Webhook] Order not found: ${order_id}`);
      return NextResponse.json({ received: true });
    }

    // Udah diproses sebelumnya — gak perlu verifikasi ulang
    if (order.status === "SUCCESS") {
      return NextResponse.json({ received: true });
    }

    // Verifikasi status ASLI ke payment gateway, jangan percaya body webhook
    const pollId = order.paymentId || order_id;
    const detail = await getTransactionDetail(pollId, order.totalPrice);
    let txStatus = "";
    if (detail?.transaction?.status) txStatus = detail.transaction.status.toLowerCase();
    else if (detail?.status) txStatus = detail.status.toLowerCase();
    else if (detail?.data?.status) txStatus = detail.data.status.toLowerCase();

    const verifiedPaid = ["completed", "paid", "success", "settlement"].includes(txStatus);
    const verifiedFailed = ["expired", "failed", "cancelled"].includes(txStatus);

    // Hanya proses jika status completed (terverifikasi langsung ke gateway)
    if (verifiedPaid) {
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
    } else if (verifiedFailed) {
      if (order.status === "PENDING") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "CANCELLED" },
        });

        await prisma.orderLog.create({
          data: {
            orderId: order.id,
            action: "PAYMENT_FAILED",
            details: `Pembayaran ${txStatus}`,
          },
        });
      }
    } else {
      console.log(`[Pakasir Webhook] ${order_id}: gateway status "${txStatus}" — belum final, nunggu polling/webhook berikutnya`);
    }

    // Selalu respond 200 ke Pakasir
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Payment callback error:", error);
    await sendLogNotification(`❌ <b>PAYMENT CALLBACK ERROR</b>\n\n${(error as Error).message || "Unknown error"}`);
    return NextResponse.json({ received: true });
  }
}