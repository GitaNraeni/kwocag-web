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
    // Fetch rentals
    fetch("/api/admin/rentals?limit=5")
      .then((res) => { if (res.status === 401) { router.push("/admin"); return null; } return res.json(); })
      .then((data) => {
        if (data?.success) setRecentRentals(data.data);
      }).catch(() => {});

    // Fetch orders
    fetch("/api/admin/orders?limit=5")
      .then((res) => { if (res.status === 401) { router.push("/admin"); return null; } return res.json(); })
      .then((data) => {
        if (data?.success) setRecentOrders(data.data);
      }).catch(() => {});

    // Fetch stats
    fetch("/api/admin/stats")
      .then((res) => { if (res.status === 401) { router.push("/admin"); return null; } return res.json(); })
      .then((data) => {
        if (data?.success) setStats(data.data);
      }).catch(() => {});
  }, []);

  const statCards = stats ? [
    { label: "Sewa Aktif", value: stats.activeRentals, color: "text-[var(--success)]" },
    { label: "Sewa Selesai", value: stats.endedRentals, color: "text-[var(--muted)]" },
    { label: "Transaksi Pending", value: stats.pendingOrders, color: "text-[var(--warning)]" },
    { label: "Revenue", value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`, color: "text-[var(--primary)]" },
  ] : [];

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">Overview</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-[var(--muted)] mb-1">{s.label}</p>
            <p className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sewa Bot Terbaru */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Sewa Bot Terbaru</h3>
            <Link href="/admin/dashboard/groups" className="text-xs text-[var(--primary)] hover:underline">Lihat semua</Link>
          </div>
          {recentRentals.length === 0 ? (
            <p className="text-[var(--muted)] text-sm py-8 text-center">Belum ada sewa</p>
          ) : (
            <div className="space-y-2">
              {recentRentals.map((rental: any) => (
                <div key={rental.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/5 transition">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium truncate">{rental.groupName || rental.groupId}</p>
                    <p className="text-[10px] sm:text-xs text-[var(--muted)]">{rental.botType?.name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded ${
                      rental.status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
                    }`}>
                      {rental.status === "ACTIVE" ? "Aktif" : "Selesai"}
                    </span>
                  </div>
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
            <p className="text-[var(--muted)] text-sm py-8 text-center">Belum ada transaksi</p>
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
                      order.status === "CANCELLED" ? "text-gray-400" :
                      "text-[var(--muted)]"
                    }`}>
                      {order.status === "SUCCESS" ? "Sukses" :
                       order.status === "PENDING" ? "Pending" :
                       order.status === "EXPIRED" ? "Expired" :
                       order.status === "CANCELLED" ? "Dibatalkan" : order.status}
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
