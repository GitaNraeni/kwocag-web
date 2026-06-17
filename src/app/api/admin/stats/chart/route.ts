import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  // Ambil semua order SUCCESS, group by bulan
  const orders = await prisma.order.findMany({
    where: { status: "SUCCESS" },
    select: { totalPrice: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Build map bulan -> total revenue
  const monthMap: Record<string, number> = {};
  for (const order of orders) {
    const d = new Date(order.createdAt);
    // key format: "YYYY-MM"
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap[key] = (monthMap[key] || 0) + order.totalPrice;
  }

  // Generate 12 bulan terakhir (termasuk bulan ini)
  const now = new Date();
  const months: { key: string; label: string; revenue: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("id-ID", { month: "short" });
    months.push({ key, label, revenue: monthMap[key] || 0 });
  }

  const total = months.reduce((sum, m) => sum + m.revenue, 0);

  return NextResponse.json({
    success: true,
    data: { months, total },
  });
}
