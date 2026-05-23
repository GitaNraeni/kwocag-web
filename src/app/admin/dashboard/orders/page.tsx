"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SkeletonList } from "@/components/Skeleton";

interface Order {
  id: string;
  orderCode: string;
  botType: { name: string };
  contactPhone?: string | null;
  contactEmail?: string | null;
  totalPrice: number;
  status: string;
  isPremium?: boolean;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  SUCCESS: "bg-green-500/10 text-green-400",
  EXPIRED: "bg-red-500/10 text-red-400",
  CANCELLED: "bg-gray-500/10 text-gray-400",
};

const PAGE_SIZE = 10;

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = () => {
    const url = filter ? `/api/admin/orders?status=${filter}&limit=200` : "/api/admin/orders?limit=200";
    fetch(url)
      .then((res) => { if (res.status === 401) { router.push("/admin"); return null; } return res.json(); })
      .then((data) => { if (data?.success) { setOrders(data.data); setFiltered(data.data); setPage(1); } })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(orders); setPage(1); return; }
    const q = search.toLowerCase();
    const result = orders.filter(o =>
      o.orderCode.toLowerCase().includes(q) ||
      o.contactPhone?.toLowerCase().includes(q) ||
      o.contactEmail?.toLowerCase().includes(q) ||
      o.botType.name.toLowerCase().includes(q)
    );
    setFiltered(result);
    setPage(1);
  }, [search, orders]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">Transaksi</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari kode order, no telepon, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]"
        />
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {["", "PENDING", "SUCCESS", "EXPIRED", "CANCELLED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${filter === s ? "bg-[var(--primary)] text-white" : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-white"}`}>
            {s === "" ? "Semua" : s === "SUCCESS" ? "Sukses" : s === "PENDING" ? "Pending" : s === "EXPIRED" ? "Expired" : "Dibatalkan"}
          </button>
        ))}
      </div>

      {loading ? <SkeletonList count={4} /> : paged.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-8 text-center">
          <p className="text-[var(--muted)] text-sm">Tidak ada transaksi.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paged.map((order) => (
              <Link key={order.id} href={`/admin/dashboard/orders/${order.id}`}
                className="block bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--primary)]/30 rounded-xl p-3 sm:p-4 transition">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="font-mono text-xs sm:text-sm">{order.orderCode}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs ${statusStyles[order.status] || ""}`}>{order.status}</span>
                    {order.isPremium && <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400">Premium</span>}
                  </div>
                  <span className="text-xs sm:text-sm font-medium shrink-0">Rp {order.totalPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] sm:text-xs text-[var(--muted)] mt-1 flex-wrap">
                  <span>{order.botType.name}</span>
                  <span>{order.contactPhone || "-"}</span>
                  <span className="ml-auto">{new Date(order.createdAt).toLocaleDateString("id-ID")}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs bg-[var(--card)] border border-[var(--card-border)] disabled:opacity-30 hover:bg-white/5 transition">
                Prev
              </button>
              <span className="text-xs text-[var(--muted)]">{page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs bg-[var(--card)] border border-[var(--card-border)] disabled:opacity-30 hover:bg-white/5 transition">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
