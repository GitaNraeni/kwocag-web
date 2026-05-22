import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const updateBotSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  acceptingOrders: z.boolean().optional(),
  maxSlots: z.number().min(0).optional(),
  totalInstances: z.number().min(1).optional(),
  hasPremiumTier: z.boolean().optional(),
  prices: z
    .array(
      z.object({
        duration: z.enum(["WEEKLY", "MONTHLY", "CUSTOM"]),
        price: z.number().min(0),
        tier: z.string().default("basic"),
        customDays: z.number().optional(),
      })
    )
    .optional(),
});

// PUT /api/admin/bots/[id] - Update tipe bot
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateBotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { prices, ...data } = parsed.data;

    const bot = await prisma.botType.update({
      where: { id },
      data,
    });

    // Update prices jika ada
    if (prices) {
      // Hapus harga lama
      await prisma.price.deleteMany({ where: { botTypeId: id } });
      // Buat harga baru
      await prisma.price.createMany({
        data: prices.map((p) => ({
          botTypeId: id,
          duration: p.duration,
          price: p.price,
          tier: p.tier || "basic",
          customDays: p.customDays,
        })),
      });
    }

    const updated = await prisma.botType.findUnique({
      where: { id },
      include: { prices: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating bot:", error);
    return NextResponse.json(
      { success: false, message: "Gagal update tipe bot" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/bots/[id] - Hapus tipe bot
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Cek apakah masih ada sewa aktif
    const activeOrders = await prisma.order.count({
      where: { botTypeId: id, status: "ACTIVE" },
    });

    if (activeOrders > 0) {
      return NextResponse.json(
        { success: false, message: `Tidak bisa dihapus. Masih ada ${activeOrders} sewa aktif di bot ini. Expire atau batalkan dulu.` },
        { status: 400 }
      );
    }

    await prisma.orderLog.deleteMany({ where: { order: { botTypeId: id } } });
    await prisma.order.deleteMany({ where: { botTypeId: id } });
    await prisma.price.deleteMany({ where: { botTypeId: id } });
    await prisma.botType.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Bot type dihapus" });
  } catch (error) {
    console.error("Error deleting bot:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus tipe bot" },
      { status: 500 }
    );
  }
}
