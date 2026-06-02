import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  const rentals = await p.rental.findMany({
    where: { status: "ACTIVE" },
    select: { groupId: true, groupName: true, expiresAt: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log(`\nTotal aktif: ${rentals.length} (sample 10 terbaru)\n`);
  for (const r of rentals) {
    const nama = r.groupName || "(null - belum sync)";
    console.log(`${r.groupId} → ${nama}`);
  }

  const nullCount = await p.rental.count({ where: { status: "ACTIVE", groupName: null } });
  const total = await p.rental.count({ where: { status: "ACTIVE" } });
  console.log(`\n${nullCount}/${total} rental masih belum punya nama grup`);
}

main().catch(console.error).finally(() => p.$disconnect());
