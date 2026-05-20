"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditBotPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [weeklyPrice, setWeeklyPrice] = useState(0);
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [customPrice, setCustomPrice] = useState(0);
  const [maxSlots, setMaxSlots] = useState(0);
  const [totalInstances, setTotalInstances] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/bots")
      .then(r => { if (r.status === 401) { router.push("/admin"); return null; } return r.json(); })
      .then(data => {
        if (!data?.success) return;
        const bot = data.data.find((b: any) => b.id === id);
        if (bot) {
          setName(bot.name);
          setSlug(bot.slug);
          setDescription(bot.description);
          setFeatures(bot.features.join("\n"));
          setWeeklyPrice(bot.prices.find((p: any) => p.duration === "WEEKLY")?.price || 0);
          setMonthlyPrice(bot.prices.find((p: any) => p.duration === "MONTHLY")?.price || 0);
          setCustomPrice(bot.prices.find((p: any) => p.duration === "CUSTOM")?.price || 0);
          setMaxSlots(bot.maxSlots || 0);
          setTotalInstances(bot.totalInstances || 1);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSubmitting(true);

    const prices = [];
    if (weeklyPrice > 0) prices.push({ duration: "WEEKLY" as const, price: weeklyPrice });
    if (monthlyPrice > 0) prices.push({ duration: "MONTHLY" as const, price: monthlyPrice });
    if (customPrice > 0) prices.push({ duration: "CUSTOM" as const, price: customPrice });

    try {
      const res = await fetch(`/api/admin/bots/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, features: features.split("\n").filter(f => f.trim()), prices, maxSlots: maxSlots || 0, totalInstances: totalInstances || 1 }),
      });
      const data = await res.json();
      if (data.success) router.push("/admin/dashboard/bots");
      else setError(data.message);
    } catch { setError("Gagal menyimpan"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <p className="text-[var(--muted)]">Memuat...</p>;

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
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Fitur (1 per baris)</label>
          <textarea required value={features} onChange={(e) => setFeatures(e.target.value)} rows={4}
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Harga /Minggu</label>
            <input type="number" min={0} value={weeklyPrice} onChange={(e) => setWeeklyPrice(parseInt(e.target.value) || 0)}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Harga /Bulan</label>
            <input type="number" min={0} value={monthlyPrice} onChange={(e) => setMonthlyPrice(parseInt(e.target.value) || 0)}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Harga /Hari</label>
            <input type="number" min={0} value={customPrice} onChange={(e) => setCustomPrice(parseInt(e.target.value) || 0)}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Max Slot (0 = unlimited)</label>
          <input type="number" min={0} value={maxSlots} onChange={(e) => setMaxSlots(parseInt(e.target.value) || 0)}
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Jumlah Nomor Bot (Instance)</label>
          <input type="number" min={1} value={totalInstances} onChange={(e) => setTotalInstances(parseInt(e.target.value) || 1)}
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]" />
        </div>

        {error && <p className="text-[var(--danger)] text-xs">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white rounded-xl font-medium transition">
          {submitting ? "Menyimpan..." : "Update"}
        </button>
      </form>
    </div>
  );
}
