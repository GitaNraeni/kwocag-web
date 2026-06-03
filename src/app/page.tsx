"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); } }); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const [siteName, setSiteName] = useState("KWOCAG");
  const [contact, setContact] = useState("");
  const [telegram, setTelegram] = useState("");
  const [channelWa, setChannelWa] = useState("");
  const [totalActive, setTotalActive] = useState(0);
  const [totalServed, setTotalServed] = useState(0);
  const [bots, setBots] = useState<any[]>([]);
  const [ready, setReady] = useState(false); // semua data siap baru render hero
  const statsRef = useScrollReveal(0.05);
  const footerRef = useScrollReveal(0.05);

  useEffect(() => {
    Promise.all([
      fetch("/api/site").then(r => r.json()).then(d => {
        if (d.success) { setSiteName(d.data.siteName); setContact(d.data.contactWhatsapp || ""); setTelegram(d.data.contactTelegram || ""); setChannelWa(d.data.channelWhatsapp || ""); }
      }).catch(() => {}),
      fetch("/api/bots/stats").then(r => r.json()).then(d => {
        if (d.success) { setTotalActive(d.totalActive); setTotalServed(d.totalServed || 0); }
      }).catch(() => {}),
      fetch("/api/bots").then(r => r.json()).then(d => {
        if (d.success) setBots(d.data);
      }).catch(() => {}),
    ]).finally(() => setReady(true));
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
            <Link href="/about" className="text-[var(--muted)] hover:text-white transition hidden sm:inline">Tentang</Link>
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
          <div className={ready ? "animate-slide-up" : "opacity-0"}>
            {/* Badge — reserved height supaya nggak CLS */}
            <div className="h-8 mb-6">
              {totalActive > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs text-[var(--primary)] animate-fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                  {totalActive} grup aktif saat ini
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] mb-5">
              Sewa Bot
              <span className="block bg-gradient-to-r from-[var(--primary)] to-blue-400 bg-clip-text text-transparent">WhatsApp</span>
            </h1>

            <p className="text-[var(--muted)] text-base lg:text-lg leading-relaxed mb-8 max-w-md">
              Capek urus grup sendiri? Bot WA siap bantu. Bayar QRIS, langsung aktif — nggak perlu ribet.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/order"
                className="inline-flex items-center justify-center bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[var(--primary)]/25 text-sm sm:text-base hover:shadow-[var(--primary)]/40 hover:-translate-y-0.5 active:translate-y-0">
                Order Now
              </Link>
              {contact && (
                <a href={`https://wa.me/${contact}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center border border-[var(--card-border)] hover:border-[var(--primary)]/40 text-[var(--foreground)] px-7 py-3.5 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base hover:-translate-y-0.5 active:translate-y-0">
                  Tanya Dulu
                </a>
              )}
            </div>
          </div>

          {/* Right visual */}
          <div className="hidden md:block" style={{ opacity: ready ? 1 : 0, animation: ready ? 'fadeIn 0.4s ease-out 200ms both' : 'none' }}>
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
                    <p className="text-sm font-medium">Aktivasi Instan</p>
                    <p className="text-xs text-[var(--muted)]">Bayar → Bot aktif kurang dari 2 menit</p>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  {bots.length > 0 ? bots.map((bot: any) => {
                    const weeklyPrice = bot.prices?.find((p: any) => p.duration === "WEEKLY");
                    return (
                      <div key={bot.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                          <span className="text-sm">{bot.name}</span>
                        </div>
                        {weeklyPrice && (
                          <span className="text-xs text-[var(--primary)] font-medium">Rp {weeklyPrice.price.toLocaleString("id-ID")}/minggu</span>
                        )}
                      </div>
                    );
                  }) : (
                    <>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                          <span className="text-sm">Bot Store</span>
                        </div>
                        <span className="text-xs text-[var(--primary)] font-medium">Rp 2.000/minggu</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                          <span className="text-sm">Bot Guardian</span>
                        </div>
                        <span className="text-xs text-[var(--primary)] font-medium">Rp 3.000/minggu</span>
                      </div>
                    </>
                  )}
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

      {/* Stats — muncul bareng hero setelah data ready */}
      <section className="relative z-10 border-t border-[var(--card-border)] px-6 py-12">
        <div ref={statsRef} className="max-w-3xl mx-auto scroll-fade" style={{ minHeight: '80px' }}>
          {ready && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { value: "QRIS", label: "Bayar instan", color: "text-[var(--primary)]" },
                { value: "24/7", label: "Bot online", color: "" },
                { value: "<2m", label: "Aktivasi", color: "" },
                { value: totalServed > 0 ? `${totalServed}+` : "68+", label: "Grup dilayani", color: "text-[var(--success)] tabular-nums" },
              ].map((stat, i) => (
                <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--card-border)] px-6 py-8">
        <div ref={footerRef} className="max-w-5xl mx-auto scroll-fade">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <span className="text-sm font-bold text-[var(--foreground)]">{siteName}</span>
              <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">Layanan sewa bot WhatsApp untuk grup kamu. Aktif otomatis, langsung jalan.</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--foreground)] mb-3">Layanan</p>
              <div className="flex flex-col gap-0.5">
                <Link href="/about" className="text-xs text-[var(--muted)] hover:text-white transition py-1.5 inline-block">Tentang Kami</Link>
                <Link href="/privacy" className="text-xs text-[var(--muted)] hover:text-white transition py-1.5 inline-block">Kebijakan Privasi</Link>
                <Link href="/terms" className="text-xs text-[var(--muted)] hover:text-white transition py-1.5 inline-block">Ketentuan Layanan</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--foreground)] mb-3">Kontak</p>
              <div className="flex flex-col gap-0.5">
                {contact && (
                  <a href={`https://wa.me/${contact}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--muted)] hover:text-green-400 transition inline-flex items-center gap-1.5 py-1.5 min-h-[44px] sm:min-h-0 sm:py-1">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                )}
                {telegram && (
                  <a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--muted)] hover:text-sky-400 transition inline-flex items-center gap-1.5 py-1.5 min-h-[44px] sm:min-h-0 sm:py-1">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    Telegram
                  </a>
                )}
                {channelWa && (
                  <a href={channelWa} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--muted)] hover:text-amber-400 transition inline-flex items-center gap-1.5 py-1.5 min-h-[44px] sm:min-h-0 sm:py-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    Informasi
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--card-border)] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--muted)]">
            <span>{siteName}</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
