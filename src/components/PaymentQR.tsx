"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";

interface Props {
  orderCode: string;
  amount: number;
  basePrice?: number;
  adminFee?: number;
  qrUrl: string;
}

export default function PaymentQR({ orderCode, amount, basePrice, adminFee, qrUrl }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("PENDING");
  const [checking, setChecking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 menit = 300 detik

  useEffect(() => {
    if (status !== "PENDING") return;
    const interval = setInterval(async () => {
      if (checking) return;
      setChecking(true);
      try {
        const res = await fetch(`/api/orders/${orderCode}/check-payment`);
        const data = await res.json();
        if (data.status === "SUCCESS") {
          setStatus("SUCCESS");
          clearInterval(interval);
          setTimeout(() => router.push(`/order/status/${orderCode}`), 1500);
        } else if (data.status === "CANCELLED") {
          setStatus("CANCELLED");
          clearInterval(interval);
        }
      } catch { /* skip */ }
      finally { setChecking(false); }
    }, 5000);
    return () => clearInterval(interval);
  }, [orderCode, status]);

  // Timer countdown
  useEffect(() => {
    if (status !== "PENDING") return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCancel(); // auto cancel
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await fetch(`/api/orders/${orderCode}/cancel`, { method: "POST" });
      setStatus("CANCELLED");
    } catch { /* skip */ }
    finally { setCancelling(false); }
  };

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
            <p className="text-sm text-[var(--muted)]">Bot akan segera join ke grup kamu</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "CANCELLED") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-2">Pembayaran Dibatalkan</h2>
            <p className="text-sm text-[var(--muted)] mb-4">Order telah dibatalkan</p>
            <button onClick={() => router.push("/order")} className="text-[var(--primary)] text-sm hover:underline">
              Buat order baru
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="max-w-sm w-full">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 text-center">
          <p className="text-sm text-[var(--muted)] mb-1">Total Pembayaran</p>
          <p className="text-2xl font-bold text-[var(--primary)] mb-2">
            Rp {amount.toLocaleString("id-ID")}
          </p>
          {adminFee && adminFee > 0 && basePrice ? (
            <div className="text-xs text-[var(--muted)] mb-5 space-y-0.5">
              <p>Harga: Rp {basePrice.toLocaleString("id-ID")}</p>
              <p>Biaya layanan: Rp {adminFee.toLocaleString("id-ID")}</p>
            </div>
          ) : <div className="mb-5" />}

          <div className="bg-white rounded-xl p-4 inline-block mb-4">
            <img src={qrUrl} alt="QRIS" width={250} height={250} className="block" />
          </div>

          <p className="text-xs text-[var(--muted)] mb-1">Scan dengan e-wallet atau m-banking</p>
          <p className="text-xs text-[var(--muted)] mb-4 font-mono">{orderCode}</p>

          <div className="flex items-center justify-center gap-2 text-xs text-[var(--muted)] mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--warning)] animate-pulse" />
            Menunggu pembayaran...
          </div>
          <p className="text-xs text-[var(--muted)] mb-5">
            Batas waktu: <span className={`font-mono font-medium ${timeLeft < 60 ? "text-[var(--danger)]" : ""}`}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
          </p>

          <button
            onClick={() => setShowCancelModal(true)}
            disabled={cancelling}
            className="w-full py-2.5 border border-[var(--card-border)] hover:border-[var(--danger)] text-[var(--muted)] hover:text-[var(--danger)] rounded-xl text-sm transition disabled:opacity-50"
          >
            {cancelling ? "Membatalkan..." : "Batalkan"}
          </button>
        </div>
      </div>

      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Batalkan Pembayaran?"
        message="Order akan dibatalkan dan tidak bisa dikembalikan."
        confirmText="Ya, Batalkan"
        cancelText="Tidak"
        variant="danger"
      />
    </div>
  );
}
