import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  // Buat admin
  const hashedPassword = crypto.createHash("sha256").update("WaduhWaw").digest("hex");

  await prisma.admin.upsert({
    where: { username: "KukuKaki" },
    update: { password: hashedPassword },
    create: {
      username: "KukuKaki",
      password: hashedPassword,
    },
  });

  // Buat site settings
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      siteName: "KWOCAG",
      siteLogo: "https://files.catbox.moe/vms1wj.jpg",
      contactWhatsapp: "62895366006918",
    },
  });

  console.log("Setup selesai.");
  console.log("Login: KukuKaki / WaduhWaw");
  console.log("Tambah tipe bot dari admin dashboard.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
