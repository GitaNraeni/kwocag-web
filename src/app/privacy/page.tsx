"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";

export default function PrivacyPage() {
  const [siteName, setSiteName] = useState("KWOCAG");

  useEffect(() => {
    fetch("/api/site").then(r => r.json()).then(d => {
      if (d.success) setSiteName(d.data.siteName);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar backButton />

      {/* Content */}
      <main className="flex-1 px-6 pt-16 pb-12">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8">Kebijakan Privasi</h1>

          <div className="space-y-6 text-[var(--muted)] text-sm leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">1. Data yang Kami Kumpulkan</h2>
              <p>Saat menggunakan layanan {siteName}, kami mengumpulkan data berikut:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Nomor telepon (WhatsApp) untuk keperluan kontak dan identifikasi order</li>
                <li>Link grup WhatsApp untuk proses aktivasi bot</li>
                <li>Data transaksi pembayaran (nominal, waktu, status)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">2. Penggunaan Data</h2>
              <p>Data yang dikumpulkan digunakan untuk:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Memproses dan mengaktifkan layanan sewa bot</li>
                <li>Menghubungi pelanggan terkait status order atau perpanjangan</li>
                <li>Keperluan administrasi dan pencatatan transaksi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">3. Penyimpanan Data</h2>
              <p>
                Data disimpan secara aman di server kami selama layanan aktif. Setelah layanan berakhir, 
                data order tetap tersimpan untuk keperluan riwayat transaksi namun tidak digunakan untuk tujuan lain.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">4. Keamanan</h2>
              <p>
                Kami menggunakan enkripsi dan protokol keamanan standar untuk melindungi data pelanggan. 
                Akses ke data dibatasi hanya untuk admin yang berwenang.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">5. Hak Pelanggan</h2>
              <p>Pelanggan berhak untuk:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Meminta informasi data yang tersimpan</li>
                <li>Meminta penghapusan data setelah layanan berakhir</li>
                <li>Menghubungi kami untuk pertanyaan terkait privasi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">6. Perubahan Kebijakan</h2>
              <p>
                Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan akan diinformasikan melalui website ini.
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
