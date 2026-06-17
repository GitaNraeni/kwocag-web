"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SkeletonOverview } from "@/components/Skeleton";

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

interface ChartMonth {
  key: string;
  label: string;
  revenue: number;
}

interface ChartData {
  months: ChartMonth[];
  total: number;
}

export default function AdminOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRentals, setRecentRentals] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [tooltip, setTooltip] = useState<{ index: number; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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

    fetch("/api/admin/stats/chart")
      .then((res) => { if (res.status === 401) { router.push("/admin"); return null; } return res.json(); })
      .then((data) => { if (data?.success) setChartData(data.data); }).catch(() => {});
  }, []);

  // Donut chart helpers
  const rentalSegments = stats ? [
    { label: "Aktif", count: stats.activeRentals, color: "var(--success)" },
    { label: "Selesai", count: stats.endedRentals, color: "#f97316" },
  ].filter(s => s.count > 0) : [];

  const orderSegments = stats ? [
    { label: "Sukses", count: stats.successOrders, color: "var(--success)" },
    { label: "Pending", count: stats.pendingOrders, color: "var(--warning)" },
    { label: "Expired", count: stats.expiredOrders, color: "#6b7280" },
    { label: "Dibatalkan", count: stats.cancelledOrders, color: "var(--danger)" },
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

  if (!stats) return <SkeletonOverview />;

  return (
    /* TAMBAHAN: w-full dan overflow-x-hidden biar layout utama gak bocor ke kanan */
    <div className="max-w-5xl w-full overflow-x-hidden">
      <h2 className="text-2xl font-bold mb-6">Overview</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 stagger">
        {statCards.map((s) => (
          <div key={s.label} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-[var(--muted)] mb-1">{s.label}</p>
            <p className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Donut Charts */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 stagger">
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

      {/* Grafik Revenue */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5 mb-6 stagger">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Grafik Revenue</h3>
          {chartData && (
            <span className="text-xs text-[var(--muted)]">
              Total: <span className="text-white font-medium">Rp {chartData.total.toLocaleString("id-ID")}</span>
            </span>
          )}
        </div>
        {chartData ? (
          (() => {
            const months = chartData.months;
            const maxRev = Math.max(...months.map(m => m.revenue), 1);
            // SVG dimensions (viewBox units)
            const W = 400;
            const H = 120;
            const padL = 8;
            const padR = 8;
            const padTop = 10;
            const padBottom = 24; // space for labels
            const chartW = W - padL - padR;
            const chartH = H - padTop - padBottom;
            const barCount = months.length;
            const barGap = 3;
            const barW = (chartW - (barCount - 1) * barGap) / barCount;
            const nowKey = (() => {
              const d = new Date();
              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            })();

            return (
              <div className="relative">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${W} ${H}`}
                  className="w-full"
                  style={{ display: "block" }}
                  onMouseLeave={() => setTooltip(null)}
                  onTouchEnd={() => setTooltip(null)}
                >
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padTop + chartH * (1 - ratio);
                    return (
                      <line
                        key={i}
                        x1={padL} y1={y}
                        x2={W - padR} y2={y}
                        stroke="var(--card-border)"
                        strokeWidth="0.5"
                        strokeDasharray={i === 0 ? "none" : "2,2"}
                      />
                    );
                  })}

                  {/* Bars */}
                  {months.map((m, i) => {
                    const x = padL + i * (barW + barGap);
                    const barH = chartH * (m.revenue / maxRev);
                    const y = padTop + chartH - barH;
                    const isCurrent = m.key === nowKey;
                    const isHovered = tooltip?.index === i;

                    return (
                      <g key={m.key}>
                        {/* Invisible wider hit area for touch/hover */}
                        <rect
                          x={x} y={padTop}
                          width={barW} height={chartH}
                          fill="transparent"
                          style={{ cursor: "pointer" }}
                          onMouseEnter={(e) => {
                            const svg = svgRef.current;
                            if (!svg) return;
                            const rect = svg.getBoundingClientRect();
                            const scaleX = W / rect.width;
                            const scaleY = H / rect.height;
                            setTooltip({
                              index: i,
                              x: (e.clientX - rect.left) * scaleX,
                              y: y * (1 / scaleY),
                            });
                          }}
                          onTouchStart={(e) => {
                            const svg = svgRef.current;
                            if (!svg) return;
                            const touch = e.touches[0];
                            const rect = svg.getBoundingClientRect();
                            const scaleX = W / rect.width;
                            const scaleY = H / rect.height;
                            setTooltip({
                              index: i,
                              x: (touch.clientX - rect.left) * scaleX,
                              y: y * (1 / scaleY),
                            });
                            e.preventDefault();
                          }}
                        />
                        {/* Bar */}
                        {m.revenue > 0 && (
                          <rect
                            x={x} y={y}
                            width={barW}
                            height={barH}
                            rx="2"
                            fill={isHovered ? "var(--primary)" : isCurrent ? "var(--primary)" : "var(--primary)"}
                            opacity={isHovered ? 1 : isCurrent ? 1 : 0.55}
                          />
                        )}
                        {/* Zero bar placeholder */}
                        {m.revenue === 0 && (
                          <rect
                            x={x} y={padTop + chartH - 2}
                            width={barW} height={2}
                            rx="1"
                            fill="var(--card-border)"
                            opacity={0.5}
                          />
                        )}
                        {/* Label */}
                        <text
                          x={x + barW / 2}
                          y={H - 4}
                          textAnchor="middle"
                          fontSize="7"
                          fill={isCurrent ? "var(--primary)" : "var(--muted)"}
                          fontWeight={isCurrent ? "600" : "400"}
                        >
                          {m.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Tooltip */}
                  {tooltip !== null && (() => {
                    const m = months[tooltip.index];
                    const tipW = 90;
                    const tipH = 28;
                    let tx = tooltip.x - tipW / 2;
                    if (tx < 2) tx = 2;
                    if (tx + tipW > W - 2) tx = W - tipW - 2;
                    const ty = Math.max(padTop, tooltip.y - tipH - 6);

                    return (
                      <g>
                        <rect x={tx} y={ty} width={tipW} height={tipH} rx="4"
                          fill="var(--card)" stroke="var(--card-border)" strokeWidth="0.8" />
                        <text x={tx + tipW / 2} y={ty + 10} textAnchor="middle" fontSize="6.5" fill="var(--muted)">{m.label}</text>
                        <text x={tx + tipW / 2} y={ty + 21} textAnchor="middle" fontSize="7.5" fontWeight="600" fill="var(--primary)">
                          Rp {m.revenue.toLocaleString("id-ID")}
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
            );
          })()
        ) : (
          <div className="h-32 flex items-center justify-center">
            <p className="text-[var(--muted)] text-sm">Memuat grafik...</p>
          </div>
        )}
      </div>

      {/* Recent Lists */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 stagger">
        {/* Sewa Bot Terbaru */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Sewa Bot Terbaru</h3>
            <Link href="/admin/dashboard/groups" className="text-xs text-[var(--primary)] hover:underline">Lihat semua</Link>
          </div>
          {recentRentals.length === 0 ? (
            <p className="text-[var(--muted)] text-sm py-6 text-center">Belum ada sewa</p>
          ) : (
            <div className="space-y-2">
              {recentRentals.map((rental: any) => (
                /* PERUBAHAN UTAMA: Pakai grid grid-cols-[1fr_auto] */
                <div key={rental.id} className="grid grid-cols-[1fr_auto] items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/5 transition">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">{rental.groupName || rental.groupId}</p>
                    <p className="text-[10px] sm:text-xs text-[var(--muted)] truncate">{rental.botType?.name}</p>
                  </div>
                  <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded shrink-0 ${
                    rental.status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"
                  }`}>
                    {rental.status === "ACTIVE" ? "Aktif" : "Selesai"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaksi Terbaru */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Transaksi Terbaru</h3>
            <Link href="/admin/dashboard/orders" className="text-xs text-[var(--primary)] hover:underline">Lihat semua</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-[var(--muted)] text-sm py-6 text-center">Belum ada transaksi</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order: any) => (
                 /* PERUBAHAN UTAMA: Pakai grid grid-cols-[1fr_auto] */
                <div key={order.id} className="grid grid-cols-[1fr_auto] items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/5 transition">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-mono truncate">{order.orderCode}</p>
                    <p className="text-[10px] sm:text-xs text-[var(--muted)] truncate">{order.botType?.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm font-medium">Rp {order.totalPrice?.toLocaleString("id-ID")}</p>
                    <p className={`text-[10px] sm:text-xs ${
                      order.status === "SUCCESS" ? "text-[var(--success)]" :
                      order.status === "PENDING" ? "text-[var(--warning)]" :
                      order.status === "EXPIRED" ? "text-gray-400" :
                      "text-[var(--danger)]"
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