import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/bot-integration/sync - Bot push data sewa dari JSON ke website
// Ini supaya sewa manual (via command bot) juga tampil di dashboard website
// Body: { botTypeSlug, entries: [{ groupId, groupLink, expired, contactPhone? }] }
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
        // Update expiresAt, groupLink, dan notes (nama grup)
        const newExpiry = new Date(expired);
        const updates: Record<string, unknown> = {};
        if (existing.expiresAt?.getTime() !== newExpiry.getTime()) updates.expiresAt = newExpiry;
        if (groupName && existing.notes !== groupName) updates.notes = groupName;
        if (groupLink && groupLink.startsWith("http") && existing.groupLink !== groupLink) updates.groupLink = groupLink;
        // Hitung customDays
        const days = Math.ceil((newExpiry.getTime() - Date.now()) / 86400000);
        if (days > 0) updates.customDays = days;
        if (Object.keys(updates).length > 0) {
          await prisma.order.update({ where: { id: existing.id }, data: updates });
        }
      } else {
        // Buat order baru (dari sync bot)
        const orderCode = `SYNC-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
        const expiryDate = new Date(expired);
        const days = Math.ceil((expiryDate.getTime() - Date.now()) / 86400000);
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

    return NextResponse.json({ success: true, message: `Synced ${synced} new entries` });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
