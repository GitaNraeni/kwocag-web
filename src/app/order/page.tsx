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
  isActive?: boolean;
  maxSlots?: number;
  totalInstances?: number;
  _count?: { rentals: number };
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

        <h1 className="text-2xl font-bold mb-2">
          {mode === "new" ? "Pilih Tipe Bot" : "Perpanjang Sewa"}
        </h1>
        <p className="text-[var(--muted)] text-sm mb-6">
          {mode === "new" ? "Pilih bot yang sesuai kebutuhan" : "Pilih tipe bot yang ingin diperpanjang"}
        </p>

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

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
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
            {bots.map((bot, idx) => {
              const lowest = bot.prices.length > 0
                ? (bot.prices.find((p: any) => p.duration === "WEEKLY")?.price || Math.min(...bot.prices.map((p: any) => p.price)))
                : 0;
              const href = mode === "new" ? `/order/${bot.slug}` : `/order/${bot.slug}?mode=extend`;
              const isClosed = bot.acceptingOrders === false;
              const hasSlotLimit = bot.maxSlots !== undefined && bot.maxSlots > 0;
              const instances = bot.totalInstances || 1;
              const totalCapacity = (bot.maxSlots || 0) * instances;
              const activeCount = bot._count?.rentals || 0;
              const slotsFull = hasSlotLimit && activeCount >= totalCapacity;
              const disabled = (isClosed || slotsFull || !bot.isActive);

              return (
                <div key={bot.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "both" }}
                >
                  {disabled ? (
                    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 opacity-50 cursor-not-allowed select-none">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold">{bot.name}</h3>
                          <p className="text-xs text-[var(--muted)] mt-0.5">{bot.description}</p>
                          <p className="text-xs text-[var(--muted)] mt-1.5">
                            Slot: {activeCount}/{hasSlotLimit ? totalCapacity : "∞"}
                          </p>
                        </div>
                        <span className="shrink-0 ml-3 px-2 py-0.5 rounded-md text-xs bg-red-500/10 text-red-400 font-medium border border-red-500/20">
                          {slotsFull ? "Slot Penuh" : "Tutup"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={href}
                      className="group block bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/[0.02] rounded-xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--primary)]/5 active:translate-y-0"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold group-hover:text-[var(--primary)] transition-colors duration-200">{bot.name}</h3>
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shrink-0" />
                          </div>
                          <p className="text-xs text-[var(--muted)] leading-relaxed">{bot.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold text-[var(--foreground)]">Rp {lowest.toLocaleString("id-ID")}</p>
                          <p className="text-xs text-[var(--muted)]">/minggu</p>
                        </div>
                      </div>
                      {hasSlotLimit && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[var(--muted)]">Slot tersedia</span>
                            <span className="text-xs font-medium">{totalCapacity - activeCount} <span className="text-[var(--muted)] font-normal">/ {totalCapacity}</span></span>
                          </div>
                          <div className="h-1 bg-[var(--card-border)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min((activeCount / totalCapacity) * 100, 100)}%`,
                                background: activeCount / totalCapacity > 0.8 ? 'var(--warning)' : 'var(--primary)',
                              }}
                            />
                          </div>
                        </div>
                      )}
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
