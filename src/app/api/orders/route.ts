import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPayment, getPaymentUrl } from "@/lib/pakasir";
import { sendTelegramNotification, formatOrderNotification } from "@/lib/telegram";
import { generateOrderCode, getDurationLabel, normalizePhone } from "@/lib/utils";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizePhone, sanitizeUrl, sanitizeEmail, sanitizeText } from "@/lib/sanitize";
import { z } from "zod";

const orderSchema = z.object({
  botTypeId: z.string().min(1),
  duration: z.enum(["WEEKLY", "MONTHLY", "CUSTOM"]),
  tier: z.enum(["basic", "premium"]).default("basic"),
  customDays: z.number().min(1).optional(),
  groupLink: z.string().url("Link grup harus berupa URL valid"),
  contactPhone: z.string().min(1, "No telepon wajib diisi"),
  contactEmail: z.string().email().optional().or(z.literal("")),
});

// POST /api/orders - Buat order baru
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req);
    const { limited, resetIn } = checkRateLimit(`order:${ip}`, RATE_LIMITS.ORDER);
    if (limited) {
      return NextResponse.json(
        { success: false, message: `Terlalu banyak request. Coba lagi dalam ${Math.ceil(resetIn / 1000)} detik.` },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Sanitize inputs before validation
    if (body.contactPhone) body.contactPhone = sanitizePhone(body.contactPhone);
    if (body.contactEmail) body.contactEmail = sanitizeEmail(body.contactEmail);
    if (body.groupLink) body.groupLink = sanitizeUrl(body.groupLink);

    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { botTypeId, duration, tier, customDays, groupLink, contactPhone: rawPhone, contactEmail } = parsed.data;
    const contactPhone = normalizePhone(rawPhone);
    const isPremium = tier === "premium";

    // Cek apakah user masih punya order PENDING
    if (contactPhone) {
      const pendingOrder = await prisma.order.findFirst({
        where: { contactPhone, status: "PENDING" },
      });
      if (pendingOrder) {
        // Kalau pending udah > 15 menit, auto-cancel
        const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
        if (pendingOrder.createdAt < fifteenMinAgo) {
          await prisma.order.update({
            where: { id: pendingOrder.id },
            data: { status: "EXPIRED" },
          });
        } else {
          return NextResponse.json(
            { success: false, message: `Kamu masih punya order pending (${pendingOrder.orderCode}). Selesaikan atau tunggu 5 menit.` },
            { status: 400 }
          );
        }
      }
    }

    // Cari bot type dan harga
    const botType = await prisma.botType.findUnique({
      where: { id: botTypeId },
      include: { prices: true, _count: { select: { rentals: { where: { status: "ACTIVE" } } } } },
    });

    if (!botType) {
      return NextResponse.json(
        { success: false, message: "Tipe bot tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cek apakah bot aktif — kalau isActive false, tolak semua order (termasuk perpanjang)
    if (!(botType as any).isActive) {
      return NextResponse.json(
        { success: false, message: "Bot ini sedang tidak aktif" },
        { status: 400 }
      );
    }

    // Cek apakah ini perpanjang (grup sudah punya sewa aktif) — bypass slot check
    const existingRental = await prisma.rental.findFirst({
      where: { groupLink, botTypeId, status: "ACTIVE" },
    });
    const isExtend = !!existingRental;

    // Cek apakah bot menerima order (skip kalau perpanjang)
    if (!isExtend && !(botType as any).acceptingOrders && (botType as any).acceptingOrders !== undefined) {
      return NextResponse.json(
        { success: false, message: "Bot ini sedang tidak menerima sewa baru" },
        { status: 400 }
      );
    }

    // Cek slot (skip kalau perpanjang — bot sudah di grup)
    const maxSlots = (botType as any).maxSlots || 0;
    const totalInstances = (botType as any).totalInstances || 1;
    const totalCapacity = maxSlots * totalInstances;
    if (!isExtend && maxSlots > 0 && botType._count.rentals >= totalCapacity) {
      return NextResponse.json(
        { success: false, message: "Slot penuh. Bot ini sudah mencapai batas maksimal sewa." },
        { status: 400 }
      );
    }

    // Cari harga sesuai durasi dan tier
    const priceRecord = botType.prices.find((p: any) => p.duration === duration && p.tier === tier);
    if (!priceRecord) {
      // Fallback: cari tanpa tier filter (untuk bot yang ga punya premium)
      const fallbackPrice = botType.prices.find((p: any) => p.duration === duration);
      if (!fallbackPrice) {
        return NextResponse.json(
          { success: false, message: "Harga untuk durasi ini belum tersedia" },
          { status: 400 }
        );
      }
      // Use fallback
      var selectedPrice = fallbackPrice;
    } else {
      var selectedPrice = priceRecord;
    }

    let totalPrice = selectedPrice.price;
    // Untuk custom, harga = price per hari * jumlah hari
    if (duration === "CUSTOM" && customDays) {
      totalPrice = selectedPrice.price * customDays;
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
    if (totalInstances > 1) {
      // Hitung rental aktif per instance
      for (let i = 1; i <= totalInstances; i++) {
        const count = await prisma.rental.count({
          where: { botTypeId, status: "ACTIVE" },
        });
        // Bagi rata: kalau total aktif / totalInstances < maxSlots, assign ke instance ini
        const countPerInstance = Math.ceil(count / totalInstances);
        const maxPerInstance = (botType as any).maxSlots || 0;
        if (maxPerInstance === 0 || countPerInstance < maxPerInstance) {
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
        isPremium,
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

    // Kalau payment gateway gagal, cancel order dan return error
    if (!payment.success) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
      await prisma.orderLog.create({
        data: { orderId: order.id, action: "PAYMENT_FAILED", details: payment.message || "Payment gateway error" },
      });
      return NextResponse.json(
        { success: false, message: payment.message || "Gagal membuat pembayaran. Coba lagi." },
        { status: 500 }
      );
    }

    const paymentUrl = payment.paymentUrl || payment.qrImage || await getPaymentUrl(finalPrice, orderCode);
    const qrImage = payment.qrImage || null;
    const paymentId = payment.paymentId || orderCode;

    // Kalau paymentUrl masih kosong, cancel order
    if (!paymentUrl) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json(
        { success: false, message: "QR pembayaran tidak tersedia. Periksa konfigurasi payment gateway." },
        { status: 500 }
      );
    }

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
