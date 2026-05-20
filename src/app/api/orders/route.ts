import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPayment, getPaymentUrl } from "@/lib/pakasir";
import { sendTelegramNotification, formatOrderNotification } from "@/lib/telegram";
import { generateOrderCode, getDurationLabel, normalizePhone } from "@/lib/utils";
import { z } from "zod";

const orderSchema = z.object({
  botTypeId: z.string().min(1),
  duration: z.enum(["WEEKLY", "MONTHLY", "CUSTOM"]),
  customDays: z.number().min(1).optional(),
  groupLink: z.string().url("Link grup harus berupa URL valid"),
  contactPhone: z.string().min(1, "No telepon wajib diisi"),
  contactEmail: z.string().email().optional().or(z.literal("")),
});

// POST /api/orders - Buat order baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { botTypeId, duration, customDays, groupLink, contactPhone: rawPhone, contactEmail } = parsed.data;
    const contactPhone = normalizePhone(rawPhone);

    // Cek apakah user masih punya order PENDING (jangan buat baru)
    if (contactPhone) {
      const pendingOrder = await prisma.order.findFirst({
        where: { contactPhone, status: "PENDING" },
      });
      if (pendingOrder) {
        return NextResponse.json(
          { success: false, message: `Kamu masih punya order pending (${pendingOrder.orderCode}). Selesaikan atau batalkan dulu.` },
          { status: 400 }
        );
      }
    }

    // Cari bot type dan harga
    const botType = await prisma.botType.findUnique({
      where: { id: botTypeId },
      include: { prices: true, _count: { select: { orders: { where: { status: "ACTIVE" } } } } },
    });

    if (!botType) {
      return NextResponse.json(
        { success: false, message: "Tipe bot tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cek apakah ini perpanjang (grup sudah punya sewa aktif) — bypass slot check
    const existingActiveOrder = await prisma.order.findFirst({
      where: { groupLink, botTypeId, status: "ACTIVE" },
    });
    const isExtend = !!existingActiveOrder;

    // Cek apakah bot menerima order (skip kalau perpanjang)
    if (!isExtend && !(botType as any).acceptingOrders && (botType as any).acceptingOrders !== undefined) {
      return NextResponse.json(
        { success: false, message: "Bot ini sedang tidak menerima sewa baru" },
        { status: 400 }
      );
    }

    // Cek slot (skip kalau perpanjang — bot sudah di grup)
    const maxSlots = (botType as any).maxSlots || 0;
    if (!isExtend && maxSlots > 0 && botType._count.orders >= maxSlots) {
      return NextResponse.json(
        { success: false, message: "Slot penuh. Bot ini sudah mencapai batas maksimal sewa." },
        { status: 400 }
      );
    }

    // Cari harga sesuai durasi
    const priceRecord = botType.prices.find((p: any) => p.duration === duration);
    if (!priceRecord) {
      return NextResponse.json(
        { success: false, message: "Harga untuk durasi ini belum tersedia" },
        { status: 400 }
      );
    }

    let totalPrice = priceRecord.price;
    // Untuk custom, harga = price per hari * jumlah hari
    if (duration === "CUSTOM" && customDays) {
      totalPrice = priceRecord.price * customDays;
    }

    // Tambah admin fee
    let adminFeeAmount = 0;
    try {
      const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
      const feeFlat = (settings as any)?.adminFee || 0;
      const feePercent = (settings as any)?.adminFeePercent || 0;
      adminFeeAmount = feeFlat + Math.ceil(totalPrice * feePercent / 100);
    } catch { /* skip */ }

    const finalPrice = totalPrice + adminFeeAmount;

    // Auto-assign bot instance (round-robin ke instance yang masih ada slot)
    let assignedInstance = 1;
    const totalInstances = (botType as any).totalInstances || 1;
    if (totalInstances > 1) {
      // Hitung order aktif per instance
      for (let i = 1; i <= totalInstances; i++) {
        const count = await prisma.order.count({
          where: { botTypeId, status: "ACTIVE", botInstance: i },
        });
        const maxPerInstance = (botType as any).maxSlots || 0;
        if (maxPerInstance === 0 || count < maxPerInstance) {
          assignedInstance = i;
          break;
        }
      }
    }

    const orderCode = generateOrderCode();

    // Buat order di database
    const order = await prisma.order.create({
      data: {
        orderCode,
        botTypeId,
        botInstance: assignedInstance,
        duration: duration as "WEEKLY" | "MONTHLY" | "CUSTOM",
        customDays: duration === "CUSTOM" ? customDays : null,
        groupLink,
        contactPhone,
        contactEmail,
        totalPrice: finalPrice,
        status: "PENDING",
      },
    });

    // Buat pembayaran di payment gateway
    const payment = await createPayment({
      orderCode,
      amount: finalPrice,
    });

    const paymentUrl = payment.paymentUrl || payment.qrImage || await getPaymentUrl(finalPrice, orderCode);
    const qrImage = payment.qrImage || null; // Direct QR image (Ramashop)
    const paymentId = payment.paymentId || orderCode;

    // Update order dengan payment info
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: paymentId,
        paymentUrl: paymentUrl,
      },
    });

    // Log
    await prisma.orderLog.create({
      data: {
        orderId: order.id,
        action: "ORDER_CREATED",
        details: `Order dibuat, menunggu pembayaran`,
      },
    });

    // Notifikasi Telegram
    await sendTelegramNotification(
      formatOrderNotification({
        orderCode,
        botTypeName: botType.name,
        duration: getDurationLabel(duration, customDays),
        groupLink,
        contactPhone,
        contactEmail,
        totalPrice: finalPrice,
        status: "PENDING",
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        orderCode,
        paymentUrl,
        qrImage,
        paymentId,
        totalPrice: finalPrice,
        basePrice: totalPrice,
        adminFee: adminFeeAmount,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
