import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/bot-integration/pending-signal
 *
 * Endpoint ringan — cek apakah ada order SUCCESS dalam 15 menit terakhir
 * yang paidAt-nya lebih baru dari timestamp terakhir bot polling.
 *
 * Query ini RINGAN karena:
 * - Hanya filter by status + paidAt (keduanya ada index di DB)
 * - TIDAK pakai subquery logs — cukup cek apakah ada order SUCCESS baru
 * - Bot kirim ?since=<timestamp> dari polling terakhirnya, jadi hasilnya
 *   selalu akurat tanpa perlu cache
 *
 * Bot polling ini tiap 30 detik tapi query DB-nya O(1) dengan index.
 * /webhook (query berat dengan JOIN) hanya dipanggil kalau hasPending = true.
 */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.PAKASIR_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const sinceParam = searchParams.get("since");

  // Bot kirim timestamp polling terakhirnya — cek apakah ada order SUCCESS
  // yang paidAt lebih baru dari saat itu. Fallback ke 15 menit kalau tidak ada.
  const since = sinceParam
    ? new Date(parseInt(sinceParam))
    : new Date(Date.now() - 15 * 60 * 1000);

  const where: Record<string, unknown> = {
    status: "SUCCESS",
    paidAt: { gte: since },
  };

  if (slug) {
    where.botType = { slug };
  }

  // COUNT dengan filter index — sangat cepat, tidak ada JOIN/subquery
  const count = await prisma.order.count({ where });

  return NextResponse.json({
    success: true,
    hasPending: count > 0,
    count,
    // Bot simpan timestamp ini untuk ?since= pada request berikutnya
    timestamp: Date.now(),
  });
}
