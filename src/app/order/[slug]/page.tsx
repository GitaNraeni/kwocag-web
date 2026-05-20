"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import PaymentQR from "@/components/PaymentQR";

interface Price {
  id: string;
  duration: string;
  price: number;
}

interface BotType {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  prices: Price[];
}

export default function OrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const isExtend = searchParams.get("mode") === "extend";

  const [bot, setBot] = useState<BotType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form
  const [step, setStep] = useState<"form" | "payment">("form");
  const [duration, setDuration] = useState<string>("");
  const [customDays, setCustomDays] = useState<number>(30);
  const [groupLink, setGroupLink] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Payment result
  const [paymentUrl, setPaymentUrl] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [finalAmount, setFinalAmount] = useState(0);
  const [adminFeeAmount, setAdminFeeAmount] = useState(0);

  useEffect(() => {
    fetch("/api/bots")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const found = data.data.find((b: BotType) => b.slug === slug);
          if (found) {
            setBot(found);
            if (found.prices.length > 0) setDuration(found.prices[0].duration);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const getTotal = () => {
    if (!bot) return 0;
    const priceRecord = bot.prices.find((p) => p.duration === duration);
    if (!priceRecord) return 0;
    if (duration === "CUSTOM") {
      return priceRecord.price * customDays; // price = per hari
    }
    return priceRecord.price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bot) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botTypeId: bot.id,
          duration,
          customDays: duration === "CUSTOM" ? customDays : undefined,
          groupLink,
          contactPhone: contactPhone || undefined,
          contactEmail: contactEmail || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaymentUrl(data.data.paymentUrl);
        setQrImage(data.data.qrImage || "");
        setOrderCode(data.data.orderCode);
        setFinalAmount(data.data.totalPrice);
        setAdminFeeAmount(data.data.adminFee || 0);
        setStep("payment");
      } else {
        setError(data.message || "Gagal membuat order");
      }
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--muted)]">Memuat...</div>;
  }

  if (!bot) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[var(--muted)]">Bot tidak ditemukan</p>
        <Link href="/order" className="text-[var(--primary)] hover:underline">Kembali</Link>
      </div>
    );
  }

  // Payment step - show QR image
  if (step === "payment") {
    // Kalau ada qrImage langsung (Ramashop), pakai itu. Kalau gak, generate dari paymentUrl (Pakasir)
    const qrImageUrl = qrImage || `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(paymentUrl)}`;

    return <PaymentQR orderCode={orderCode} amount={finalAmount} adminFee={adminFeeAmount} basePrice={getTotal()} qrUrl={qrImageUrl} />;
  }

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-lg mx-auto">
        <Link href="/order" className="text-[var(--muted)] hover:text-white text-sm mb-6 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6">
          <h1 className="text-2xl font-bold mb-1">{bot.name}</h1>
          <p className="text-[var(--muted)] text-sm mb-6">{bot.description}</p>

          {/* Features */}
          <div className="mb-6 pb-6 border-b border-[var(--card-border)]">
            <ul className="grid grid-cols-1 gap-1.5 text-sm">
              {bot.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--success)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[var(--muted)]">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Durasi */}
            <div>
              <label className="block text-sm font-medium mb-2">Pilih Durasi</label>
              <div className="space-y-2">
                {bot.prices.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                      duration === p.duration
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--card-border)] hover:border-[var(--muted)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="duration"
                        value={p.duration}
                        checked={duration === p.duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="accent-[var(--primary)]"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {p.duration === "WEEKLY" ? "1 Minggu" : p.duration === "MONTHLY" ? "1 Bulan" : "Custom"}
                        </p>
                        {p.duration === "WEEKLY" && slug === "bot-resbot" && (
                          <p className="text-xs text-[var(--muted)]">Sewa biasa</p>
                        )}
                        {p.duration === "MONTHLY" && slug === "bot-resbot" && (
                          <p className="text-xs text-[var(--muted)]">Auto VIP/Premium</p>
                        )}
                        {p.duration === "CUSTOM" && (
                          <p className="text-xs text-[var(--muted)]">Rp {p.price.toLocaleString("id-ID")}/hari (min 30 hari)</p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold">
                      {p.duration === "CUSTOM"
                        ? `Rp ${(p.price * customDays).toLocaleString("id-ID")}`
                        : `Rp ${p.price.toLocaleString("id-ID")}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom days */}
            {duration === "CUSTOM" && (
              <div>
                <label className="block text-sm font-medium mb-2">Jumlah Hari</label>
                <input
                  type="number"
                  min={30}
                  max={365}
                  value={customDays}
                  onChange={(e) => setCustomDays(Math.max(30, parseInt(e.target.value) || 30))}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                />
                <p className="text-xs text-[var(--muted)] mt-1">Minimal 30 hari untuk custom</p>
              </div>
            )}

            {/* Link Grup */}
            <div>
              <label className="block text-sm font-medium mb-2">Link Grup WhatsApp</label>
              <input
                type="url"
                required
                placeholder="https://chat.whatsapp.com/xxxxx"
                value={groupLink}
                onChange={(e) => setGroupLink(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)]"
              />
              {isExtend ? (
                <p className="text-xs text-[var(--warning)] mt-1.5">Pastikan bot sudah ada di dalam grup ini</p>
              ) : (
                <p className="text-xs text-[var(--warning)] mt-1.5">Matikan fitur persetujuan admin agar bot tidak error saat join</p>
              )}
            </div>

            {/* Kontak */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">No. HP</label>
                <input
                  type="tel"
                  placeholder="08xxx"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  placeholder="opsional"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            {/* Total */}
            <div className="bg-[var(--background)] rounded-xl p-4 flex justify-between items-center">
              <span className="text-[var(--muted)] text-sm">Total (QRIS)</span>
              <span className="text-xl font-bold">Rp {getTotal().toLocaleString("id-ID")}</span>
            </div>

            {error && (
              <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white py-3.5 rounded-xl font-medium transition"
            >
              {submitting ? "Memproses..." : "Lanjut ke Pembayaran"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
