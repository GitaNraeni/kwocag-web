import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

// PUT /api/admin/password - Ganti password
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ success: false, message: "Password lama dan baru wajib diisi" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ success: false, message: "Password baru minimal 6 karakter" }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { id: session.id } });
  if (!admin) {
    return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 });
  }

  const isValid = await verifyPassword(currentPassword, admin.password);
  if (!isValid) {
    return NextResponse.json({ success: false, message: "Password lama salah" }, { status: 401 });
  }

  const hashed = await hashPassword(newPassword);
  await prisma.admin.update({
    where: { id: session.id },
    data: { password: hashed },
  });

  return NextResponse.json({ success: true, message: "Password berhasil diubah" });
}
