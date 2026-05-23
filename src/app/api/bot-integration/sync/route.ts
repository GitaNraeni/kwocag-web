import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Permanent threshold: kalau expired > 10 tahun dari sekarang, anggap permanent
const PERMANENT_THRESHOLD_YEARS = 10;

function isPermanent(expired: number | string): boolean {
  const expDate = new Date(expired);
  const threshold = new Date();
  threshold.setFullYear(threshold.getFullYear() + PERMANENT_THRESHOLD_YEARS);
  return expDate.getTime() > threshold.getTime();
}

// POST /api/bot-integration/sync - Bot push data sewa dari JSON ke website
// Ini supaya sewa manual (via command bot) juga tampil di dashboard website
// Body: { botTypeSlug, entries: [{ groupId, groupLink, expired, contactPhone?, groupName? }] }
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { botTypeSlug, entries } = await req.json();

    if (!botTypeSlug || !entries || !Array.isArray(entries)) {
      return NextResponse.json({ success: false, message: "botTypeSlug dan entries wajib" }, { status: 400 });
    }

    const botType = await prisma.botType.findUnique({ where: { slug: botTypeSlug } });
    if (!botType) {
      return NextResponse.json({ success: false, message: "Bot type tidak ditemukan" }, { status: 404 });
    }

    let synced = 0;

    for (const entry of entries) {
      const { groupId, groupLink, groupName, expired, contactPhone } = entry;
      if (!expired) continue;

      const permanent = isPermanent(expired);

      // Cek apakah sudah ada order aktif untuk grup ini (dedup agresif)
      const groupIdClean = groupId ? groupId.replace("@g.us", "") : "";

      let existing = null;
      if (groupIdClean) {
        existing = await prisma.order.findFirst({
          where: {
            botTypeId: botType.id,
            status: "ACTIVE",
            OR: [
              { groupLink: { contains: groupIdClean } },
              { notes: { contains: groupIdClean } },
              ...(groupLink && groupLink.startsWith("http") ? [{ groupLink: { contains: groupLink.replace("https://chat.whatsapp.com/", "") } }] : []),
            ],
          },
        });
      }

      if (existing) {
        // Update expiresAt, groupLink, notes, dan contactPhone
        const newExpiry = new Date(expired);
        const updates: Record<string, unknown> = {};
        if (existing.expiresAt?.getTime() !== newExpiry.getTime()) updates.expiresAt = newExpiry;
        if (groupName && existing.notes !== groupName) updates.notes = groupName;
        if (groupLink && groupLink.startsWith("http") && existing.groupLink !== groupLink) updates.groupLink = groupLink;
        if (contactPhone && !existing.contactPhone) updates.contactPhone = contactPhone;
        // Hitung customDays (permanent = 9999)
        if (permanent) {
          updates.customDays = 9999;
          updates.duration = "CUSTOM";
        } else {
          const days = Math.ceil((newExpiry.getTime() - Date.now()) / 86400000);
          if (days > 0) updates.customDays = days;
        }
        if (Object.keys(updates).length > 0) {
          await prisma.order.update({ where: { id: existing.id }, data: updates });
        }
      } else {
        // Buat order baru (dari sync bot)
        const orderCode = `SYNC-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
        const expiryDate = new Date(expired);
        const days = permanent ? 9999 : Math.ceil((expiryDate.getTime() - Date.now()) / 86400000);
        await prisma.order.create({
          data: {
            orderCode,
            botTypeId: botType.id,
            duration: "CUSTOM",
            customDays: days > 0 ? days : 1,
            groupLink: groupLink && groupLink.startsWith("http") ? groupLink : `group://${groupId}`,
            contactPhone: contactPhone || null,
            totalPrice: 0,
            status: "ACTIVE",
            paidAt: new Date(),
            expiresAt: expiryDate,
            notes: groupName || groupId || "Synced",
          },
        });
        synced++;
      }
    }

    // Cleanup: hapus order SYNC yang groupId-nya sudah tidak ada di bot
    // Ini handle case ketika owner hapus sewa manual dari bot
    const syncedGroupIds = entries
      .map((e: { groupId?: string }) => e.groupId?.replace("@g.us", "") || "")
      .filter((id: string) => id.length > 0);

    if (syncedGroupIds.length > 0) {
      // Cari semua order ACTIVE yang dibuat dari sync (orderCode starts with SYNC-)
      const activeSyncOrders = await prisma.order.findMany({
        where: {
          botTypeId: botType.id,
          status: "ACTIVE",
          orderCode: { startsWith: "SYNC-" },
        },
        select: { id: true, groupLink: true, notes: true },
      });

      let expired = 0;
      for (const order of activeSyncOrders) {
        // Extract groupId dari groupLink atau notes
        const linkMatch = order.groupLink?.match(/group:\/\/(\d+)/);
        const groupIdFromLink = linkMatch ? linkMatch[1] : null;

        // Cek apakah groupId masih ada di entries dari bot
        const stillExists = syncedGroupIds.some((id: string) => {
          if (groupIdFromLink && groupIdFromLink.includes(id)) return true;
          if (order.groupLink && order.groupLink.includes(id)) return true;
          if (order.notes && order.notes.includes(id)) return true;
          return false;
        });

        if (!stillExists) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "EXPIRED" },
          });
          expired++;
        }
      }

      if (expired > 0) {
        console.log(`[Sync] Expired ${expired} orders yang sudah tidak ada di bot`);
      }
    }

    return NextResponse.json({ success: true, message: `Synced ${synced} new entries` });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
