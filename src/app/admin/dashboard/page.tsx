"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Stats {
  totalRentals: number;
  activeRentals: number;
  endedRentals: number;
  totalOrders: number;
  pendingOrders: number;
  successOrders: number;
  expiredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export default function AdminOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRentals, setRecentRentals] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/rentals?limit=5")
      .then((res) => { if (res.status === 401) { router.push("/admin"); return null; } return res.json(); })
      .then((data) => { if (data?.success) setRecentRentals(data.data); }).catch(() => {});

    fetch("/api/admin/orders?limit=5")
      .then((res) => { if (res.status === 401) { router.push("/admin"); return null; } return res.json(); })
      .then((data) => { if (data?.success) setRecentOrders(data.data); }).catch(() => {});

    fetch("/api/admin/stats")
      .then((res) => { if (res.status === 401) { router.push("/admin"); return null; } return res.json(); })
      .then((data) => { if (data?.success) setStats(data.data); }).catch(() => {});
  }, []);

  // Donut chart helpers
  const rentalSegments = stats ? [
    { label: "Aktif", count: stats.activeRentals, color: "var(--success)" },
    { label: "Selesai", count: stats.endedRentals, color: "#6b7280" },
  ].filter(s => s.count > 0) : [];

  const orderSegments = stats ? [
    { label: "Sukses", count: stats.successOrders, color: "var(--success)" },
    { label: "Pending", count: stats.pendingOrders, color: "var(--warning)" },
    { label: "Expired", count: stats.expiredOrders, color: "var(--danger)" },
    { label: "Dibatalkan", count: stats.cancelledOrders, color: "#6b7280" },
  ].filter(s => s.count > 0) : [];

  function buildCircles(segments: { label: string; count: number; color: string }[], total: number) {
    let offset = 0;
    return segments.map(s => {
      const pct = total > 0 ? (s.count / total) * 100 : 0;
      const dash = pct * 0.88;
      const o = offset;
      offset += dash;
      return { ...s, dash, offset: o };
    });
  }

  const rentalTotal = stats ? stats.activeRentals + stats.endedRentals : 0;
  const orderTotal = stats ? stats.pendingOrders + stats.successOrders + stats.expiredOrders + stats.cancelledOrders : 0;
  const rentalCircles = buildCircles(rentalSegments, rentalTotal);
  const orderCircles = buildCircles(orderSegments, orderTotal);

  const statCards = stats ? [
    { label: "Sewa Aktif", value: stats.activeRentals, color: "text-[var(--success)]" },
    { label: "Total Sewa", value: stats.totalRentals, color: "text-white" },
    { label: "Total Transaksi", value: stats.totalOrders, color: "text-white" },
    { label: "Revenue", value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`, color: "text-[var(--primary)]" },
  ] : [];

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">Overview</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-[var(--muted)] mb-1">{s.label}</p>
            <p className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Donut Charts */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Sewa Donut */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-medium mb-4">Status Sewa</h3>
          {rentalTotal > 0 ? (
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--card-border)" strokeWidth="4" />
                  {rentalCircles.map((c, i) => (
                    <circle key={i} cx="18" cy="18" r="14" fill="none"
                      stroke={c.color} strokeWidth="4"
                      strokeDasharray={`${c.dash} 88`}
                      strokeDashoffset={`-${c.offset}`}
                      strokeLinecap="round" />
                  ))}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{rentalTotal}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                {rentalSegments.map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-[var(--muted)]">{s.label}</span>
                    <span className="ml-auto font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[var(--muted)] text-sm text-center py-6">Belum ada data sewa</p>
          )}
        </div>

        {/* Transaksi Donut */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-medium mb-4">Status Transaksi</h3>
          {orderTotal > 0 ? (
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--card-border)" strokeWidth="4" />
                  {orderCircles.map((c, i) => (
                    <circle key={i} cx="18" cy="18" r="14" fill="none"
                      stroke={c.color} strokeWidth="4"
                      strokeDasharray={`${c.dash} 88`}
                      strokeDashoffset={`-${c.offset}`}
                      strokeLinecap="round" />
                  ))}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{orderTotal}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                {orderSegments.map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-[var(--muted)]">{s.label}</span>
                    <span className="ml-auto font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[var(--muted)] text-sm text-center py-6">Belum ada transaksi</p>
          )}
        </div>
      </div>

      {/* Recent Lists */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sewa Bot Terbaru */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Sewa Bot Terbaru</h3>
            <Link href="/admin/dashboard/groups" className="text-xs text-[var(--primary)] hover:underline">Lihat semua</Link>
          </div>
          {recentRentals.length === 0 ? (
            <p className="text-[var(--muted)] text-sm py-6 text-center">Belum ada sewa</p>
          ) : (
            <div className="space-y-2">
              {recentRentals.map((rental: any) => (
                <div key={rental.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/5 transition">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium truncate">{rental.groupName || rental.groupId}</p>
                    <p className="text-[10px] sm:text-xs text-[var(--muted)]">{rental.botType?.name}</p>
                  </div>
                  <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded shrink-0 ${
                    rental.status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
                  }`}>
                    {rental.status === "ACTIVE" ? "Aktif" : "Selesai"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaksi Terbaru */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Transaksi Terbaru</h3>
            <Link href="/admin/dashboard/orders" className="text-xs text-[var(--primary)] hover:underline">Lihat semua</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-[var(--muted)] text-sm py-6 text-center">Belum ada transaksi</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/5 transition">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-mono truncate">{order.orderCode}</p>
                    <p className="text-[10px] sm:text-xs text-[var(--muted)]">{order.botType?.name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs sm:text-sm font-medium">Rp {order.totalPrice?.toLocaleString("id-ID")}</p>
                    <p className={`text-[10px] sm:text-xs ${
                      order.status === "SUCCESS" ? "text-[var(--success)]" :
                      order.status === "PENDING" ? "text-[var(--warning)]" :
                      order.status === "EXPIRED" ? "text-[var(--danger)]" :
                      "text-gray-400"
                    }`}>
                      {order.status === "SUCCESS" ? "Sukses" :
                       order.status === "PENDING" ? "Pending" :
                       order.status === "EXPIRED" ? "Expired" :
                       "Dibatalkan"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
