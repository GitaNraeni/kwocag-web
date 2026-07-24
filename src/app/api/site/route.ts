import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/site - Public site info (nama, logo, contact, banner)
// PENTING: jangan di-cache. Endpoint ini dipakai halaman /maintenance buat
// polling tiap 10 detik apakah maintenance sudah selesai (lihat
// src/app/maintenance/page.tsx). Kalau di-cache (sebelumnya 5 menit),
// begitu admin matiin maintenance di DB, endpoint ini tetap balikin
// "maintenance: true" yang basi sampai cache-nya expire — makanya
// pengunjung stuck di halaman maintenance walau sudah di-refresh manual.
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    const data = settings as any;
    const response = NextResponse.json({
      success: true,
      data: {
        siteName: data?.siteName || "KWOCAG",
        siteLogo: data?.siteLogo || null,
        siteIcon: data?.siteIcon || null,
        contactWhatsapp: data?.contactWhatsapp || null,
        contactTelegram: data?.contactTelegram || null,
        channelWhatsapp: data?.channelWhatsapp || null,
        adminFee: data?.adminFee || 0,
        adminFeePercent: data?.adminFeePercent || 0,
        maintenance: data?.maintenance || false,
        maintenanceMsg: data?.maintenanceMsg || null,
        bannerEnabled: data?.bannerEnabled || false,
        bannerImage: data?.bannerImage || null,
        bannerTitle: data?.bannerTitle || null,
        bannerText: data?.bannerText || null,
        bannerLink: data?.bannerLink || null,
        bannerLinkLabel: data?.bannerLinkLabel || null,
      },
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.json({
      success: true,
      data: {
        siteName: "KWOCAG",
        siteLogo: null,
        contactWhatsapp: null,
        bannerEnabled: false,
        bannerImage: null,
        bannerLink: null,
      },
    });
  }
}