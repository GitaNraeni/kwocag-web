import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Auth check
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const rental = await prisma.rental.findUnique({ where: { id } });
    if (!rental) {
      return NextResponse.json({ success: false, message: "Rental tidak ditemukan" }, { status: 404 });
    }
    if (rental.status === "ENDED") {
      return NextResponse.json({ success: false, message: "Rental sudah ENDED" }, { status: 400 });
    }

    await prisma.rental.update({ where: { id }, data: { status: "ENDED" } });

    return NextResponse.json({ success: true, message: "Rental berhasil diakhiri" });
  } catch (error) {
    console.error("End rental error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
