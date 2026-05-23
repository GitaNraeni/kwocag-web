"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SkeletonList } from "@/components/Skeleton";

interface Rental {
  id: string;
  groupId: string;
  groupName: string | null;
  groupLink: string | null;
  botType: { name: string; slug: string };
  status: string;
  source: string;
  isPremium: boolean;
  expiresAt: string | null;
  contactPhone: string | null;
  createdAt: string;
}

const PAGE_SIZE = 10;

function isPermanent(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  const threshold = new Date();
  threshold.setFullYear(threshold.getFullYear() + 10);
  return new Date(expiresAt).getTime() > threshold.getTime();
}

function formatSisa(expiresAt: string | null): string {
  if (!expiresAt) return "-";
  if (isPermanent(expiresAt)) return "Selamanya";
  const d = new Date(expiresAt).getTime() - Date.now();
  if (d <= 0) return "Habis";
  const days = Math.floor(d / 86400000);
  const hrs = Math.floor((d % 86400000) / 3600000);
  return days > 0 ? `${days}h ${hrs}j` : `${hrs}j`;
}

function sourceLabel(source: string): string {
  switch (source) {
    case "MANUAL": return "Manual";
    case "BOT": return "Bot";
    case "WEBSITE": return "Website";
    default: return source;
  }
}

export default function AdminGroups() {
  const router = useRouter();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/admin/rentals?limit=200")
      .then((res) => { if (res.status === 401) { router.push("/admin"); return null; } return res.json(); })
      .then((data) => {
        if (data?.success) setRentals(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const botTypes = Array.from(new Set(rentals.map(r => r.botType.slug)));
  const filtered = rentals
    .filter(r => selectedType === "all" || r.botType.slug === selectedType)
    .filter(r => selectedStatus === "ALL" || r.status === selectedStatus);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = rentals.filter(r => r.status === "ACTIVE").length;
  const endedCount = rentals.filter(r => r.status === "ENDED").length;

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-5">Sewa Bot</h2>

      {/* Filter row */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => { setSelectedStatus("ALL"); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            selectedStatus === "ALL" ? "bg-[var(--primary)] text-white" : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)]"
          }`}
        >
          Semua ({rentals.filter(r => selectedType === "all" || r.botType.slug === selectedType).length})
        </button>
        <button
          onClick={() => { setSelectedStatus("ACTIVE"); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            selectedStatus === "ACTIVE" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)]"
          }`}
        >
          Aktif ({activeCount})
        </button>
        <button
          onClick={() => { setSelectedStatus("ENDED"); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            selectedStatus === "ENDED" ? "bg-gray-500/10 text-gray-400 border border-gray-500/20" : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)]"
          }`}
        >
          Selesai ({endedCount})
        </button>

        {botTypes.length > 0 && <span className="w-px h-5 bg-[var(--card-border)] shrink-0" />}

        {botTypes.map(slug => {
          const name = rentals.find(r => r.botType.slug === slug)?.botType.name || slug;
          return (
            <button
              key={slug}
              onClick={() => { setSelectedType(selectedType === slug ? "all" : slug); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                selectedType === slug ? "bg-[var(--primary)] text-white" : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)]"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-8 text-center">
          <p className="text-[var(--muted)] text-sm">Tidak ada data sewa {selectedStatus === "ACTIVE" ? "aktif" : "selesai"}.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paged.map((rental) => (
              <button
                key={rental.id}
                onClick={() => setSelectedRental(rental)}
                className="w-full text-left bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--primary)]/30 rounded-xl p-3 sm:p-4 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium">{rental.groupName || rental.groupId}</span>
                      {selectedStatus === "ALL" && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          rental.status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
                        }`}>
                          {rental.status === "ACTIVE" ? "Aktif" : "Selesai"}
                        </span>
                      )}
                      {rental.isPremium && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">Premium</span>
                      )}
                      {isPermanent(rental.expiresAt) && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Permanen</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)]">{rental.botType.name} • {sourceLabel(rental.source)}</p>
                    <p className="text-[10px] text-[var(--muted)] mt-0.5 font-mono">{rental.groupId}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-[var(--muted)]">Sisa</p>
                    <p className="text-xs sm:text-sm font-medium">{formatSisa(rental.expiresAt)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs bg-[var(--card)] border border-[var(--card-border)] disabled:opacity-30 hover:bg-white/5 transition">
                Prev
              </button>
              <span className="text-xs text-[var(--muted)]">{page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs bg-[var(--card)] border border-[var(--card-border)] disabled:opacity-30 hover:bg-white/5 transition">
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedRental && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRental(null)} />
          <div className="relative bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Detail Sewa</h3>
              <button onClick={() => setSelectedRental(null)} className="text-[var(--muted)] hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Group ID</span>
                <span className="font-mono text-xs">{selectedRental.groupId}</span>
              </div>
              {selectedRental.groupName && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Nama Grup</span>
                  <span className="font-medium text-right max-w-[200px] truncate">{selectedRental.groupName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Tipe Bot</span>
                <span>{selectedRental.botType.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  selectedRental.status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
                }`}>
                  {selectedRental.status === "ACTIVE" ? "Aktif" : "Selesai"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Sumber</span>
                <span>{sourceLabel(selectedRental.source)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Premium</span>
                <span>{selectedRental.isPremium ? "Ya" : "Tidak"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Sisa Waktu</span>
                <span className="font-medium">{formatSisa(selectedRental.expiresAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Expired</span>
                <span>{isPermanent(selectedRental.expiresAt) ? "Tidak pernah" : selectedRental.expiresAt ? new Date(selectedRental.expiresAt).toLocaleDateString("id-ID") : "-"}</span>
              </div>
              {selectedRental.contactPhone && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">No. Telepon</span>
                  <span>{selectedRental.contactPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Tanggal Mulai</span>
                <span>{new Date(selectedRental.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
              {selectedRental.groupLink && (
                <div>
                  <span className="text-[var(--muted)] text-xs">Link Grup</span>
                  <a href={selectedRental.groupLink} target="_blank" rel="noopener noreferrer"
                    className="block text-[var(--primary)] text-xs hover:underline mt-0.5 break-all">
                    {selectedRental.groupLink}
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedRental(null)}
              className="w-full mt-6 py-2.5 bg-[var(--card-border)] hover:bg-[var(--muted)]/20 rounded-xl text-sm font-medium transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
