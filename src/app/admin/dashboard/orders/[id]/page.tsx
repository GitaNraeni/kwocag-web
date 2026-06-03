"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrder = () => {
    fetch(`/api/admin/orders?limit=100`)
      .then((res) => {
        if (res.status === 401) { router.push("/admin"); return null; }
        return res.json();
      })
      .then((data) => {
        if (data?.success) {
          const found = data.data.find((o: any) => o.id === id);
          setOrder(found || null);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleAction = async (action: string) => {
    setActionLoading(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchOrder();
    setActionLoading(false);
  };

  if (loading) return <p className="text-[var(--muted)]">Memuat...</p>;
  if (!order) return <p className="text-[var(--muted)]">Order tidak ditemukan</p>;

  return (
    <div className="max-w-2xl">
      <Link href="/admin/dashboard/orders" className="text-sm text-[var(--muted)] hover:text-white mb-4 inline-block">
        &larr; Kembali ke Orders
      </Link>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-mono">{order.orderCode}</h2>
          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
            order.status === "SUCCESS" ? "bg-green-500/10 text-green-400" :
            order.status === "PENDING" ? "bg-yellow-500/10 text-yellow-400" :
            order.status === "EXPIRED" ? "bg-gray-500/10 text-gray-400" :
            "bg-red-500/10 text-red-400"
          }`}>{order.status === "SUCCESS" ? "Sukses" : order.status === "CANCELLED" ? "Dibatalkan" : order.status}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="text-[var(--muted)] text-xs mb-1">Tipe Bot</p>
            <p className="font-medium">{order.botType.name}</p>
          </div>
          <div>
            <p className="text-[var(--muted)] text-xs mb-1">Harga</p>
            <p className="font-medium">Rp {order.totalPrice.toLocaleString("id-ID")}</p>
          </div>
          <div>
            <p className="text-[var(--muted)] text-xs mb-1">Durasi</p>
            <p className="font-medium">
              {order.duration === "WEEKLY" ? "1 Minggu" : order.duration === "MONTHLY" ? "1 Bulan" : `${order.customDays} Hari`}
            </p>
          </div>
          <div>
            <p className="text-[var(--muted)] text-xs mb-1">Aktif Sampai</p>
            <p className="font-medium">{order.expiresAt ? new Date(order.expiresAt).toLocaleDateString("id-ID") : "-"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[var(--muted)] text-xs mb-1">Link Grup</p>
            <a href={order.groupLink} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline break-all text-sm">
              {order.groupLink}
            </a>
          </div>
          <div>
            <p className="text-[var(--muted)] text-xs mb-1">No. Telepon</p>
            <p className="font-medium">{order.contactPhone || "-"}</p>
          </div>
          <div>
            <p className="text-[var(--muted)] text-xs mb-1">Email</p>
            <p className="font-medium">{order.contactEmail || "-"}</p>
          </div>
          <div>
            <p className="text-[var(--muted)] text-xs mb-1">Dibuat</p>
            <p className="font-medium">{new Date(order.createdAt).toLocaleString("id-ID")}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--card-border)]">
          {(order.status === "PENDING" || order.status === "EXPIRED" || order.status === "CANCELLED") && (
            <button onClick={() => handleAction("activate")} disabled={actionLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm rounded-lg transition disabled:opacity-50">
              Aktifkan Manual
            </button>
          )}
          {order.status === "PENDING" && (
            <button onClick={() => handleAction("cancel")} disabled={actionLoading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm rounded-lg transition disabled:opacity-50">
              Batalkan
            </button>
          )}
        </div>

        {/* Logs */}
        {order.logs && order.logs.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
            <h3 className="text-sm font-medium mb-3">Riwayat</h3>
            <div className="space-y-2">
              {order.logs.map((log: any) => (
                <div key={log.id} className="text-xs flex justify-between">
                  <div>
                    <span className="text-[var(--muted)]">{log.action}</span>
                    {log.details && <span className="ml-2">{log.details}</span>}
                  </div>
                  <span className="text-[var(--muted)] shrink-0 ml-4">
                    {new Date(log.createdAt).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
