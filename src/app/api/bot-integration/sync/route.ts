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
      const { groupId, groupLink, expired, contactPhone } = entry;
      if (!groupLink || !expired) continue;

      // Cek apakah sudah ada order aktif untuk grup ini
      const existing = await prisma.order.findFirst({
        where: { groupLink: { contains: groupLink.replace("https://chat.whatsapp.com/", "") }, botTypeId: botType.id, status: "ACTIVE" },
      });

      if (existing) {
        // Update expiresAt kalau beda
        const newExpiry = new Date(expired);
        if (existing.expiresAt?.getTime() !== newExpiry.getTime()) {
          await prisma.order.update({
            where: { id: existing.id },
            data: { expiresAt: newExpiry },
          });
        }
      } else {
        // Buat order baru (dari sync bot)
        const orderCode = `SYNC-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
        await prisma.order.create({
          data: {
            orderCode,
            botTypeId: botType.id,
            duration: "CUSTOM",
            groupLink,
            contactPhone: contactPhone || null,
            totalPrice: 0,
            status: "ACTIVE",
            paidAt: new Date(),
            expiresAt: new Date(expired),
            notes: `Synced from bot (${groupId || "unknown"})`,
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
