import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bot-integration/expired - List rental yang sudah expired (bot perlu leave grup)
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const rentals = await prisma.rental.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lt: now },
    },
    include: { botType: true },
  });

  return NextResponse.json({
    success: true,
    data: rentals.map((r) => ({
      rentalId: r.id,
      // Keep orderId field for backward compat with bot
      orderId: r.id,
      botType: r.botType.slug,
      groupId: r.groupId,
      groupLink: r.groupLink,
      expiresAt: r.expiresAt,
      contactPhone: r.contactPhone,
    })),
  });
}

// POST /api/bot-integration/expired - Konfirmasi bot sudah leave & set ENDED
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, rentalId } = await req.json();
    const id = rentalId || orderId;

    if (!id) {
      return NextResponse.json({ success: false, message: "rentalId wajib diisi" }, { status: 400 });
    }

    const rental = await prisma.rental.findUnique({ where: { id } });
    if (rental && rental.status === "ACTIVE") {
      await prisma.rental.update({
        where: { id },
        data: { status: "ENDED" },
      });
    }

    return NextResponse.json({ success: true, message: "Marked as ended" });
  } catch (error) {
    console.error("Expired confirm error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
