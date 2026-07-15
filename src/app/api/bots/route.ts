import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bots - List semua tipe bot yang aktif (public)
// Cache 5 menit — daftar bot & harga jarang berubah
export async function GET() {
  try {
    const bots = await prisma.botType.findMany({
      where: { isActive: true },
      include: {
        prices: {
          orderBy: { duration: "asc" },
        },
        _count: {
          // Count per instance nggak bisa langsung di Prisma,
          // jadi kita count total aktif — slot check per instance ada di orders/route.ts
          select: { rentals: { where: { status: "ACTIVE" } } },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Hitung slot per instance yang benar: totalCapacity = maxSlots * totalInstances
    const botsWithSlot = bots.map((bot: any) => ({
      ...bot,
      totalCapacity: (bot.maxSlots || 0) * (bot.totalInstances || 1),
      activeCount: bot._count.rentals,
      isFull: bot.maxSlots > 0 && bot._count.rentals >= (bot.maxSlots * (bot.totalInstances || 1)),
    }));

    const response = NextResponse.json({ success: true, data: botsWithSlot });
    // Cache 5 menit di Vercel Edge — data bot & harga jarang berubah
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
    return response;
  } catch (error) {
    console.error("Error fetching bots:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data bot" },
      { status: 500 }
    );
  }
}
