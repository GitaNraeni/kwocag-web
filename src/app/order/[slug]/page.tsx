"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Price {
  id: string;
  duration: string;
  tier: string;
  price: number;
}

interface BotType {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  prices: Price[];
  hasPremiumTier?: boolean;
}

export default function OrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const isExtend = searchParams.get("mode") === "extend";

  const [bot, setBot] = useState<BotType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Form
  const [tier, setTier] = useState<"basic" | "premium">("basic");
  const [duration, setDuration] = useState<string>("");
  const [customDays, setCustomDays] = useState<number>(1);
  const [groupLink, setGroupLink] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  useEffect(() => {
    fetch("/api/bots")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const found = data.data.find((b: BotType) => b.slug === slug);
          if (found) {
            setBot(found);
            // Set default duration dari harga pertama yang sesuai tier
            const firstPrice = found.prices.find((p: Price) => p.tier === "basic");
            if (firstPrice) setDuration(firstPrice.duration);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const [adminFeeConfig, setAdminFeeConfig] = useState({ flat: 0, percent: 0 });

  useEffect(() => {
    fetch("/api/site").then(r => r.json()).then(d => {
      if (d.success) setAdminFeeConfig({ flat: d.data.adminFee || 0, percent: d.data.adminFeePercent || 0 });
    }).catch(() => {});
  }, []);

  // Filter prices by current tier
  const currentPrices = bot?.prices.filter((p) => p.tier === tier) || [];

  // When tier changes, reset duration to first available
  useEffect(() => {
    if (bot) {
      const firstPrice = bot.prices.find((p) => p.tier === tier);
      if (firstPrice) setDuration(firstPrice.duration);
    }
  }, [tier, bot]);

  const getTotal = () => {
    if (!bot) return 0;
    const priceRecord = currentPrices.find((p) => p.duration === duration);
    if (!priceRecord) return 0;
    if (duration === "CUSTOM") return priceRecord.price * customDays;
    return priceRecord.price;
  };

  const getFee = () => adminFeeConfig.flat + Math.ceil(getTotal() * adminFeeConfig.percent / 100);
  const getGrandTotal = () => getTotal() + getFee();

  const cleanGroupLink = (value: string) =>
    value.trim().split("?")[0].trim().replace(/\/+$/, "");

  // Validasi link grup WhatsApp
  const isValidGroupLink = (link: string) =>
    /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{10,}$/.test(cleanGroupLink(link));

  const handleGroupLinkChange = (value: string) => {
    setGroupLink(cleanGroupLink(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bot) return;
    const cleanedGroupLink = cleanGroupLink(groupLink);
    if (!isValidGroupLink(cleanedGroupLink)) {
      setError("Link grup tidak valid. Gunakan link dari WhatsApp (https://chat.whatsapp.com/...)");
      return;
    }
    setGroupLink(cleanedGroupLink);
    setError("");
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!bot) return;
    const cleanedGroupLink = cleanGroupLink(groupLink);
    setShowConfirm(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botTypeId: bot.id,
          duration,
          tier,
          customDays: duration === "CUSTOM" ? customDays : undefined,
          groupLink: cleanedGroupLink,
          contactPhone: contactPhone || undefined,
          contactEmail: contactEmail || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/order/pay/${data.data.orderCode}`);
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

  // Form page
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
            {/* Tier selector - only show if bot has premium tier */}
            {bot.hasPremiumTier && (
              <div>
                <label className="block text-sm font-medium mb-2">Pilih Tipe</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTier("basic")}
                    className={`py-2.5 rounded-xl text-sm font-medium transition border ${
                      tier === "basic"
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--muted)]"
                    }`}
                  >
                    Basic
                  </button>
                  <button
                    type="button"
                    onClick={() => setTier("premium")}
                    className={`py-2.5 rounded-xl text-sm font-medium transition border ${
                      tier === "premium"
                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                        : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--muted)]"
                    }`}
                  >
                    Premium
                  </button>
                </div>
                {tier === "premium" && (
                  <p className="text-xs text-purple-400 mt-1.5">Fitur premium grup aktif selama durasi sewa</p>
                )}
              </div>
            )}

            {/* Durasi */}
            <div>
              <label className="block text-sm font-medium mb-2">Pilih Durasi</label>
              <div className="space-y-2">
                {currentPrices.map((p) => (
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
                        {p.duration === "CUSTOM" && (
                          <p className="text-xs text-[var(--muted)]">Rp {p.price.toLocaleString("id-ID")}/hari</p>
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
                  min={1}
                  max={365}
                  value={customDays}
                  onChange={(e) => setCustomDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                />
                <p className="text-xs text-[var(--muted)] mt-1">Minimal 1 hari</p>
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
                className={`w-full bg-[var(--background)] border rounded-xl px-4 py-3 text-sm focus:outline-none transition ${
                  groupLink && !isValidGroupLink(groupLink)
                    ? "border-[var(--danger)] focus:border-[var(--danger)]"
                    : groupLink && isValidGroupLink(groupLink)
                    ? "border-[var(--success)] focus:border-[var(--success)]"
                    : "border-[var(--card-border)] focus:border-[var(--primary)]"
                }`}
              />
              {isExtend ? (
                <p className="text-xs text-[var(--warning)] mt-1.5 font-bold">
                  Pastikan bot berada di grup yang ingin diperpanjang
                </p>
              ) : (
                <p className={`text-xs mt-1.5 font-bold ${
                  !groupLink
                    ? "text-[var(--warning)]"
                    : !isValidGroupLink(groupLink)
                    ? "text-[var(--danger)]"
                    : "text-[var(--success)]"
                }`}>
                  {!groupLink
                    ? "Matikan persetujuan admin agar bot tidak error saat join"
                    : !isValidGroupLink(groupLink)
                    ? "Link tidak valid, harus diawali https://chat.whatsapp.com/"
                    : "Link (grup) berhasil ditambahkan/terdeteksi"
                  }
                </p>
              )}
            </div>

            {/* Kontak */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">No. HP <span className="text-[var(--danger)]">*</span></label>
                <input
                  type="tel"
                  required
                  minLength={10}
                  maxLength={15}
                  placeholder="08xxx"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 15))}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                />
                {contactPhone && contactPhone.length < 10 && (
                  <p className="text-xs text-[var(--danger)] mt-1">Minimal 10 digit</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  placeholder="opsional@kwocag.web.id"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            {/* Total */}
            <div className="bg-[var(--background)] rounded-xl p-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Harga {tier === "premium" ? "(Premium)" : ""}</span>
                <span>Rp {getTotal().toLocaleString("id-ID")}</span>
              </div>
              {getFee() > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Biaya layanan</span>
                  <span>Rp {getFee().toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[var(--card-border)]">
                <span className="text-[var(--muted)] text-sm font-medium">Total</span>
                <span className="text-xl font-bold">Rp {getGrandTotal().toLocaleString("id-ID")}</span>
              </div>
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

      {/* Modal Konfirmasi */}
      {showConfirm && bot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Konfirmasi Order</h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Bot</span>
                <span className="font-medium">{bot.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Durasi</span>
                <span className="font-medium">
                  {duration === "WEEKLY" ? "1 Minggu" : duration === "MONTHLY" ? "1 Bulan" : `${customDays} Hari`}
                </span>
              </div>
              {bot.hasPremiumTier && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Tipe</span>
                  <span className={`font-medium ${tier === "premium" ? "text-purple-400" : ""}`}>
                    {tier === "premium" ? "Premium" : "Basic"}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Grup</span>
                <span className="font-medium text-xs text-right max-w-[180px] break-all">{groupLink}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[var(--card-border)]">
                <span className="text-[var(--muted)] font-medium">Total</span>
                <span className="font-bold text-[var(--primary)]">Rp {getGrandTotal().toLocaleString("id-ID")}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-[var(--card-border)] hover:border-[var(--muted)] text-[var(--muted)] rounded-xl text-sm transition"
              >
                Ubah
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition"
              >
                {submitting ? "Memproses..." : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}