import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanGroupLink, getGroupInviteCode } from "@/lib/sanitize";

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

  // 🔥 ANTISIPASI LU: Proses filter pintar pakai Kode Invite biar mengunci data Rental / ID Grup yang sama!
  const filteredOrders = [];

  for (const o of orders) {
    const cleanLink = o.groupLink ? cleanGroupLink(o.groupLink) : "";
    const inviteCode = getGroupInviteCode(cleanLink);

    // Auto-update link bersih ke database orderan biar sinkron
    if (cleanLink && cleanLink !== o.groupLink) {
      await prisma.order.update({
        where: { id: o.id },
        data: { groupLink: cleanLink }
      });
      o.groupLink = cleanLink;
    }

    // 2. PENCARIAN PINTAR: Cari di database Rental apakah kode invite ini sudah punya JID/ID Group aktif
    let existingRental = null;
    
    if (inviteCode) {
      existingRental = await prisma.rental.findFirst({
        where: {
          groupLink: { contains: inviteCode },
          botTypeId: o.botTypeId,
          status: "ACTIVE"
        }
      });
    }

    // 3. KEPUTUSAN SISTEM (BYPASS ATAU JOIN)
    if (existingRental) {
      // 🌸 JALUR PERPANJANG OTOMATIS: Langsung kunci data berdasarkan row ID Rental/ID Group aslinya!
      await (prisma.rental.update as any)({
        where: { id: existingRental.id },
        data: {
          expiresAt: o.expiresAt,
          isPremium: o.isPremium,
          botInstance: o.botInstance,
          // Kalau tautan yang diinput baru, update sekalian biar data link di web makin segar
          groupLink: cleanLink.startsWith("http") ? cleanLink : existingRental.groupLink,
        },
      });

      // Hubungkan ID orderan ini ke rental lama yang sudah ada di database Neon
      await prisma.order.update({ where: { id: o.id }, data: { rentalId: existingRental.id } });

      // Catat log sukses EXTEND di sistem web biar admin tahu ini perpanjangan auto sukses
      await prisma.orderLog.create({
        data: { 
          orderId: o.id, 
          action: "BOT_EXTENDED", 
          details: `Sewa diperpanjang otomatis via ID Group lama [${existingRental.groupId}]: ${existingRental.groupName || "grup"}` 
        },
      });
      
      // Lewati, jangan dilempar ke bot! (Bypass perintah join biar gak memicu limit restricted)
      continue;
    }

    // 4. Kalau bener-bener bersih gak ada di record Rental lama, fix ini SEWA BARU (Masukkan ke antrean bot)
    filteredOrders.push(o);
  }

  return NextResponse.json({
    success: true,
    data: filteredOrders.map((o) => ({
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

    // Bikin atau update Rental kalau groupId dikirim (Untuk kasir baru manual atau backup)
    if (groupId) {
      const groupIdClean = groupId.replace("@g.us", "");
      const existing = await prisma.rental.findUnique({
        where: { groupId_botTypeId: { groupId: groupIdClean, botTypeId: order.botTypeId } },
      });

      if (existing) {
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