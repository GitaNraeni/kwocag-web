"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("PENDING");
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    fetch(`/api/orders/${code}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setOrder(d.data);
          setStatus(d.data.status);
        }
      })
      .finally(() => setLoading(false));
  }, [code]);

  // Poll payment status
  useEffect(() => {
    if (status !== "PENDING") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${code}/check-payment`);
        const data = await res.json();
        if (data.status === "SUCCESS") {
          setStatus("SUCCESS");
          clearInterval(interval);
          setTimeout(() => router.push(`/order/status/${code}`), 1500);
        } else if (data.status === "CANCELLED" || data.status === "EXPIRED") {
          setStatus(data.status);
          clearInterval(interval);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [code, status]);

  // Timer
  useEffect(() => {
    if (status !== "PENDING") return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const handleDownload = async () => {
    if (!order?.paymentUrl) return;
    try {
      const qrImageUrl = order.paymentUrl.startsWith("data:") || order.paymentUrl.includes("ramashop")
        ? order.paymentUrl
        : `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(order.paymentUrl)}`;
      const res = await fetch(qrImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QRIS-${code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {}
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--muted)]">Memuat...</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[var(--muted)]">Order tidak ditemukan</p>
        <Link href="/" className="text-[var(--primary)] hover:underline">Kembali</Link>
      </div>
    );
  }

  if (status === "SUCCESS") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Pembayaran Berhasil</h2>
            <p className="text-sm text-[var(--muted)]">Bot sedang dalam proses aktivasi</p>
          </div>
        </div>
      </div>
    );
  }

  if (status !== "PENDING") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-2">Order {status === "CANCELLED" ? "Dibatalkan" : "Kedaluwarsa"}</h2>
            <p className="text-sm text-[var(--muted)] mb-4">Silakan buat order baru</p>
            <Link href="/order" className="text-[var(--primary)] text-sm hover:underline">Order Baru</Link>
          </div>
        </div>
      </div>
    );
  }

  const qrUrl = order.paymentUrl?.includes("ramashop") || order.paymentUrl?.startsWith("data:")
    ? order.paymentUrl
    : `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(order.paymentUrl || "")}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="max-w-sm w-full">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 text-center">
          <p className="text-sm text-[var(--muted)] mb-1">Total Pembayaran</p>
          <p className="text-2xl font-bold text-[var(--primary)] mb-5">
            Rp {order.totalPrice?.toLocaleString("id-ID")}
          </p>

          <div className="bg-white rounded-xl p-4 inline-block mb-4">
            <img src={qrUrl} alt="QRIS" width={250} height={250} className="block" />
          </div>

          <p className="text-xs text-[var(--muted)] mb-1">Scan QR dengan e-wallet atau m-banking</p>
          <p className="text-xs text-[var(--muted)] mb-4 font-mono">{code}</p>

          <div className="flex items-center justify-center gap-2 text-xs text-[var(--muted)] mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--warning)] animate-pulse" />
            Menunggu pembayaran...
          </div>
          <p className="text-xs text-[var(--muted)] mb-5">
            Batas waktu: <span className={`font-mono font-medium ${timeLeft < 60 ? "text-[var(--danger)]" : ""}`}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
          </p>

          {/* Download QRIS */}
          <button
            onClick={handleDownload}
            className="w-full py-2.5 mb-3 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] rounded-xl text-sm font-medium transition"
          >
            Download QRIS
          </button>

          <Link
            href={`/order/status/${code}`}
            className="block w-full py-2.5 border border-[var(--card-border)] hover:border-[var(--muted)] text-[var(--muted)] rounded-xl text-sm transition text-center"
          >
            Lihat Status Order
          </Link>
        </div>
      </div>
    </div>
  );
}
