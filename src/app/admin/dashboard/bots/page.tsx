"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/Modal";

interface BotType {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  isActive: boolean;
  acceptingOrders: boolean;
  maxSlots: number;
  prices: { id: string; duration: string; price: number }[];
  _count: { rentals: number };
}

export default function AdminBotsPage() {
  const router = useRouter();
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<BotType | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchBots = () => {
    fetch("/api/admin/bots")
      .then((res) => { if (res.status === 401) { router.push("/admin"); return null; } return res.json(); })
      .then((data) => { if (data?.success) setBots(data.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBots(); }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/bots/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) });
    fetchBots();
  };

  const toggleAccepting = async (id: string, accepting: boolean) => {
    await fetch(`/api/admin/bots/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acceptingOrders: !accepting }) });
    fetchBots();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    const res = await fetch(`/api/admin/bots/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) {
      setDeleteTarget(null);
      setErrorMsg(data.message || "Gagal menghapus");
      return;
    }
    setDeleteTarget(null);
    setSuccessMsg(`"${name}" berhasil dihapus`);
    setTimeout(() => setSuccessMsg(""), 3000);
    fetchBots();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Kelola Bot</h2>
        <Link href="/admin/dashboard/bots/add"
          className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm rounded-lg transition">
          + Tambah Bot
        </Link>
      </div>

      {loading ? <p className="text-[var(--muted)]">Memuat...</p> : bots.length === 0 ? <p className="text-[var(--muted)]">Belum ada bot.</p> : (
        <div className="space-y-4">
          {bots.map((bot) => (
            <div key={bot.id} className={`bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5 ${!bot.isActive ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h4 className="font-semibold">{bot.name}</h4>
                  <p className="text-xs text-[var(--muted)]">/{bot.slug} - {bot._count.rentals} sewa aktif</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  {bot.acceptingOrders ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">Buka</span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">Tutup</span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${bot.isActive ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}`}>
                    {bot.isActive ? "Aktif" : "Off"}
                  </span>
                </div>
              </div>

              <p className="text-sm text-[var(--muted)] mb-2">{bot.description}</p>

              {/* Slot */}
              <p className="text-xs text-[var(--muted)] mb-3">
                Slot: {bot._count.rentals}/{bot.maxSlots === 0 ? "Unlimited" : bot.maxSlots}
              </p>

              {/* Prices */}
              <div className="text-xs space-y-0.5 mb-4">
                {bot.prices.map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <span className="text-[var(--muted)]">{p.duration === "WEEKLY" ? "Minggu" : p.duration === "MONTHLY" ? "Bulan" : "Custom/hari"}</span>
                    <span>Rp {p.price.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Link href={`/admin/dashboard/bots/edit/${bot.id}`}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded-lg transition">
                  Edit
                </Link>
                <button onClick={() => toggleAccepting(bot.id, bot.acceptingOrders)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition ${bot.acceptingOrders ? "bg-orange-600/20 hover:bg-orange-600/30 text-orange-400" : "bg-green-600/20 hover:bg-green-600/30 text-green-400"}`}>
                  {bot.acceptingOrders ? "Tutup Sewa" : "Buka Sewa"}
                </button>
                <button onClick={() => toggleActive(bot.id, bot.isActive)}
                  className="px-3 py-1.5 bg-[var(--card-border)] hover:bg-[var(--muted)]/20 text-xs rounded-lg transition">
                  {bot.isActive ? "Nonaktifkan" : "Aktifkan"}
                </button>
                <button onClick={() => setDeleteTarget(bot)}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded-lg transition">
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-[200] bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] px-4 py-3 rounded-xl text-sm shadow-lg animate-[fadeIn_0.2s]">
          {successMsg}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Hapus Bot?"
        message={`Bot "${deleteTarget?.name}" akan dihapus permanen beserta semua data harga-nya.`}
        confirmText="Hapus"
        variant="danger"
      />

      {/* Error Modal */}
      <Modal
        open={!!errorMsg}
        onClose={() => setErrorMsg("")}
        title="Tidak Bisa Dihapus"
        message={errorMsg}
        cancelText="Tutup"
      />
    </div>
  );
}
