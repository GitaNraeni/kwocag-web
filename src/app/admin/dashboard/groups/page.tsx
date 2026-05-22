"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  orderCode: string;
  botType: { name: string; slug: string };
  groupLink: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  totalPrice: number;
  status: string;
  duration: string;
  customDays?: number | null;
  expiresAt?: string | null;
  createdAt: string;
  notes?: string | null;
}

const PAGE_SIZE = 10;

// Helper: detect permanent (expiresAt > 10 tahun dari sekarang)
function isPermanent(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  const threshold = new Date();
  threshold.setFullYear(threshold.getFullYear() + 10);
  return new Date(expiresAt).getTime() > threshold.getTime();
}

export default function AdminGroups() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/admin/orders?status=ACTIVE&limit=100")
      .then((res) => { if (res.status === 401) { router.push("/admin"); return null; } return res.json(); })
      .then((data) => {
        if (data?.success) setOrders(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const botTypes = Array.from(new Set(orders.map(o => o.botType.slug)));
  const filtered = selectedType === "all" ? orders : orders.filter(o => o.botType.slug === selectedType);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Grup Sewa Aktif</h2>
        <span className="text-sm text-[var(--muted)]">{orders.length} aktif</span>
      </div>

      {/* Filter by type */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setSelectedType("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedType === "all" ? "bg-[var(--primary)] text-white" : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)]"
          }`}
        >
          Semua ({orders.length})
        </button>
        {botTypes.map(slug => {
          const count = orders.filter(o => o.botType.slug === slug).length;
          const name = orders.find(o => o.botType.slug === slug)?.botType.name || slug;
          return (
            <button
              key={slug}
              onClick={() => setSelectedType(slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedType === slug ? "bg-[var(--primary)] text-white" : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)]"
              }`}
            >
              {name} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-[var(--muted)]">Memuat...</p>
      ) : filtered.length === 0 ? (
        <p className="text-[var(--muted)]">Tidak ada grup sewa aktif.</p>
      ) : (
        <>
          <div className="space-y-2">
            {paged.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full text-left bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--primary)]/30 rounded-xl p-3 sm:p-4 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium">{order.notes || order.botType.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">Aktif</span>
                      {isPermanent(order.expiresAt) && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">Permanen</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)]">{order.botType.name}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">{order.orderCode}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-[var(--muted)]">Sisa</p>
                    <p className="text-xs sm:text-sm font-medium">{isPermanent(order.expiresAt) ? "Selamanya" : order.expiresAt ? (() => { const d = new Date(order.expiresAt).getTime() - Date.now(); if (d <= 0) return "Expired"; const days = Math.floor(d / 86400000); const hrs = Math.floor((d % 86400000) / 3600000); return days > 0 ? `${days}h ${hrs}j` : `${hrs}j`; })() : "-"}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

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

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Detail Sewa</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-[var(--muted)] hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {selectedOrder.notes && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Nama Grup</span>
                  <span className="font-medium">{selectedOrder.notes}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Order ID</span>
                <span className="font-mono text-xs">{selectedOrder.orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Tipe Bot</span>
                <span>{selectedOrder.botType.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Durasi</span>
                <span>{isPermanent(selectedOrder.expiresAt) ? "Permanen" : selectedOrder.duration === "WEEKLY" ? "1 Minggu" : selectedOrder.duration === "MONTHLY" ? "1 Bulan" : `${selectedOrder.customDays || "-"} Hari`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Sisa Waktu</span>
                <span className="font-medium">{isPermanent(selectedOrder.expiresAt) ? "Selamanya" : selectedOrder.expiresAt ? (() => { const d = new Date(selectedOrder.expiresAt).getTime() - Date.now(); if (d <= 0) return "Expired"; const days = Math.floor(d / 86400000); const hrs = Math.floor((d % 86400000) / 3600000); return `${days}h ${hrs}j`; })() : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Harga</span>
                <span>Rp {selectedOrder.totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">No. Telepon</span>
                <span>{selectedOrder.contactPhone || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Email</span>
                <span>{selectedOrder.contactEmail || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Tanggal Order</span>
                <span>{new Date(selectedOrder.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Expired</span>
                <span className="font-medium">{isPermanent(selectedOrder.expiresAt) ? "Tidak pernah" : selectedOrder.expiresAt ? new Date(selectedOrder.expiresAt).toLocaleDateString("id-ID") : "-"}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] text-xs">Link Grup</span>
                <a href={selectedOrder.groupLink} target="_blank" rel="noopener noreferrer"
                  className="block text-[var(--primary)] text-xs hover:underline mt-0.5 break-all">
                  {selectedOrder.groupLink}
                </a>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 py-2.5 bg-[var(--card-border)] hover:bg-[var(--muted)]/20 rounded-xl text-sm font-medium transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
