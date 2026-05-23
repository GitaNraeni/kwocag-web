"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface OrderData {
  orderCode: string;
  botType: string;
  duration: string;
  customDays?: number | null;
  groupLink: string;
  totalPrice: number;
  status: string;
  paymentUrl?: string | null;
  paidAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  logs: { id: string; action: string; details?: string | null; createdAt: string }[];
}

const statusColors: Record<string, string> = {
  PENDING: "text-[var(--warning)]",
  SUCCESS: "text-[var(--success)]",
  EXPIRED: "text-[var(--danger)]",
  CANCELLED: "text-[var(--muted)]",
};

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  SUCCESS: "Pembayaran Berhasil",
  EXPIRED: "Kadaluarsa",
  CANCELLED: "Dibatalkan",
};

export default function OrderStatusPage() {
  const params = useParams();
  const code = params.code as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.data);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--muted)]">
        Memuat...
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[var(--muted)]">Order tidak ditemukan</p>
        <Link href="/check" className="text-[var(--primary)] hover:underline">
          Coba lagi
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-[var(--muted)] hover:text-white text-sm mb-6 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Order {order.orderCode}</h1>
            <span className={`text-sm font-medium ${statusColors[order.status] || ""}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Tipe Bot</span>
              <span>{order.botType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Durasi</span>
              <span>
                {order.duration === "WEEKLY"
                  ? "1 Minggu"
                  : order.duration === "MONTHLY"
                  ? "1 Bulan"
                  : `${order.customDays} Hari`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Total</span>
              <span className="font-medium">Rp {order.totalPrice.toLocaleString("id-ID")}</span>
            </div>
            {order.expiresAt && (
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Aktif Sampai</span>
                <span>{new Date(order.expiresAt).toLocaleDateString("id-ID")}</span>
              </div>
            )}
          </div>

          {/* Payment button if pending */}
          {order.status === "PENDING" && order.paymentUrl && (
            <a
              href={order.paymentUrl}
              className="block text-center bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-2.5 rounded-lg font-medium transition mt-6"
            >
              Bayar Sekarang (QRIS)
            </a>
          )}

          {/* Logs */}
          {order.logs.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
              <h3 className="text-sm font-medium mb-3">Riwayat</h3>
              <div className="space-y-2">
                {order.logs.map((log) => (
                  <div key={log.id} className="text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">{log.action}</span>
                      <span className="text-[var(--muted)]">
                        {new Date(log.createdAt).toLocaleString("id-ID")}
                      </span>
                    </div>
                    {log.details && <p className="mt-0.5">{log.details}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
