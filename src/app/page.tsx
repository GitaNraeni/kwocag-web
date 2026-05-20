"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [siteName, setSiteName] = useState("KWOCAG");
  const [contact, setContact] = useState("");
  const [totalActive, setTotalActive] = useState(0);

  useEffect(() => {
    fetch("/api/site").then(r => r.json()).then(d => {
      if (d.success) { setSiteName(d.data.siteName); setContact(d.data.contactWhatsapp || ""); }
    }).catch(() => {});
    fetch("/api/bots/stats").then(r => r.json()).then(d => {
      if (d.success) setTotalActive(d.totalActive);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[var(--primary)]/[0.03] blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-900/10 blur-[80px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">{siteName}</span>
          <div className="flex items-center gap-3 sm:gap-4 text-sm">
            <Link href="/check" className="text-[var(--muted)] hover:text-white transition">Cek Order</Link>
            {contact && (
              <a href={`https://wa.me/${contact}`} target="_blank" rel="noopener noreferrer"
                className="hidden sm:inline-flex px-4 py-1.5 border border-[var(--card-border)] hover:border-[var(--primary)]/50 rounded-lg text-[var(--muted)] hover:text-white transition">
                Contact
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex items-center px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="animate-slide-up">
            {totalActive > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs text-[var(--primary)] mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                {totalActive} grup aktif saat ini
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] mb-5">
              Sewa Bot
              <span className="block bg-gradient-to-r from-[var(--primary)] to-blue-400 bg-clip-text text-transparent">WhatsApp</span>
            </h1>

            <p className="text-[var(--muted)] text-base lg:text-lg leading-relaxed mb-8 max-w-md">
              Bot otomatis untuk toko online dan manajemen grup. Bayar QRIS, bot langsung join. Tanpa ribet.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/order"
                className="inline-flex items-center justify-center bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-7 py-3.5 rounded-xl font-medium transition shadow-lg shadow-[var(--primary)]/25 text-sm sm:text-base">
                Berlangganan
              </Link>
              {contact && (
                <a href={`https://wa.me/${contact}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center border border-[var(--card-border)] hover:border-[var(--primary)]/40 text-[var(--foreground)] px-7 py-3.5 rounded-xl font-medium transition text-sm sm:text-base">
                  Hubungi Kami
                </a>
              )}
            </div>
          </div>

          {/* Right visual */}
          <div className="hidden md:block animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[var(--primary)]/5 to-transparent rounded-3xl blur-2xl" />
              <div className="relative bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 card-glow">
                <div className="flex items-center gap-3 pb-4 border-b border-[var(--card-border)]">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Aktivasi Otomatis</p>
                    <p className="text-xs text-[var(--muted)]">Bayar → Bot join dalam 1 menit</p>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                      <span className="text-sm">Bot Store</span>
                    </div>
                    <span className="text-xs text-[var(--primary)] font-medium">Rp 5.000/minggu</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                      <span className="text-sm">Bot Jaga Grup</span>
                    </div>
                    <span className="text-xs text-[var(--primary)] font-medium">Rp 5.000/minggu</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--card-border)] flex items-center gap-2 text-xs text-[var(--muted)]">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  100% TRUSTED
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-t border-[var(--card-border)] px-6 py-12">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-[var(--primary)]">QRIS</p>
            <p className="text-xs text-[var(--muted)] mt-1">Bayar instan</p>
          </div>
          <div>
            <p className="text-2xl font-bold">24/7</p>
            <p className="text-xs text-[var(--muted)] mt-1">Bot online</p>
          </div>
          <div>
            <p className="text-2xl font-bold">&lt;2m</p>
            <p className="text-xs text-[var(--muted)] mt-1">Aktivasi</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--success)]">{totalActive}+</p>
            <p className="text-xs text-[var(--muted)] mt-1">Grup aktif</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--card-border)] px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <span>{siteName}</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved</span>
        </div>
      </footer>
    </div>
  );
}
