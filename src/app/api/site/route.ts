import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/site - Public site info (nama, logo, contact, banner)
// Cache 5 menit di Vercel Edge — data jarang berubah, tidak perlu fresh tiap request
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
    // Cache 5 menit — site settings jarang berubah
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
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
