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
  EXPIRED: "text-gray-400",
  CANCELLED: "text-[var(--danger)]",
};

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  SUCCESS: "Berhasil",
  EXPIRED: "Kedaluwarsa",
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold">Order</h1>
              <button
                onClick={() => { navigator.clipboard.writeText(order.orderCode); }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--card-border)] hover:bg-[var(--muted)]/20 text-[10px] sm:text-xs font-mono transition"
                title="Copy kode order"
              >
                {order.orderCode}
                <svg className="w-3 h-3 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
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
                <span>{new Date(order.expiresAt).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" })}</span>
              </div>
            )}
          </div>

          {/* Payment button if pending */}
          {order.status === "PENDING" && (
            <a
              href={`/order/pay/${order.orderCode}`}
              className="block text-center bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-2.5 rounded-lg font-medium transition mt-6"
            >
              Bayar Sekarang (QRIS)
            </a>
          )}

          {order.status === "SUCCESS" && (
            <div className="mt-6 p-4 rounded-xl bg-[var(--success)]/5 border border-[var(--success)]/20 text-center">
              {order.logs.some((l: any) => l.action === "BOT_JOINED" || l.action === "BOT_EXTENDED") ? (
                <>
                  <p className="text-sm text-[var(--success)] font-medium">
                    {order.logs.some((l: any) => l.action === "BOT_EXTENDED")
                      ? "Sewa berhasil diperpanjang"
                      : "Bot sudah aktif di grup kamu"}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {order.logs.some((l: any) => l.action === "BOT_EXTENDED")
                      ? "Bot tetap aktif di grup kamu"
                      : "Gunakan perintah .menu untuk melihat fitur"}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-[var(--success)] font-medium">Pembayaran berhasil diterima</p>
                  <p className="text-xs text-[var(--muted)] mt-1">Bot sedang dalam proses join ke grup kamu</p>
                </>
              )}
            </div>
          )}

          {/* Contact admin button */}
          <ContactAdminButton orderCode={order.orderCode} />

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

function ContactAdminButton({ orderCode }: { orderCode: string }) {
  const [contact, setContact] = useState("");

  useEffect(() => {
    fetch("/api/site").then(r => r.json()).then(d => {
      if (d.success && d.data.contactWhatsapp) setContact(d.data.contactWhatsapp);
    }).catch(() => {});
  }, []);

  if (!contact) return null;

  const message = encodeURIComponent(`Halo min, saya mau tanya soal order ${orderCode}`);
  const waLink = `https://wa.me/${contact}?text=${message}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 mt-4 py-2.5 border border-[var(--card-border)] hover:border-green-500/30 rounded-lg text-sm text-[var(--muted)] hover:text-green-400 transition"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Hubungi Admin
    </a>
  );
}
