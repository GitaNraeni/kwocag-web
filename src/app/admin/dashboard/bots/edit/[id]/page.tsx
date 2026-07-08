"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditBotPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [featuresBasic, setFeaturesBasic] = useState("");
  const [featuresPremium, setFeaturesPremium] = useState("");
  const [weeklyPrice, setWeeklyPrice] = useState(0);
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [customPrice, setCustomPrice] = useState(0);
  const [maxSlots, setMaxSlots] = useState(0);
  const [totalInstances, setTotalInstances] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [hasPremiumTier, setHasPremiumTier] = useState(false);
  const [premiumWeeklyPrice, setPremiumWeeklyPrice] = useState(0);
  const [premiumMonthlyPrice, setPremiumMonthlyPrice] = useState(0);
  const [premiumCustomPrice, setPremiumCustomPrice] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/bots/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const bot = data.data;
          setName(bot.name);
          setSlug(bot.slug);
          setDescription(bot.description);

          // Fitur basic & premium
          if (bot.featuresBasic?.length) {
            setFeaturesBasic(bot.featuresBasic.join("\n"));
          } else {
            setFeaturesBasic(bot.features?.join("\n") || "");
          }
          setFeaturesPremium(bot.featuresPremium?.join("\n") || "");

          setMaxSlots(bot.maxSlots || 0);
          setTotalInstances(bot.totalInstances || 1);
          setIsActive(bot.isActive !== false);
          setAcceptingOrders(bot.acceptingOrders !== false);
          setHasPremiumTier(bot.hasPremiumTier || false);

          // Harga basic
          const prices = bot.prices || [];
          const bw = prices.find((p: any) => p.duration === "WEEKLY" && p.tier === "basic");
          const bm = prices.find((p: any) => p.duration === "MONTHLY" && p.tier === "basic");
          const bc = prices.find((p: any) => p.duration === "CUSTOM" && p.tier === "basic");
          if (bw) setWeeklyPrice(bw.price);
          if (bm) setMonthlyPrice(bm.price);
          if (bc) setCustomPrice(bc.price);

          // Harga premium
          const pw = prices.find((p: any) => p.duration === "WEEKLY" && p.tier === "premium");
          const pm = prices.find((p: any) => p.duration === "MONTHLY" && p.tier === "premium");
          const pc = prices.find((p: any) => p.duration === "CUSTOM" && p.tier === "premium");
          if (pw) setPremiumWeeklyPrice(pw.price);
          if (pm) setPremiumMonthlyPrice(pm.price);
          if (pc) setPremiumCustomPrice(pc.price);
        }
      })
      .catch(() => setError("Gagal memuat data bot"))
      .finally(() => setLoading(false));
  }, [id]);

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

    const basicArr = featuresBasic.split("\n").map(f => f.trim()).filter(Boolean);
    const premiumArr = featuresPremium.split("\n").map(f => f.trim()).filter(Boolean);

    try {
      const res = await fetch(`/api/admin/bots/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, slug, description,
          features: basicArr,
          featuresBasic: basicArr,
          featuresPremium: premiumArr,
          prices, maxSlots: maxSlots || 0,
          totalInstances: totalInstances || 1,
          isActive, acceptingOrders, hasPremiumTier,
        }),
      });
      const data = await res.json();
      if (data.success) router.push("/admin/dashboard/bots");
      else setError(data.message);
    } catch { setError("Gagal menyimpan"); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="max-w-xl">
        <div className="skeleton h-6 w-24 mb-6" />
        <div className="skeleton h-8 w-40 mb-6" />
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-10 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <Link href="/admin/dashboard/bots" className="text-sm text-[var(--muted)] hover:text-white mb-6 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Kembali
      </Link>

      <h2 className="text-2xl font-bold mb-6">Edit Bot</h2>

      <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Nama</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
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

        {/* Fitur split 2 kolom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Fitur Basic (satu per baris)</label>
            <textarea value={featuresBasic} onChange={(e) => setFeaturesBasic(e.target.value)} rows={5}
              placeholder={"Anti Spam\nAnti Link\nAnti Flood"}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] resize-none" />
          </div>
          <div>
            <label className="block text-xs text-purple-400 mb-1">Fitur Premium (satu per baris)</label>
            <textarea value={featuresPremium} onChange={(e) => setFeaturesPremium(e.target.value)} rows={5}
              placeholder={"Semua fitur Basic\nAI Chat\nAuto Reply"}
              className="w-full bg-[var(--background)] border border-purple-500/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 resize-none" />
          </div>
        </div>

        {/* Basic prices */}
        <div>
          <label className="block text-xs text-[var(--muted)] mb-2">Harga Basic</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "/Minggu", val: weeklyPrice, set: setWeeklyPrice },
              { label: "/Bulan", val: monthlyPrice, set: setMonthlyPrice },
              { label: "/Hari (Custom)", val: customPrice, set: setCustomPrice },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label className="block text-[10px] text-[var(--muted)] mb-1">{label}</label>
                <input type="number" min={0} value={val} onChange={(e) => set(parseInt(e.target.value) || 0)}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
              </div>
            ))}
          </div>
        </div>

        {/* Premium tier toggle */}
        <div className="border-t border-[var(--card-border)] pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={hasPremiumTier} onChange={(e) => setHasPremiumTier(e.target.checked)}
              className="accent-purple-500 w-4 h-4" />
            <div>
              <span className="text-sm font-medium">Punya Tier Premium</span>
              <p className="text-xs text-[var(--muted)]">Aktifkan jika bot ini punya opsi premium</p>
            </div>
          </label>
        </div>

        {hasPremiumTier && (
          <div>
            <label className="block text-xs text-purple-400 mb-2">Harga Premium</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "/Minggu", val: premiumWeeklyPrice, set: setPremiumWeeklyPrice },
                { label: "/Bulan", val: premiumMonthlyPrice, set: setPremiumMonthlyPrice },
                { label: "/Hari (Custom)", val: premiumCustomPrice, set: setPremiumCustomPrice },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label className="block text-[10px] text-[var(--muted)] mb-1">{label}</label>
                  <input type="number" min={0} value={val} onChange={(e) => set(parseInt(e.target.value) || 0)}
                    className="w-full bg-[var(--background)] border border-purple-500/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Max Slot (0 = unlimited)</label>
            <input type="number" min={0} value={maxSlots} onChange={(e) => setMaxSlots(parseInt(e.target.value) || 0)}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Jumlah Instance</label>
            <input type="number" min={1} value={totalInstances} onChange={(e) => setTotalInstances(parseInt(e.target.value) || 1)}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
          </div>
        </div>

        {error && <p className="text-[var(--danger)] text-xs">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white rounded-xl font-medium transition">
          {submitting ? "Menyimpan..." : "Update Bot"}
        </button>
      </form>
    </div>
  );
}
