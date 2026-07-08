import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/admin/banner
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const data = settings as any;

  return NextResponse.json({
    success: true,
    data: {
      bannerEnabled: data?.bannerEnabled || false,
      bannerImage: data?.bannerImage || "",
      bannerTitle: data?.bannerTitle || "",
      bannerText: data?.bannerText || "",
      bannerLink: data?.bannerLink || "",
      bannerLinkLabel: data?.bannerLinkLabel || "",
    },
  });
}

// PUT /api/admin/banner
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { bannerEnabled, bannerImage, bannerTitle, bannerText, bannerLink, bannerLinkLabel } = await req.json();

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {
      ...(bannerEnabled !== undefined && { bannerEnabled: Boolean(bannerEnabled) }),
      ...(bannerImage !== undefined && { bannerImage }),
      ...(bannerTitle !== undefined && { bannerTitle }),
      ...(bannerText !== undefined && { bannerText }),
      ...(bannerLink !== undefined && { bannerLink }),
      ...(bannerLinkLabel !== undefined && { bannerLinkLabel }),
    },
    create: {
      id: "main",
      siteName: "KWOCAG",
      bannerEnabled: Boolean(bannerEnabled),
      bannerImage: bannerImage || null,
      bannerTitle: bannerTitle || null,
      bannerText: bannerText || null,
      bannerLink: bannerLink || null,
      bannerLinkLabel: bannerLinkLabel || null,
    },
  });

  return NextResponse.json({ success: true, message: "Pengumuman tersimpan" });
}
