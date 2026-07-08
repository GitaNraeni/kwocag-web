"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  motion,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
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

// Counter animasi count up
function CountUp({ target, className, suffix = "" }: { target: number; className?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <p className={className}>{count}{suffix}</p>;
}

// Card tilt 3D
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotateX.set(-dy * 10);
    rotateY.set(dx * 10);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, perspective: 800, transformStyle: "preserve-3d" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Pop-up Banner Modal
function BannerModal({ bannerImage, bannerTitle, bannerText, bannerLink, bannerLinkLabel, onClose }: {
  bannerImage: string; bannerTitle: string; bannerText: string; bannerLink: string; bannerLinkLabel: string; onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative max-w-sm w-full rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--card)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gambar */}
          {bannerImage && (
            bannerLink ? (
              <a href={bannerLink} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bannerImage} alt="Banner" className="w-full object-cover" />
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerImage} alt="Banner" className="w-full object-cover" />
            )
          )}

          {/* Konten teks */}
          {(bannerTitle || bannerText || (bannerLink && bannerLinkLabel)) && (
            <div className="px-5 py-4 space-y-2">
              {bannerTitle && (
                <p className="text-base font-bold text-[var(--foreground)] leading-snug">{bannerTitle}</p>
              )}
              {bannerText && (
                <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap">{bannerText}</p>
              )}
              {bannerLink && bannerLinkLabel && (
                <div className="pt-1">
                  <a href={bannerLink} target="_blank" rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs rounded-lg font-medium transition">
                    {bannerLinkLabel}
                  </a>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 rounded-full p-1.5 text-white transition"
            aria-label="Tutup"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  const [siteName, setSiteName] = useState("KWOCAG");
  const [contact, setContact] = useState("");
  const [telegram, setTelegram] = useState("");
  const [channelWa, setChannelWa] = useState("");
  const [totalActive, setTotalActive] = useState(0);
  const [totalServed, setTotalServed] = useState<number | null>(null);
  const [bots, setBots] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  // Banner
  const [showBanner, setShowBanner] = useState(false);
  const [bannerImage, setBannerImage] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerText, setBannerText] = useState("");
  const [bannerLink, setBannerLink] = useState("");
  const [bannerLinkLabel, setBannerLinkLabel] = useState("");

  const statsRef = useScrollReveal(0.05);
  const footerRef = useScrollReveal(0.05);

  useEffect(() => {
    const fetchStats = () => {
      fetch("/api/bots/stats").then(r => r.json()).then(d => {
        if (d.success) { setTotalActive(d.totalActive); setTotalServed(d.totalServed || 0); }
      }).catch(() => {});
    };

    Promise.all([
      fetch("/api/site").then(r => r.json()).then(d => {
        if (d.success) {
          setSiteName(d.data.siteName);
          setContact(d.data.contactWhatsapp || "");
          setTelegram(d.data.contactTelegram || "");
          setChannelWa(d.data.channelWhatsapp || "");

          // Pop-up banner logic — localStorage throttle 1 hari
          if (d.data.bannerEnabled && (d.data.bannerImage || d.data.bannerTitle || d.data.bannerText)) {
            const BANNER_KEY = "kwocag_banner_shown";
            const EXPIRY = 86400000;
            try {
              const stored = localStorage.getItem(BANNER_KEY);
              const now = Date.now();
              const shouldShow = !stored || (now - parseInt(stored)) > EXPIRY;
              if (shouldShow) {
                setBannerImage(d.data.bannerImage || "");
                setBannerTitle(d.data.bannerTitle || "");
                setBannerText(d.data.bannerText || "");
                setBannerLink(d.data.bannerLink || "");
                setBannerLinkLabel(d.data.bannerLinkLabel || "");
                setShowBanner(true);
                localStorage.setItem(BANNER_KEY, now.toString());
              }
            } catch { /* localStorage unavailable */ }
          }
        }
      }).catch(() => {}),
      fetch("/api/bots").then(r => r.json()).then(d => {
        if (d.success) setBots(d.data);
      }).catch(() => {}),
    ]).finally(() => setReady(true));

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Navbar capsul — shared component */}
      <Navbar />

      {/* Pop-up Banner */}
      {showBanner && (bannerImage || bannerTitle || bannerText) && (
        <BannerModal
          bannerImage={bannerImage}
          bannerTitle={bannerTitle}
          bannerText={bannerText}
          bannerLink={bannerLink}
          bannerLinkLabel={bannerLinkLabel}
          onClose={() => setShowBanner(false)}
        />
      )}

      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[var(--primary)]/[0.03] blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-900/10 blur-[80px]" />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
      />

      {/* Hero — pt-20 agar tidak tertutup navbar fixed */}
      <section className="relative z-10 flex-1 flex items-center px-6 pt-32 pb-16 md:pt-32 md:pb-20">
        <div className="max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className={ready ? "animate-slide-up" : "opacity-0"}>
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
              {contact ? (
                <a href={`https://wa.me/${contact}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center border border-[var(--card-border)] hover:border-[var(--primary)]/40 text-[var(--foreground)] px-7 py-3.5 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base hover:-translate-y-0.5 active:translate-y-0">
                  Tanya Dulu
                </a>
              ) : null}
            </div>
          </div>

          {/* Right visual — TiltCard 3D */}
          <div className="hidden md:block" style={{ opacity: ready ? 1 : 0, animation: ready ? 'fadeIn 0.4s ease-out 200ms both' : 'none' }}>
            <TiltCard className="relative">
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
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--success)]" /><span className="text-sm">Bot Store</span></div>
                        <span className="text-xs text-[var(--primary)] font-medium">Rp 2.000/minggu</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]/50">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--success)]" /><span className="text-sm">Bot Guardian</span></div>
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
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-t border-[var(--card-border)] px-6 py-12">
        <div ref={statsRef} className="max-w-3xl mx-auto scroll-fade" style={{ minHeight: '80px' }}>
          {ready && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {/* QRIS — logo resmi dengan float animation */}
              <div className="animate-fade-in" style={{ animationFillMode: "both" }}>
                <div className="h-8 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://files.catbox.moe/3bh8vo.png"
                    alt="QRIS"
                    className="h-6 w-auto object-contain"
                    style={{
                      filter: "brightness(0) saturate(100%) invert(35%) sepia(90%) saturate(1500%) hue-rotate(200deg) brightness(100%)",
                      animation: "floatY 3s ease-in-out infinite",
                    }}
                  />
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">Bayar instan</p>
              </div>
              {/* 24/7 */}
              <div className="animate-fade-in" style={{ animationDelay: "80ms", animationFillMode: "both" }}>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-xs text-[var(--muted)] mt-1">Bot online</p>
              </div>
              {/* &lt;2m */}
              <div className="animate-fade-in" style={{ animationDelay: "160ms", animationFillMode: "both" }}>
                <p className="text-2xl font-bold">&lt;2m</p>
                <p className="text-xs text-[var(--muted)] mt-1">Aktivasi</p>
              </div>
              {/* Grup dilayani — counter animasi */}
              <div className="animate-fade-in" style={{ animationDelay: "240ms", animationFillMode: "both" }}>
                {totalServed !== null ? (
                  <CountUp target={totalServed} className="text-2xl font-bold text-[var(--success)] tabular-nums" suffix="+" />
                ) : (
                  <div className="h-8 w-12 mx-auto rounded-md bg-[var(--card-border)] animate-pulse" />
                )}
                <p className="text-xs text-[var(--muted)] mt-1">Grup dilayani</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--card-border)] px-6 py-8" style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        <div ref={footerRef} className="max-w-5xl mx-auto scroll-fade">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <span className="text-sm font-bold text-[var(--foreground)]">{siteName}</span>
              <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">Layanan sewa bot WhatsApp untuk grup kamu. Aktif otomatis, langsung jalan.</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--foreground)] mb-3">Layanan</p>
              <div className="flex flex-col gap-0.5">
                <Link href="/about" className="text-xs text-[var(--muted)] hover:text-[var(--primary)] active:text-[var(--primary)] transition py-1.5 inline-block">Tentang Kami</Link>
                <Link href="/privacy" className="text-xs text-[var(--muted)] hover:text-[var(--primary)] active:text-[var(--primary)] transition py-1.5 inline-block">Kebijakan Privasi</Link>
                <Link href="/terms" className="text-xs text-[var(--muted)] hover:text-[var(--primary)] active:text-[var(--primary)] transition py-1.5 inline-block">Ketentuan Layanan</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--foreground)] mb-3">Kontak</p>
              <div className="flex flex-col gap-0.5">
                {contact && (
                  <a href={`https://wa.me/${contact}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--muted)] hover:text-green-400 transition inline-flex items-center gap-1.5 py-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                )}
                {telegram && (
                  <a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--muted)] hover:text-sky-400 transition inline-flex items-center gap-1.5 py-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    Telegram
                  </a>
                )}
                {channelWa && (
                  <a href={channelWa} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--muted)] hover:text-amber-400 transition inline-flex items-center gap-1.5 py-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    Informasi
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--card-border)] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--muted)]">
            <Link href="/" className="hover:text-[var(--primary)] active:text-[var(--primary)] transition">{siteName}</Link>
            <span>&copy; {new Date().getFullYear()} All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
