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
    let updated = 0;

    for (const entry of entries) {
      const { groupId, groupLink, groupName, expired, contactPhone, isPremium } = entry;
      if (!groupId || !expired) continue;

      const groupIdClean = groupId.replace("@g.us", "");
      const expiryDate = new Date(expired);

      // Cek apakah sudah ada rental untuk grup ini
      const existing = await prisma.rental.findUnique({
        where: { groupId_botTypeId: { groupId: groupIdClean, botTypeId: botType.id } },
      });

      if (existing) {
        // Update data yang berubah
        const updates: Record<string, unknown> = {};
        if (existing.expiresAt?.getTime() !== expiryDate.getTime()) updates.expiresAt = expiryDate;
        if (groupName && existing.groupName !== groupName) updates.groupName = groupName;
        if (groupLink && groupLink.startsWith("http") && existing.groupLink !== groupLink) updates.groupLink = groupLink;
        if (contactPhone && !existing.contactPhone) updates.contactPhone = contactPhone;
        if (existing.status === "ENDED") updates.status = "ACTIVE"; // re-activate kalau di-sewa lagi
        // Sync isPremium dari bot (sewavip/addpremgrub)
        if (typeof isPremium === "boolean" && existing.isPremium !== isPremium) updates.isPremium = isPremium;

        if (Object.keys(updates).length > 0) {
          await prisma.rental.update({ where: { id: existing.id }, data: updates });
          updated++;
        }
      } else {
        // Buat rental baru
        await prisma.rental.create({
          data: {
            groupId: groupIdClean,
            groupName: groupName || null,
            groupLink: groupLink && groupLink.startsWith("http") ? groupLink : null,
            botTypeId: botType.id,
            status: "ACTIVE",
            source: "BOT", // dari sync bot = source BOT (bisa manual atau auto di bot)
            isPremium: isPremium === true,
            expiresAt: expiryDate,
            contactPhone: contactPhone || null,
          },
        });
        synced++;
      }
    }

    // Cleanup: end rentals yang sudah tidak ada di bot
    const syncedGroupIds = entries
      .map((e: { groupId?: string }) => e.groupId?.replace("@g.us", "") || "")
      .filter((id: string) => id.length > 0);

    const activeRentals = await prisma.rental.findMany({
      where: { botTypeId: botType.id, status: "ACTIVE" },
      select: { id: true, groupId: true },
    });

    let endedCount = 0;

    if (syncedGroupIds.length === 0) {
      // Semua sewa dihapus dari bot → end semua
      for (const rental of activeRentals) {
        await prisma.rental.update({ where: { id: rental.id }, data: { status: "ENDED" } });
        endedCount++;
      }
    } else {
      for (const rental of activeRentals) {
        if (!syncedGroupIds.includes(rental.groupId)) {
          await prisma.rental.update({ where: { id: rental.id }, data: { status: "ENDED" } });
          endedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${synced} new, updated ${updated}, ended ${endedCount}`,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
