import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bots - List semua tipe bot yang aktif (public)
export async function GET() {
  try {
    const bots = await prisma.botType.findMany({
      where: { isActive: true },
      include: {
        prices: {
          orderBy: { duration: "asc" },
        },
        _count: {
          select: { rentals: { where: { status: "ACTIVE" } } },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: bots });
  } catch (error) {
    console.error("Error fetching bots:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data bot" },
      { status: 500 }
    );
  }
}
