"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BotType {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  isActive: boolean;
  prices: { id: string; duration: string; price: number }[];
  _count: { orders: number };
}

export default function AdminBotsPage() {
  const router = useRouter();
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [weeklyPrice, setWeeklyPrice] = useState<number>(0);
  const [monthlyPrice, setMonthlyPrice] = useState<number>(0);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBots = () => {
    fetch("/api/admin/bots")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success) setBots(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const prices = [];
    if (weeklyPrice > 0) prices.push({ duration: "WEEKLY" as const, price: weeklyPrice });
    if (monthlyPrice > 0) prices.push({ duration: "MONTHLY" as const, price: monthlyPrice });
    if (customPrice > 0) prices.push({ duration: "CUSTOM" as const, price: customPrice });

    if (prices.length === 0) {
      setFormError("Minimal 1 harga harus diisi");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          features: features.split("\n").filter((f) => f.trim()),
          prices,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setName("");
        setSlug("");
        setDescription("");
        setFeatures("");
        setWeeklyPrice(0);
        setMonthlyPrice(0);
        setCustomPrice(0);
        fetchBots();
      } else {
        setFormError(data.message);
      }
    } catch {
      setFormError("Gagal menambah bot");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/bots/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchBots();
  };

  const deleteBot = async (id: string) => {
    if (!confirm("Yakin hapus tipe bot ini?")) return;
    await fetch(`/api/admin/bots/${id}`, { method: "DELETE" });
    fetchBots();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <header className="border-b border-[var(--card-border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold">Admin Dashboard</h1>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/dashboard" className="text-[var(--muted)] hover:text-white transition">
              Orders
            </Link>
            <Link href="/admin/bots" className="text-white font-medium">
              Kelola Bot
            </Link>
            <button onClick={handleLogout} className="text-[var(--danger)] hover:underline">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Tipe Bot</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm rounded-lg transition"
          >
            {showForm ? "Tutup Form" : "+ Tambah Bot"}
          </button>
        </div>

        {/* Add Bot Form */}
        {showForm && (
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 mb-6">
            <h3 className="font-medium mb-4">Tambah Tipe Bot Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Nama Bot</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }}
                    placeholder="Bot Store"
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="bot-store"
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Deskripsi</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bot untuk toko online WhatsApp"
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Fitur (1 per baris)</label>
                <textarea
                  required
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder={"Auto reply\nKatalog produk\nBroadcast pesan"}
                  rows={4}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">Harga /Minggu</label>
                  <input
                    type="number"
                    min={0}
                    value={weeklyPrice}
                    onChange={(e) => setWeeklyPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Harga /Bulan</label>
                  <input
                    type="number"
                    min={0}
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Harga Custom/30hr</label>
                  <input
                    type="number"
                    min={0}
                    value={customPrice}
                    onChange={(e) => setCustomPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {formError && <p className="text-[var(--danger)] text-sm">{formError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-[var(--success)] hover:bg-green-600 disabled:opacity-50 text-white text-sm rounded-lg transition"
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        )}

        {/* Bot List */}
        {loading ? (
          <p className="text-[var(--muted)]">Memuat...</p>
        ) : bots.length === 0 ? (
          <p className="text-[var(--muted)]">Belum ada tipe bot.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className={`bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 ${
                  !bot.isActive ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{bot.name}</h4>
                    <p className="text-xs text-[var(--muted)]">/{bot.slug} • {bot._count.orders} orders</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      bot.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {bot.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                <p className="text-sm text-[var(--muted)] mb-3">{bot.description}</p>

                <div className="text-xs space-y-1 mb-4">
                  {bot.prices.map((p) => (
                    <div key={p.id} className="flex justify-between">
                      <span>{p.duration}</span>
                      <span>Rp {p.price.toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(bot.id, bot.isActive)}
                    className="px-3 py-1 bg-[var(--card-border)] hover:bg-[var(--muted)]/30 text-xs rounded transition"
                  >
                    {bot.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button
                    onClick={() => deleteBot(bot.id)}
                    className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs rounded transition"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
