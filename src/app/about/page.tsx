"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AboutPage() {
  const [siteName, setSiteName] = useState("KWOCAG");
  const [contact, setContact] = useState("");
  const [telegram, setTelegram] = useState("");
  const [lowestPrice, setLowestPrice] = useState(5000);

  useEffect(() => {
    fetch("/api/site").then(r => r.json()).then(d => {
      if (d.success) {
        setSiteName(d.data.siteName);
        setContact(d.data.contactWhatsapp || "");
        setTelegram(d.data.contactTelegram || "");
      }
    }).catch(() => {});
    fetch("/api/bots").then(r => r.json()).then(d => {
      if (d.success && d.data.length > 0) {
        const weeklyPrices = d.data.flatMap((b: any) => b.prices.filter((p: any) => p.duration === "WEEKLY" && p.tier === "basic").map((p: any) => p.price));
        if (weeklyPrices.length > 0) setLowestPrice(Math.min(...weeklyPrices));
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 border-b border-[var(--card-border)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            {siteName}
          </Link>
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-white transition">
            Kembali
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8">Tentang Kami</h1>

          <div className="space-y-6 text-[var(--muted)] text-sm leading-relaxed">
            <section>
              <p className="text-base text-[var(--foreground)]">
                {siteName} adalah layanan penyedia bot WhatsApp otomatis yang dirancang untuk membantu 
                pengelolaan grup dan toko online di WhatsApp.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">Apa yang Kami Tawarkan</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Bot otomatis yang aktif 24/7 tanpa perlu perangkat tambahan</li>
                <li>Aktivasi instan setelah pembayaran via QRIS</li>
                <li>Berbagai tipe bot sesuai kebutuhan (store, guardian, dll)</li>
                <li>Harga terjangkau dengan sistem sewa mingguan/bulanan</li>
                <li>Support langsung via WhatsApp dan Telegram</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">Kenapa Pilih Kami</h2>
              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Cepat</p>
                  <p className="text-xs mt-1">Bot join dalam hitungan menit setelah bayar</p>
                </div>
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
                  <div className="w-8 h-8 rounded-lg bg-[var(--success)]/10 flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Terpercaya</p>
                  <p className="text-xs mt-1">Sudah melayani banyak grup aktif</p>
                </div>
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
                  <div className="w-8 h-8 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Murah</p>
                  <p className="text-xs mt-1">Mulai dari Rp {lowestPrice.toLocaleString("id-ID")}/minggu</p>
                </div>
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Support</p>
                  <p className="text-xs mt-1">Respon cepat via WA & Telegram</p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-3">Hubungi Kami</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                {contact && (
                  <a href={`https://wa.me/${contact}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--card)] border border-[var(--card-border)] hover:border-green-500/40 rounded-xl transition text-sm">
                    <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
                {telegram && (
                  <a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--card)] border border-[var(--card-border)] hover:border-blue-400/40 rounded-xl transition text-sm">
                    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram
                  </a>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] px-6 py-5">
        <div className="max-w-3xl mx-auto text-center text-xs text-[var(--muted)]">
          &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
