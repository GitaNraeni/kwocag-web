"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";

export default function AboutPage() {
  const [siteName, setSiteName] = useState("KWOCAG");
  const [contact, setContact] = useState("");
  const [telegram, setTelegram] = useState("");
  const [lowestPrice, setLowestPrice] = useState(0);

  useEffect(() => {
    fetch("/api/site").then(r => r.json()).then(d => {
      if (d.success) { setSiteName(d.data.siteName); setContact(d.data.contactWhatsapp || ""); setTelegram(d.data.contactTelegram || ""); }
    }).catch(() => {});
    fetch("/api/bots").then(r => r.json()).then(d => {
      if (d.success && d.data.length > 0) {
        const weeklyPrices = d.data.flatMap((b: any) => b.prices.filter((p: any) => p.duration === "WEEKLY" && p.tier === "basic").map((p: any) => p.price));
        if (weeklyPrices.length > 0) setLowestPrice(Math.min(...weeklyPrices));
      }
    }).catch(() => {});
  }, []);

  const features = [
    "Bot aktif 24/7, online terus di grup kamu",
    "Aktif otomatis setelah bayar QRIS, nggak perlu setup apapun",
    "Fitur lengkap: game, stiker, anti-link, welcome message",
    "Cocok buat grup apapun — circle, squad, komunitas, sampe reseller",
    "Harga fleksibel sesuai kebutuhan, mulai mingguan sampai bulanan",
    "CS fast respon via WA & Telegram",
  ];

  const reasons = [
    {
      icon: (
        <svg className="w-4 h-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "bg-[var(--primary)]/10",
      title: "Cepat",
      desc: "Bot join dalam hitungan menit setelah bayar",
    },
    {
      icon: (
        <svg className="w-4 h-4 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-[var(--success)]/10",
      title: "Terpercaya",
      desc: "Sudah melayani puluhan grup aktif",
    },
    {
      icon: (
        <svg className="w-4 h-4 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-[var(--warning)]/10",
      title: "Terjangkau",
      desc: lowestPrice > 0 ? `Mulai Rp ${lowestPrice.toLocaleString("id-ID")}/minggu` : "Harga bersaing",
    },
    {
      icon: (
        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-blue-500/10",
      title: "Support",
      desc: "CS fast respon via WA & Telegram",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar backButton />

      <main className="flex-1 px-6 pt-16 pb-12">
        <div className="max-w-3xl mx-auto animate-fade-in space-y-10">

          {/* Intro */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Tentang Kami</h1>
            <p className="text-[var(--muted)] text-sm sm:text-base leading-relaxed max-w-2xl">
              {siteName}{" "}menyediakan layanan sewa bot WhatsApp untuk berbagai kebutuhan grup, mulai dari jaga grup, game &amp; stiker, sampai bot khusus store untuk grup reseller. Pilih bot yang sesuai, bayar via QRIS, bot langsung aktif.
            </p>
          </div>

          {/* Fitur */}
          <div>
            <h2 className="text-base font-semibold mb-4">Yang Kami Tawarkan</h2>
            <ul className="space-y-2.5">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--muted)]">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Kenapa pilih kami */}
          <div>
            <h2 className="text-base font-semibold mb-4">Kenapa Pilih Kami</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {reasons.map((r, i) => (
                <div key={i} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 flex items-start gap-3 hover:border-[var(--primary)]/20 transition-colors duration-200">
                  <div className={`w-8 h-8 rounded-lg ${r.color} flex items-center justify-center shrink-0 mt-0.5`}>
                    {r.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{r.title}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kontak */}
          <div>
            <h2 className="text-base font-semibold mb-4">Hubungi Kami</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {contact && (
                <a href={`https://wa.me/${contact}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-3 bg-[var(--card)] border border-[var(--card-border)] hover:border-green-500/40 hover:bg-green-500/[0.03] rounded-xl transition-all duration-200 text-sm font-medium">
                  <svg className="w-4 h-4 text-green-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}
              {telegram && (
                <a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-3 bg-[var(--card)] border border-[var(--card-border)] hover:border-sky-400/40 hover:bg-sky-500/[0.03] rounded-xl transition-all duration-200 text-sm font-medium">
                  <svg className="w-4 h-4 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </a>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-[var(--card-border)] px-6 py-5">
        <div className="max-w-3xl mx-auto text-center text-xs text-[var(--muted)]">
          &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
