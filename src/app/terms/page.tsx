"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TermsPage() {
  const [siteName, setSiteName] = useState("KWOCAG");

  useEffect(() => {
    fetch("/api/site").then(r => r.json()).then(d => {
      if (d.success) setSiteName(d.data.siteName);
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-8">Ketentuan Layanan</h1>

          <div className="space-y-6 text-[var(--muted)] text-sm leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">1. Layanan</h2>
              <p>
                {siteName} menyediakan layanan sewa bot WhatsApp otomatis untuk keperluan store dan manajemen grup. Bot akan aktif sesuai durasi yang dipilih setelah pembayaran berhasil.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">2. Pembayaran</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Pembayaran dilakukan melalui QRIS sebelum layanan diaktifkan</li>
                <li>Pembayaran yang sudah berhasil tidak dapat di-refund</li>
                <li>Harga dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya</li>
                <li>Order yang tidak dibayar dalam 5 menit akan otomatis dibatalkan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">3. Aktivasi Bot</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Bot akan otomatis join ke grup setelah pembayaran dikonfirmasi</li>
                <li>Pastikan link grup valid dan bot belum di-kick dari grup tersebut</li>
                <li>Jika bot gagal join karena link invalid, hubungi admin untuk bantuan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">4. Penggunaan Bot</h2>
              <p>Pengguna dilarang menggunakan bot untuk:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Aktivitas ilegal atau melanggar hukum</li>
                <li>Spam atau penyalahgunaan fitur bot</li>
                <li>Menyebarkan konten SARA, pornografi, atau kekerasan</li>
                <li>Merugikan pengguna lain atau pihak ketiga</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">5. Penghentian Layanan</h2>
              <p>Kami berhak menghentikan layanan tanpa pengembalian dana jika:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Pengguna melanggar ketentuan penggunaan</li>
                <li>Bot di-kick dari grup oleh admin grup</li>
                <li>Terjadi penyalahgunaan layanan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">6. Perpanjangan</h2>
              <p>
                Layanan dapat diperpanjang sebelum atau setelah masa aktif berakhir. 
                Perpanjangan akan menambah durasi dari tanggal expired sebelumnya (jika masih aktif) 
                atau dari tanggal pembayaran (jika sudah expired).
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">7. Perubahan Ketentuan</h2>
              <p>
                Ketentuan layanan ini dapat berubah sewaktu-waktu. Penggunaan layanan setelah perubahan 
                dianggap sebagai persetujuan terhadap ketentuan yang baru.
              </p>
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
