"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OrderResult {
  orderCode: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  ACTIVE: "bg-green-500/10 text-green-400",
  EXPIRED: "bg-red-500/10 text-red-400",
  CANCELLED: "bg-gray-500/10 text-gray-400",
};

export default function CheckPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OrderResult[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setError("");
    setResults(null);
    setLoading(true);

    // Kalau input kode order langsung redirect
    if (q.toUpperCase().startsWith("ORD")) {
      router.push(`/order/status/${q.toUpperCase()}`);
      return;
    }

    // Cari by phone — tampilkan semua
    try {
      const res = await fetch(`/api/orders/search?phone=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setResults(data.data);
      } else {
        setError("Tidak ditemukan order dengan nomor tersebut");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="max-w-sm w-full">
        <Link href="/" className="text-sm text-[var(--muted)] hover:text-white mb-6 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6">
          <h1 className="text-xl font-bold mb-1">Cek Order</h1>
          <p className="text-sm text-[var(--muted)] mb-5">Masukkan kode order atau nomor telepon</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              required
              placeholder="ORD-XXXXXXXX atau 08xxx"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)]"
            />
            {error && <p className="text-[var(--danger)] text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white py-3 rounded-xl font-medium transition"
            >
              {loading ? "Mencari..." : "Cari"}
            </button>
          </form>

          {/* Results list */}
          {results && results.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[var(--card-border)] space-y-2">
              <p className="text-xs text-[var(--muted)] mb-2">{results.length} order ditemukan</p>
              {results.map((r) => (
                <Link
                  key={r.orderCode}
                  href={`/order/status/${r.orderCode}`}
                  className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg hover:bg-white/5 transition"
                >
                  <div>
                    <p className="text-sm font-mono">{r.orderCode}</p>
                    <p className="text-xs text-[var(--muted)]">{new Date(r.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[r.status] || ""}`}>
                    {r.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
