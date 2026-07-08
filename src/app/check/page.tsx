"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

interface OrderResult {
  orderCode: string;
  botType: string;
  status: string;
  totalPrice: number;
  duration: string;
  customDays?: number | null;
  expiresAt?: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  SUCCESS: "bg-green-500/10 text-green-400",
  EXPIRED: "bg-gray-500/10 text-gray-400",
  CANCELLED: "bg-red-500/10 text-red-400",
};

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  SUCCESS: "Berhasil",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
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
      <Navbar backButton />
      <div className="max-w-sm w-full mt-10">

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

          {results && results.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[var(--card-border)] space-y-2">
              <p className="text-xs text-[var(--muted)] mb-3">{results.length} order ditemukan</p>
              {results.map((r) => (
                <Link
                  key={r.orderCode}
                  href={`/order/status/${r.orderCode}`}
                  className="block p-3 bg-[var(--background)] rounded-lg hover:bg-white/5 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono">{r.orderCode}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColors[r.status] || "bg-gray-500/10 text-gray-400"}`}>
                      {statusLabels[r.status] || r.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>{r.botType} - {r.duration === "WEEKLY" ? "1 Minggu" : r.duration === "MONTHLY" ? "1 Bulan" : `${r.customDays || "?"} Hari`}</span>
                    <span>Rp {r.totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--muted)] mt-1">
                    <span>{new Date(r.createdAt).toLocaleDateString("id-ID")}</span>
                    {r.expiresAt && <span>s/d {new Date(r.expiresAt).toLocaleDateString("id-ID")}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
