import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/site - Public site info (nama, logo, contact)
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    return NextResponse.json({
      success: true,
      data: {
        siteName: settings?.siteName || "KWOCAG",
        siteLogo: settings?.siteLogo || null,
        contactWhatsapp: settings?.contactWhatsapp || null,
        contactTelegram: settings?.contactTelegram || null,
        adminFee: settings?.adminFee || 0,
        adminFeePercent: settings?.adminFeePercent || 0,
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: { siteName: "KWOCAG", siteLogo: null, contactWhatsapp: null },
    });
  }
}
