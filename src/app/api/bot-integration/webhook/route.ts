import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bot-integration/webhook - Ambil order yang sudah SUCCESS tapi belum di-join bot
// Query params:
//   ?instance=1 → hanya ambil order untuk bot instance 1
//   ?slug=bot-store → hanya ambil order untuk tipe bot tertentu
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const instance = searchParams.get("instance");
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ success: true, data: [] });
  }

  const where: Record<string, unknown> = {
    status: "SUCCESS",
    logs: { none: { action: { in: ["BOT_JOINED", "BOT_EXTENDED", "BOT_FAILED"] } } },
    botType: { slug },
  };

  if (instance) {
    where.botInstance = parseInt(instance);
  }

  const orders = await prisma.order.findMany({
    where,
    include: { botType: true },
    orderBy: [{ isPremium: "desc" }, { paidAt: "asc" }],
  });

  return NextResponse.json({
    success: true,
    data: orders.map((o) => ({
      orderId: o.id,
      orderCode: o.orderCode,
      botType: o.botType.slug,
      botTypeName: o.botType.name,
      botInstance: o.botInstance || 1,
      groupLink: o.groupLink,
      expiresAt: o.expiresAt,
      contactPhone: o.contactPhone,
      isPremium: o.isPremium || false,
    })),
  });
}

// POST /api/bot-integration/webhook - Konfirmasi bot sudah join grup + bikin Rental
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, groupName, groupId, isExtend, failed, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: "orderId wajib diisi" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { botType: true },
    });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order tidak ditemukan" }, { status: 404 });
    }

    // Handle failed order — bot nggak bisa join (kicked, link invalid, dll)
    if (failed) {
      await prisma.orderLog.create({
        data: { orderId, action: "BOT_FAILED", details: reason || "Bot gagal join grup" },
      });
      await prisma.order.update({
        where: { id: orderId },
        data: { notes: `FAILED: ${reason || "Bot gagal join"}` },
      });
      return NextResponse.json({ success: true, message: "Marked as failed" });
    }

    // Update order notes
    if (groupName) {
      await prisma.order.update({ where: { id: orderId }, data: { notes: groupName } });
    }

    // Bikin atau update Rental kalau groupId dikirim
    if (groupId) {
      const groupIdClean = groupId.replace("@g.us", "");
      const existing = await prisma.rental.findUnique({
        where: { groupId_botTypeId: { groupId: groupIdClean, botTypeId: order.botTypeId } },
      });

      if (existing) {
        // Update/perpanjang — isPremium ikut order terakhir (bukan sticky)
        await (prisma.rental.update as any)({
          where: { id: existing.id },
          data: {
            status: "ACTIVE",
            expiresAt: order.expiresAt,
            groupName: groupName || existing.groupName,
            groupLink: order.groupLink.startsWith("http") ? order.groupLink : existing.groupLink,
            isPremium: order.isPremium,
            botInstance: order.botInstance,
          },
        });
        await prisma.order.update({ where: { id: orderId }, data: { rentalId: existing.id } });
      } else {
        // Bikin rental baru
        const rental = await (prisma.rental.create as any)({
          data: {
            groupId: groupIdClean,
            groupName: groupName || null,
            groupLink: order.groupLink.startsWith("http") ? order.groupLink : null,
            botTypeId: order.botTypeId,
            botInstance: order.botInstance,
            status: "ACTIVE",
            source: "WEBSITE",
            isPremium: order.isPremium,
            expiresAt: order.expiresAt,
            contactPhone: order.contactPhone,
          },
        });
        await prisma.order.update({ where: { id: orderId }, data: { rentalId: rental.id } });
      }
    }

    await prisma.orderLog.create({
      data: { orderId, action: isExtend ? "BOT_EXTENDED" : "BOT_JOINED", details: isExtend ? `Sewa diperpanjang: ${groupName || "grup"}` : (groupName ? `Bot join: ${groupName}` : "Bot berhasil join ke grup") },
    });

    return NextResponse.json({ success: true, message: "Marked as joined" });
  } catch (error) {
    console.error("Webhook confirm error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
