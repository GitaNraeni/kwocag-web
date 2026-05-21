import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/site - Public site info (nama, logo, contact)
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    const data = settings as any;
    return NextResponse.json({
      success: true,
      data: {
        siteName: data?.siteName || "KWOCAG",
        siteLogo: data?.siteLogo || null,
        contactWhatsapp: data?.contactWhatsapp || null,
        contactTelegram: data?.contactTelegram || null,
        channelWhatsapp: data?.channelWhatsapp || null,
        adminFee: data?.adminFee || 0,
        adminFeePercent: data?.adminFeePercent || 0,
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: { siteName: "KWOCAG", siteLogo: null, contactWhatsapp: null },
    });
  }
}
