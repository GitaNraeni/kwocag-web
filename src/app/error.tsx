"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--danger)]/10 flex items-center justify-center">
          <svg className="w-7 h-7 text-[var(--danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-2">Terjadi Kesalahan</h1>
        <p className="text-sm text-[var(--muted)] mb-6">
          Maaf, ada yang salah. Coba muat ulang halaman.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl text-sm font-medium transition"
          >
            Coba Lagi
          </button>
          <a href="/" className="px-5 py-2.5 border border-[var(--card-border)] hover:border-[var(--muted)] rounded-xl text-sm font-medium transition">
            Ke Home
          </a>
        </div>
      </div>
    </div>
  );
}
