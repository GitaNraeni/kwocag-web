"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddBotPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [weeklyPrice, setWeeklyPrice] = useState(0);
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [customPrice, setCustomPrice] = useState(0);
  const [maxSlots, setMaxSlots] = useState(0);
  const [totalInstances, setTotalInstances] = useState(1);
  const [hasPremiumTier, setHasPremiumTier] = useState(false);
  const [premiumWeeklyPrice, setPremiumWeeklyPrice] = useState(0);
  const [premiumMonthlyPrice, setPremiumMonthlyPrice] = useState(0);
  const [premiumCustomPrice, setPremiumCustomPrice] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSubmitting(true);

    const prices: { duration: "WEEKLY" | "MONTHLY" | "CUSTOM"; price: number; tier: string }[] = [];
    if (weeklyPrice > 0) prices.push({ duration: "WEEKLY", price: weeklyPrice, tier: "basic" });
    if (monthlyPrice > 0) prices.push({ duration: "MONTHLY", price: monthlyPrice, tier: "basic" });
    if (customPrice > 0) prices.push({ duration: "CUSTOM", price: customPrice, tier: "basic" });

    if (hasPremiumTier) {
      if (premiumWeeklyPrice > 0) prices.push({ duration: "WEEKLY", price: premiumWeeklyPrice, tier: "premium" });
      if (premiumMonthlyPrice > 0) prices.push({ duration: "MONTHLY", price: premiumMonthlyPrice, tier: "premium" });
      if (premiumCustomPrice > 0) prices.push({ duration: "CUSTOM", price: premiumCustomPrice, tier: "premium" });
    }

    if (prices.length === 0) { setError("Minimal 1 harga harus diisi"); setSubmitting(false); return; }

    try {
      const res = await fetch("/api/admin/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, slug, description,
          features: features.split("\n").filter(f => f.trim()),
          prices, maxSlots: maxSlots || 0,
          totalInstances: totalInstances || 1,
          hasPremiumTier,
        }),
      });
      const data = await res.json();
      if (data.success) router.push("/admin/dashboard/bots");
      else setError(data.message);
    } catch { setError("Gagal menyimpan"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-xl">
      <Link href="/admin/dashboard/bots" className="text-sm text-[var(--muted)] hover:text-white mb-6 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Kembali
      </Link>

      <h2 className="text-2xl font-bold mb-6">Tambah Bot Baru</h2>

      <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Nama</label>
            <input type="text" required value={name} onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Slug</label>
            <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Deskripsi</label>
          <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Fitur (1 per baris)</label>
          <textarea required value={features} onChange={(e) => setFeatures(e.target.value)} rows={4}
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
        </div>

        {/* Basic prices */}
        <div>
          <label className="block text-xs text-[var(--muted)] mb-2">Harga Basic</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-[var(--muted)] mb-1">/Minggu</label>
              <input type="number" min={0} value={weeklyPrice} onChange={(e) => setWeeklyPrice(parseInt(e.target.value) || 0)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--muted)] mb-1">/Bulan</label>
              <input type="number" min={0} value={monthlyPrice} onChange={(e) => setMonthlyPrice(parseInt(e.target.value) || 0)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--muted)] mb-1">/Hari (Custom)</label>
              <input type="number" min={0} value={customPrice} onChange={(e) => setCustomPrice(parseInt(e.target.value) || 0)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
            </div>
          </div>
        </div>

        {/* Premium tier toggle */}
        <div className="border-t border-[var(--card-border)] pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={hasPremiumTier} onChange={(e) => setHasPremiumTier(e.target.checked)}
              className="accent-purple-500 w-4 h-4" />
            <div>
              <span className="text-sm font-medium">Punya Tier Premium</span>
              <p className="text-xs text-[var(--muted)]">Aktifkan jika bot ini punya opsi premium (fitur grup premium)</p>
            </div>
          </label>
        </div>

        {/* Premium prices */}
        {hasPremiumTier && (
          <div>
            <label className="block text-xs text-purple-400 mb-2">Harga Premium</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-[var(--muted)] mb-1">/Minggu</label>
                <input type="number" min={0} value={premiumWeeklyPrice} onChange={(e) => setPremiumWeeklyPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-[var(--background)] border border-purple-500/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--muted)] mb-1">/Bulan</label>
                <input type="number" min={0} value={premiumMonthlyPrice} onChange={(e) => setPremiumMonthlyPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-[var(--background)] border border-purple-500/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--muted)] mb-1">/Hari (Custom)</label>
                <input type="number" min={0} value={premiumCustomPrice} onChange={(e) => setPremiumCustomPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-[var(--background)] border border-purple-500/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500" />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Max Slot (0 = unlimited)</label>
          <input type="number" min={0} value={maxSlots} onChange={(e) => setMaxSlots(parseInt(e.target.value) || 0)}
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Jumlah Nomor Bot (Instance)</label>
          <input type="number" min={1} value={totalInstances} onChange={(e) => setTotalInstances(parseInt(e.target.value) || 1)}
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
          <p className="text-xs text-[var(--muted)] mt-1">Berapa nomor bot yang handle tipe ini. Slot dibagi rata per instance.</p>
        </div>

        {error && <p className="text-[var(--danger)] text-xs">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white rounded-xl font-medium transition">
          {submitting ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}
