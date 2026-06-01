/**
 * RESTORE SCRIPT
 * Jalankan: npm run db:restore
 * Restore: admin, site settings, bot types, harga, dan semua rental dari sewa.json
 */

import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Memulai restore...\n");

  // ============ 1. ADMIN ============
  const hashedPassword = crypto.createHash("sha256").update("WaduhWaw").digest("hex");
  await prisma.admin.upsert({
    where: { username: "KukuKaki" },
    update: { password: hashedPassword },
    create: { username: "KukuKaki", password: hashedPassword },
  });
  console.log("✅ Admin: KukuKaki / WaduhWaw");

  // ============ 2. SITE SETTINGS ============
  await (prisma.siteSettings.upsert as any)({
    where: { id: "main" },
    update: {
      siteName: "KWOCAG",
      siteLogo: "https://files.catbox.moe/vms1wj.jpg",
      contactWhatsapp: "62895366006918",
      pakasirApiKey: "chuLlTmvIq3rtp6WxCyglK3VABzHKEih",
      pakasirSlug: "raen",
      telegramToken: "8614783299:AAHz0m9bGSzLGYG8lP24JoY5dhxMCCXJT8U",
      telegramChatId: "-1003612789437",
      paymentProvider: "pakasir",
    },
    create: {
      id: "main",
      siteName: "KWOCAG",
      siteLogo: "https://files.catbox.moe/vms1wj.jpg",
      contactWhatsapp: "62895366006918",
      pakasirApiKey: "chuLlTmvIq3rtp6WxCyglK3VABzHKEih",
      pakasirSlug: "raen",
      telegramToken: "8614783299:AAHz0m9bGSzLGYG8lP24JoY5dhxMCCXJT8U",
      telegramChatId: "-1003612789437",
      paymentProvider: "pakasir",
    },
  });
  console.log("✅ Site settings restored");

  // ============ 3. BOT TYPE: KIMMY ============
  const kimmy = await (prisma.botType.upsert as any)({
    where: { slug: "kimmy" },
    update: {
      name: "Kimmy Bot",
      description: "Bot jaga grup WhatsApp — anti spam, games, absen, dan banyak fitur lainnya.",
      features: ["Anti Spam", "Games", "Absen", "Tag All", "Welcome/Goodbye", "Anti Link"],
      isActive: true,
      maxSlots: 30,
      totalInstances: 2,
      acceptingOrders: true,
      hasPremiumTier: true,
    },
    create: {
      slug: "kimmy",
      name: "Kimmy Bot",
      description: "Bot jaga grup WhatsApp — anti spam, games, absen, dan banyak fitur lainnya.",
      features: ["Anti Spam", "Games", "Absen", "Tag All", "Welcome/Goodbye", "Anti Link"],
      isActive: true,
      maxSlots: 30,
      totalInstances: 2,
      acceptingOrders: true,
      hasPremiumTier: true,
    },
  });
  console.log(`✅ Bot type: kimmy (id: ${kimmy.id})`);

  // Harga kimmy
  const kimmyPrices = [
    { duration: "WEEKLY",  tier: "basic",   price: 2000 },
    { duration: "MONTHLY", tier: "basic",   price: 5000 },
    { duration: "WEEKLY",  tier: "premium", price: 3000 },
    { duration: "MONTHLY", tier: "premium", price: 7000 },
  ];
  for (const p of kimmyPrices) {
    await (prisma.price.upsert as any)({
      where: { botTypeId_duration_tier: { botTypeId: kimmy.id, duration: p.duration, tier: p.tier } },
      update: { price: p.price },
      create: { botTypeId: kimmy.id, duration: p.duration, tier: p.tier, price: p.price },
    });
  }
  console.log("✅ Harga kimmy restored (weekly basic 2rb, monthly basic 5rb, weekly vip 3rb, monthly vip 7rb)");

  // ============ 4. BOT TYPE: KIMI STORE ============
  const kimiStore = await (prisma.botType.upsert as any)({
    where: { slug: "kimi-store" },
    update: {
      name: "Kimi Store",
      description: "Bot store WhatsApp — jual beli, katalog produk, dan manajemen toko.",
      features: ["Katalog Produk", "Order Otomatis", "Notifikasi Pembeli", "Laporan Penjualan"],
      isActive: true,
      maxSlots: 0,
      totalInstances: 1,
      acceptingOrders: true,
      hasPremiumTier: false,
    },
    create: {
      slug: "kimi-store",
      name: "Kimi Store",
      description: "Bot store WhatsApp — jual beli, katalog produk, dan manajemen toko.",
      features: ["Katalog Produk", "Order Otomatis", "Notifikasi Pembeli", "Laporan Penjualan"],
      isActive: true,
      maxSlots: 0,
      totalInstances: 1,
      acceptingOrders: true,
      hasPremiumTier: false,
    },
  });
  console.log(`✅ Bot type: kimi-store (id: ${kimiStore.id})`);

  // ============ 5. RESTORE RENTAL DARI SEWA.JSON ============
  const sewaData: Record<string, { linkGrub?: string; expired: number; createdAt?: string }> = {
    "120363424480791327@g.us": { linkGrub: "https://chat.whatsapp.com/C29LaKr2q2kFUyoiI9xQ5R", expired: 1779504770978, createdAt: "2026-02-21T00:52:51.882Z" },
    "120363424569285788@g.us": { linkGrub: "https://chat.whatsapp.com/LJLLy7h2cQsHjerHExK2tp", expired: 1779591278173, createdAt: "2026-02-21T00:54:39.133Z" },
    "120363324329336700@g.us": { linkGrub: "https://chat.whatsapp.com/BPIIuvsmkjI7mR98WCwLSu", expired: 1807502237713, createdAt: "2026-02-21T00:57:18.832Z" },
    "120363404101317034@g.us": { linkGrub: "https://chat.whatsapp.com/C2JbIyQfyC8I5rSIqXNSUd", expired: 1781503108409, createdAt: "2026-02-21T00:58:29.464Z" },
    "120363423434804264@g.us": { linkGrub: "https://chat.whatsapp.com/DNNtFmbP30XFYlbgs8kALN", expired: 1787972359401, createdAt: "2026-02-21T00:59:20.589Z" },
    "120363422525847618@g.us": { linkGrub: "https://chat.whatsapp.com/I3xoUPVMgfZCLZaafx6P90", expired: 1781672445867, createdAt: "2026-02-21T01:00:47.007Z" },
    "6289635270409-1630648925@g.us": { linkGrub: "https://chat.whatsapp.com/F3kVK4c2fC02cNP1QMDR7e", expired: 1781672583075, createdAt: "2026-02-21T01:03:03.998Z" },
    "120363298431817828@g.us": { linkGrub: "https://chat.whatsapp.com/Hd7slI21o7zDsomfGmb66L", expired: 1946374471471, createdAt: "2026-03-15T10:34:33.277Z" },
    "120363419779376702@g.us": { linkGrub: "https://chat.whatsapp.com/IcRSoXvJcmIHngKMZwxtkM", expired: 1946374509125, createdAt: "2026-03-15T10:35:11.064Z" },
    "120363421440319678@g.us": { linkGrub: "https://chat.whatsapp.com/IATcQg8J9Jo2jl5aWAIx8r", expired: 1946374534454, createdAt: "2026-03-15T10:35:36.447Z" },
    "120363420768822183@g.us": { linkGrub: "https://chat.whatsapp.com/EArWqi2EafPEDoDXDyl2FC", expired: 1946375005083, createdAt: "2026-03-15T10:43:26.706Z" },
    "120363404776251314@g.us": { linkGrub: "https://chat.whatsapp.com/F2pMtAxyzJJCbmpk48lS7A", expired: 1946375044380, createdAt: "2026-03-15T10:44:06.206Z" },
    "120363403759809625@g.us": { linkGrub: "https://chat.whatsapp.com/GrFvrSWueE586naqI9lsjY", expired: 1946375079829, createdAt: "2026-03-15T10:44:41.713Z" },
    "120363426033273503@g.us": { linkGrub: "https://chat.whatsapp.com/HcaAksVqXq7H4wRwsyQX1z", expired: 1946375110437, createdAt: "2026-03-15T10:45:12.422Z" },
    "120363406081113461@g.us": { linkGrub: "https://chat.whatsapp.com/E1daRBMgW0VDPkeb9WqlQd", expired: 1946375134229, createdAt: "2026-03-15T10:45:36.365Z" },
    "120363402140421614@g.us": { linkGrub: "https://chat.whatsapp.com/LbaYsG5fn6S08dsq0mVbu6", expired: 1780365224263, createdAt: "2026-04-01T23:53:46.006Z" },
    "120363407439919655@g.us": { linkGrub: "https://chat.whatsapp.com/JJ847ZjowfY9ZHOXrCeWUJ", expired: 1780386968533, createdAt: "2026-04-02T05:56:11.454Z" },
    "120363407274262383@g.us": { linkGrub: "https://chat.whatsapp.com/JdMwoOcoddeA0jfcJJ3Npf", expired: 1779262148134, createdAt: "2026-04-19T06:29:10.627Z" },
    "120363396211063259@g.us": { linkGrub: "https://chat.whatsapp.com/GMK5uMYfBgMLEccMyE42Ql", expired: 1779679292134, createdAt: "2026-04-24T02:21:34.090Z" },
    "120363423514482350@g.us": { linkGrub: "https://chat.whatsapp.com/BnaniwV4nS144fQOlykieb", expired: 1779798157295, createdAt: "2026-04-24T11:22:39.405Z" },
    "120363418672824338@g.us": { linkGrub: "https://chat.whatsapp.com/IVEXYFGLhXx1CeLmzJ0IzB", expired: 1781345856057, createdAt: "2026-05-13T09:17:37.524Z" },
    "120363338245830669@g.us": { linkGrub: "https://chat.whatsapp.com/BZ3a9UTmqLLKfxCsfxcWdT", expired: 1787778779434, createdAt: "2026-05-18T20:13:00.113Z" },
  };

  const now = Date.now();
  let restoredRentals = 0;
  let skippedExpired = 0;

  for (const [groupIdRaw, data] of Object.entries(sewaData)) {
    const groupId = groupIdRaw.replace("@g.us", "");
    const expiresAt = new Date(data.expired);
    const status = data.expired > now ? "ACTIVE" : "ENDED";

    await (prisma.rental.upsert as any)({
      where: { groupId_botTypeId: { groupId, botTypeId: kimmy.id } },
      update: {
        groupLink: data.linkGrub || null,
        expiresAt,
        status,
        botInstance: 1,
      },
      create: {
        groupId,
        groupLink: data.linkGrub || null,
        botTypeId: kimmy.id,
        botInstance: 1,
        status,
        source: "BOT",
        isPremium: false,
        expiresAt,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      },
    });

    if (status === "ACTIVE") restoredRentals++;
    else skippedExpired++;
  }

  console.log(`✅ Rental restored: ${restoredRentals} aktif, ${skippedExpired} expired`);
  console.log("\n🎉 Restore selesai!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Login  : kwocag.web.id/panel`);
  console.log(`User   : KukuKaki`);
  console.log(`Pass   : WaduhWaw`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n⚠️  Cek maxSlots kimmy di dashboard (sekarang: 15 per instance)");
  console.log("⚠️  Sesuaikan harga kalau beda dari sebelumnya");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
