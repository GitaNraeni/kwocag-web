import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const botTypeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.string()),
  maxSlots: z.number().min(0).optional(),
  prices: z.array(
    z.object({
      duration: z.enum(["WEEKLY", "MONTHLY", "CUSTOM"]),
      price: z.number().min(0),
      customDays: z.number().optional(),
    })
  ),
});

// GET /api/admin/bots - List semua bot (admin)
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const bots = await prisma.botType.findMany({
    include: { prices: true, _count: { select: { orders: { where: { status: "ACTIVE" } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: bots });
}

// POST /api/admin/bots - Tambah tipe bot baru
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = botTypeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, slug, description, features, prices, maxSlots: parsedMaxSlots } = parsed.data;
    const maxSlots = parsedMaxSlots ?? (body.maxSlots as number) ?? 0;
    const totalInstances = (body.totalInstances as number) || 1;

    // Cek slug unik
    const existing = await prisma.botType.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Slug sudah digunakan" },
        { status: 400 }
      );
    }

    const bot = await prisma.botType.create({
      data: {
        name,
        slug,
        description,
        features,
        maxSlots,
        totalInstances,
        prices: {
          create: prices.map((p) => ({
            duration: p.duration,
            price: p.price,
            customDays: p.customDays,
          })),
        },
      },
      include: { prices: true },
    });

    return NextResponse.json({ success: true, data: bot }, { status: 201 });
  } catch (error) {
    console.error("Error creating bot type:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat tipe bot" },
      { status: 500 }
    );
  }
}
