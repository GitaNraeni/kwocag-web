"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Stats {
  totalOrders: number;
  activeOrders: number;
  pendingOrders: number;
  expiredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export default function AdminOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/orders?limit=200")
      .then((res) => {
        if (res.status === 401) { router.push("/admin"); return null; }
        return res.json();
      })
      .then((data) => {
        if (!data?.success) return;
        const orders = data.data;
        setRecentOrders(orders.slice(0, 5));
        setStats({
          totalOrders: data.pagination?.total || orders.length,
          activeOrders: orders.filter((o: any) => o.status === "ACTIVE").length,
          pendingOrders: orders.filter((o: any) => o.status === "PENDING").length,
          expiredOrders: orders.filter((o: any) => o.status === "EXPIRED").length,
          cancelledOrders: orders.filter((o: any) => o.status === "CANCELLED").length,
          totalRevenue: orders
            .filter((o: any) => o.status === "ACTIVE" || o.status === "EXPIRED")
            .reduce((sum: number, o: any) => sum + o.totalPrice, 0),
        });
      });
  }, []);

  const statCards = stats ? [
    { label: "Total Order", value: stats.totalOrders, color: "text-white" },
    { label: "Aktif", value: stats.activeOrders, color: "text-[var(--success)]" },
    { label: "Pending", value: stats.pendingOrders, color: "text-[var(--warning)]" },
    { label: "Revenue", value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`, color: "text-[var(--primary)]" },
  ] : [];

  // Donut chart
  const total = stats ? stats.activeOrders + stats.pendingOrders + stats.expiredOrders + stats.cancelledOrders : 0;
  const segments = stats && total > 0 ? [
    { label: "Aktif", count: stats.activeOrders, color: "var(--success)", pct: (stats.activeOrders / total) * 100 },
    { label: "Pending", count: stats.pendingOrders, color: "var(--warning)", pct: (stats.pendingOrders / total) * 100 },
    { label: "Expired", count: stats.expiredOrders, color: "var(--danger)", pct: (stats.expiredOrders / total) * 100 },
    { label: "Cancelled", count: stats.cancelledOrders, color: "#6b7280", pct: (stats.cancelledOrders / total) * 100 },
  ] : [];

  // Build stroke-dasharray offsets
  let offset = 0;
  const circles = segments.map(s => {
    const dash = s.pct * 0.88; // circumference ratio for r=14
    const o = offset;
    offset += dash;
    return { ...s, dash, offset: o };
  });

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

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Donut Chart */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-medium mb-4">Status Order</h3>
          {stats && total > 0 ? (
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--card-border)" strokeWidth="4" />
                  {circles.map((c, i) => (
                    <circle key={i} cx="18" cy="18" r="14" fill="none"
                      stroke={c.color} strokeWidth="4"
                      strokeDasharray={`${c.dash} 88`}
                      strokeDashoffset={`-${c.offset}`}
                      strokeLinecap="round" />
                  ))}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{total}</span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs w-full">
                {segments.map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-[var(--muted)]">{s.label}</span>
                    <span className="ml-auto font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[var(--muted)] text-sm text-center py-8">Belum ada data</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Order Terbaru</h3>
            <Link href="/admin/dashboard/orders" className="text-xs text-[var(--primary)] hover:underline">Lihat semua</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-[var(--muted)] text-sm py-8 text-center">Belum ada order</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order: any) => (
                <Link key={order.id} href={`/admin/dashboard/orders/${order.id}`}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/5 transition">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-mono truncate">{order.orderCode}</p>
                    <p className="text-[10px] sm:text-xs text-[var(--muted)]">{order.botType.name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs sm:text-sm font-medium">Rp {order.totalPrice.toLocaleString("id-ID")}</p>
                    <p className={`text-[10px] sm:text-xs ${
                      order.status === "ACTIVE" ? "text-[var(--success)]" :
                      order.status === "PENDING" ? "text-[var(--warning)]" :
                      order.status === "CANCELLED" ? "text-gray-400" :
                      "text-[var(--muted)]"
                    }`}>{order.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
