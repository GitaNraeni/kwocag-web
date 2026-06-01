import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  // Fix maxSlots kimmy: 30 per instance, 2 instance = total 60
  const kimmy = await p.botType.update({
    where: { slug: "kimmy" },
    data: { maxSlots: 30, totalInstances: 2 },
  });
  console.log(`✅ kimmy: maxSlots=${kimmy.maxSlots}, totalInstances=${kimmy.totalInstances}, totalCapacity=${kimmy.maxSlots * kimmy.totalInstances}`);

  // Cek jumlah rental aktif sekarang
  const activeCount = await p.rental.count({ where: { botTypeId: kimmy.id, status: "ACTIVE" } });
  console.log(`📊 Rental aktif: ${activeCount}/${kimmy.maxSlots * kimmy.totalInstances}`);
}

main().catch(console.error).finally(() => p.$disconnect());
