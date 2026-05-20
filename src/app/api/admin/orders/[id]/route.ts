import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendTelegramNotification } from "@/lib/telegram";
import { calculateExpiryDate, getDurationLabel } from "@/lib/utils";

// PUT /api/admin/orders/[id] - Update order (perpanjang, ubah status, dll)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { action, notes } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { botType: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    switch (action) {
      case "activate": {
        // Aktivasi manual oleh admin
        const now = new Date();
        const expiresAt = calculateExpiryDate(now, order.duration, order.customDays);

        await prisma.order.update({
          where: { id },
          data: { status: "ACTIVE", paidAt: now, expiresAt },
        });

        await prisma.orderLog.create({
          data: {
            orderId: id,
            action: "ADMIN_ACTIVATE",
            details: `Diaktifkan manual oleh admin. Aktif sampai ${expiresAt.toLocaleDateString("id-ID")}`,
          },
        });

        await sendTelegramNotification(
          `<b>Order Diaktifkan (Manual)</b>\n${order.orderCode}\n${order.botType.name}\nSampai: ${expiresAt.toLocaleDateString("id-ID")}`
        );
        break;
      }

      case "extend": {
        // Perpanjang sewa
        const { duration, customDays } = body;
        const baseDate = order.expiresAt || new Date();
        const newExpiry = calculateExpiryDate(baseDate, duration || order.duration, customDays || order.customDays);

        await prisma.order.update({
          where: { id },
          data: { expiresAt: newExpiry, status: "ACTIVE" },
        });

        await prisma.orderLog.create({
          data: {
            orderId: id,
            action: "ADMIN_EXTEND",
            details: `Diperpanjang sampai ${newExpiry.toLocaleDateString("id-ID")}`,
          },
        });

        await sendTelegramNotification(
          `<b>Sewa Diperpanjang</b>\n${order.orderCode}\n${order.botType.name}\nSampai: ${newExpiry.toLocaleDateString("id-ID")}`
        );
        break;
      }

      case "cancel": {
        await prisma.order.update({
          where: { id },
          data: { status: "CANCELLED" },
        });

        await prisma.orderLog.create({
          data: {
            orderId: id,
            action: "ADMIN_CANCEL",
            details: notes || "Dibatalkan oleh admin",
          },
        });
        break;
      }

      case "expire": {
        await prisma.order.update({
          where: { id },
          data: { status: "EXPIRED" },
        });

        await prisma.orderLog.create({
          data: {
            orderId: id,
            action: "ADMIN_EXPIRE",
            details: "Ditandai expired oleh admin",
          },
        });
        break;
      }

      default:
        return NextResponse.json(
          { success: false, message: "Action tidak valid" },
          { status: 400 }
        );
    }

    const updated = await prisma.order.findUnique({
      where: { id },
      include: { botType: true, logs: { orderBy: { createdAt: "desc" }, take: 5 } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, message: "Gagal update order" },
      { status: 500 }
    );
  }
}
