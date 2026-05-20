"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BotType {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  prices: { id: string; duration: string; price: number }[];
  acceptingOrders?: boolean;
  maxSlots?: number;
  _count?: { orders: number };
}

export default function OrderTypePage() {
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"new" | "extend">("new");

  useEffect(() => {
    fetch("/api/bots")
      .then((r) => r.json())
      .then((d) => { if (d.success) setBots(d.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-[var(--muted)] hover:text-white mb-6 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>

        {/* Toggle */}
        <div className="flex bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-1 mb-8">
          <button
            onClick={() => setMode("new")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${mode === "new" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"}`}
          >
            Sewa Baru
          </button>
          <button
            onClick={() => setMode("extend")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${mode === "extend" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"}`}
          >
            Perpanjang
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-2">
          {mode === "new" ? "Pilih Tipe Bot" : "Perpanjang Sewa"}
        </h1>
        <p className="text-[var(--muted)] text-sm mb-6">
          {mode === "new" ? "Pilih bot yang sesuai kebutuhan" : "Pilih tipe bot yang ingin diperpanjang"}
        </p>

        {loading ? (
          <p className="text-[var(--muted)] py-10 text-center">Memuat...</p>
        ) : bots.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)] flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-[var(--muted)] text-sm">Belum ada layanan tersedia saat ini.</p>
            <p className="text-[var(--muted)] text-xs mt-1">Silakan hubungi admin untuk informasi lebih lanjut.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bots.map((bot) => {
              const lowest = bot.prices.length > 0 ? Math.min(...bot.prices.map((p) => p.price)) : 0;
              const href = mode === "new" ? `/order/${bot.slug}` : `/order/${bot.slug}?mode=extend`;
              const isClosed = bot.acceptingOrders === false;
              const hasSlotLimit = bot.maxSlots !== undefined && bot.maxSlots > 0;
              const activeCount = bot._count?.orders || 0;
              const slotsFull = hasSlotLimit && activeCount >= (bot.maxSlots || 0);
              // Perpanjang selalu bisa (bypass slot + tutup)
              const disabled = mode === "new" && (isClosed || slotsFull);

              return (
                <div key={bot.id} className={`relative ${disabled ? "opacity-60" : ""}`}>
                  {disabled ? (
                    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 cursor-not-allowed">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold">{bot.name}</h3>
                          <p className="text-xs text-[var(--muted)] mt-0.5">{bot.description}</p>
                        </div>
                        <span className="shrink-0 ml-3 px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 font-medium">
                          {slotsFull ? "Slot Penuh" : "Tutup"}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted)] mt-2">
                        Slot: {activeCount}/{hasSlotLimit ? bot.maxSlots : "Unlimited"}
                      </p>
                    </div>
                  ) : (
                    <Link
                      href={href}
                      className="group flex items-center justify-between bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--primary)]/40 rounded-xl p-4 sm:p-5 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold group-hover:text-[var(--primary)] transition">{bot.name}</h3>
                        <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{bot.description}</p>
                        <p className="text-xs text-[var(--muted)] mt-1">
                          Slot: {activeCount}/{hasSlotLimit ? bot.maxSlots : "Unlimited"}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-bold">Rp {lowest.toLocaleString("id-ID")}</p>
                        <p className="text-xs text-[var(--muted)]">/minggu</p>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
