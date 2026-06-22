import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

// GET /api/admin/settings
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        id: "main",
        siteName: "KWOCAG",
        pakasirApiKey: process.env.PAKASIR_API_KEY || "",
        pakasirSlug: process.env.PAKASIR_PROJECT_SLUG || "",
        telegramToken: process.env.TELEGRAM_BOT_TOKEN || "",
        telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
        contactWhatsapp: "",
      },
    });
  }

  const admin = await prisma.admin.findUnique({ where: { id: session.id } });

  return NextResponse.json({
    success: true,
    data: {
      siteName: settings.siteName,
      siteLogo: settings.siteLogo,
      pakasirApiKey: settings.pakasirApiKey || "",
      pakasirSlug: settings.pakasirSlug || "",
      ramashopApiKey: (settings as any).ramashopApiKey || "",
      paymentProvider: (settings as any).paymentProvider || "pakasir",
      adminFee: (settings as any).adminFee || 0,
      adminFeePercent: (settings as any).adminFeePercent || 0,
      telegramToken: settings.telegramToken || "",
      telegramChatId: settings.telegramChatId || "",
      telegramLogChatId: (settings as any).telegramLogChatId || "",
      contactWhatsapp: settings.contactWhatsapp || "",
      contactTelegram: (settings as any).contactTelegram || "",
      channelWhatsapp: (settings as any).channelWhatsapp || "",
      maintenance: (settings as any).maintenance || false,
      maintenanceMsg: (settings as any).maintenanceMsg || "",
      username: admin?.username || "",
    },
  });
}

// PUT /api/admin/settings - Update settings
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    siteName,
    siteLogo,
    pakasirApiKey,
    pakasirSlug,
    ramashopApiKey,
    paymentProvider,
    adminFee,
    adminFeePercent,
    telegramToken,
    telegramChatId,
    telegramLogChatId,
    contactWhatsapp,
    contactTelegram,
    channelWhatsapp,
    maintenance,
    maintenanceMsg,
    username,
    currentPassword,
    newPassword,
  } = body;

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {
      ...(siteName !== undefined && { siteName }),
      ...(siteLogo !== undefined && { siteLogo }),
      ...(pakasirApiKey !== undefined && { pakasirApiKey }),
      ...(pakasirSlug !== undefined && { pakasirSlug }),
      ...(ramashopApiKey !== undefined && { ramashopApiKey }),
      ...(paymentProvider !== undefined && { paymentProvider }),
      ...(adminFee !== undefined && { adminFee: Number(adminFee) }),
      ...(adminFeePercent !== undefined && { adminFeePercent: Number(adminFeePercent) }),
      ...(telegramToken !== undefined && { telegramToken }),
      ...(telegramChatId !== undefined && { telegramChatId }),
      ...(telegramLogChatId !== undefined && { telegramLogChatId }),
      ...(contactWhatsapp !== undefined && { contactWhatsapp }),
      ...(contactTelegram !== undefined && { contactTelegram }),
      ...(channelWhatsapp !== undefined && { channelWhatsapp }),
      ...(maintenance !== undefined && { maintenance: Boolean(maintenance) }),
      ...(maintenanceMsg !== undefined && { maintenanceMsg }),
    },
    create: {
      id: "main",
      siteName: siteName || "KWOCAG",
      siteLogo,
      pakasirApiKey,
      pakasirSlug,
      telegramToken,
      telegramChatId,
      contactWhatsapp,
    },
  });

  if (username) {
    await prisma.admin.update({
      where: { id: session.id },
      data: { username },
    });
  }

  if (currentPassword && newPassword) {
    const admin = await prisma.admin.findUnique({ where: { id: session.id } });
    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 });
    }
    const valid = await verifyPassword(currentPassword, admin.password);
    if (!valid) {
      return NextResponse.json({ success: false, message: "Password lama salah" }, { status: 401 });
    }
    const hashed = await hashPassword(newPassword);
    await prisma.admin.update({ where: { id: session.id }, data: { password: hashed } });
  }

  // Set cookie maintenance flag biar middleware bisa baca tanpa fetch
  const response = NextResponse.json({ success: true, message: "Pengaturan tersimpan" });

  if (maintenance !== undefined) {
    response.cookies.set("site_maintenance", maintenance ? "1" : "0", {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}