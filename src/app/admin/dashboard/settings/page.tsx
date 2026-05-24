"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");

  // Site
  const [siteName, setSiteName] = useState("");
  const [siteLogo, setSiteLogo] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactTelegram, setContactTelegram] = useState("");
  const [channelWhatsapp, setChannelWhatsapp] = useState("");

  // Pakasir
  const [pakasirApiKey, setPakasirApiKey] = useState("");
  const [pakasirSlug, setPakasirSlug] = useState("");

  // Ramashop
  const [ramashopApiKey, setRamashopApiKey] = useState("");

  // Payment provider
  const [paymentProvider, setPaymentProvider] = useState("pakasir");

  // Admin fee
  const [adminFee, setAdminFee] = useState(0);
  const [adminFeePercent, setAdminFeePercent] = useState(0);

  // Telegram
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [telegramLogChatId, setTelegramLogChatId] = useState("");

  // Account
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Maintenance
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => { if (res.status === 401) { router.push("/admin"); return null; } return res.json(); })
      .then((data) => {
        if (data?.success) {
          setSiteName(data.data.siteName || "");
          setSiteLogo(data.data.siteLogo || "");
          setContactWhatsapp(data.data.contactWhatsapp || "");
          setContactTelegram(data.data.contactTelegram || "");
          setChannelWhatsapp(data.data.channelWhatsapp || "");
          setPakasirApiKey(data.data.pakasirApiKey || "");
          setPakasirSlug(data.data.pakasirSlug || "");
          setRamashopApiKey(data.data.ramashopApiKey || "");
          setPaymentProvider(data.data.paymentProvider || "pakasir");
          setAdminFee(data.data.adminFee || 0);
          setAdminFeePercent(data.data.adminFeePercent || 0);
          setTelegramToken(data.data.telegramToken || "");
          setTelegramChatId(data.data.telegramChatId || "");
          setTelegramLogChatId(data.data.telegramLogChatId || "");
          setUsername(data.data.username || "");
          setMaintenance(data.data.maintenance || false);
          setMaintenanceMsg(data.data.maintenanceMsg || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Sensor helper: tampilkan sebagai dots kecuali 4 char terakhir
  const maskValue = (val: string) => {
    if (!val || val.length < 8) return val;
    return "•".repeat(val.length - 4) + val.slice(-4);
  };

  const [showApiKey, setShowApiKey] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handleSave = async () => {
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName, siteLogo, contactWhatsapp, contactTelegram, channelWhatsapp,
          pakasirApiKey, pakasirSlug,
          ramashopApiKey, paymentProvider,
          adminFee, adminFeePercent,
          telegramToken, telegramChatId, telegramLogChatId,
          maintenance, maintenanceMsg,
          username,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Tersimpan");
        setMsgType("ok");
        setCurrentPassword("");
        setNewPassword("");
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg(data.message || "Gagal menyimpan");
        setMsgType("err");
        setTimeout(() => setMsg(""), 5000);
      }
    } catch { setMsg("Gagal"); setMsgType("err"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="max-w-2xl animate-fade-in">
      <div className="skeleton h-8 w-32 mb-6" />
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
            <div className="skeleton h-5 w-24 mb-4" />
            <div className="space-y-3">
              <div className="skeleton h-9 w-full" />
              <div className="skeleton h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Pengaturan</h2>

      <div className="space-y-6">
        {/* Website */}
        <section className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="font-medium mb-4">Website</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Nama Website</label>
              <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Logo URL (opsional)</label>
              <input type="url" value={siteLogo} onChange={(e) => setSiteLogo(e.target.value)} placeholder="https://..."
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">WhatsApp Contact</label>
              <input type="text" value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} placeholder="6281xxx"
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Telegram Contact (username tanpa @)</label>
              <input type="text" value={contactTelegram} onChange={(e) => setContactTelegram(e.target.value)} placeholder="username"
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Channel WhatsApp (link lengkap)</label>
              <input type="url" value={channelWhatsapp} onChange={(e) => setChannelWhatsapp(e.target.value)} placeholder="https://whatsapp.com/channel/xxx"
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]" />
            </div>
          </div>
        </section>

        {/* Payment Provider */}
        <section className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5">
          <h3 className="font-medium mb-4">Payment Gateway</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-2">Provider Aktif</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPaymentProvider("pakasir")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition border ${paymentProvider === "pakasir" ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--card-border)] text-[var(--muted)]"}`}>
                  Pakasir
                </button>
                <button type="button" onClick={() => setPaymentProvider("ramashop")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition border ${paymentProvider === "ramashop" ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--card-border)] text-[var(--muted)]"}`}>
                  Ramashop
                </button>
              </div>
            </div>

            {paymentProvider === "pakasir" && (
              <div className="space-y-3 pt-3 border-t border-[var(--card-border)]">
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">API Key</label>
                  <div className="relative">
                    <input type={showApiKey ? "text" : "password"} value={pakasirApiKey} onChange={(e) => setPakasirApiKey(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--primary)] pr-16" />
                    <button type="button" onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-white px-2 py-1">
                      {showApiKey ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Project Slug</label>
                  <input type="text" value={pakasirSlug} onChange={(e) => setPakasirSlug(e.target.value)}
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--primary)]" />
                </div>
              </div>
            )}

            {paymentProvider === "ramashop" && (
              <div className="space-y-3 pt-3 border-t border-[var(--card-border)]">
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">API Key</label>
                  <div className="relative">
                    <input type={showApiKey ? "text" : "password"} value={ramashopApiKey} onChange={(e) => setRamashopApiKey(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--primary)] pr-16" />
                    <button type="button" onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-white px-2 py-1">
                      {showApiKey ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Fee */}
            <div className="pt-3 border-t border-[var(--card-border)]">
              <label className="block text-xs text-[var(--muted)] mb-2">Biaya Admin (ditambahkan ke harga sewa)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[var(--muted)] mb-1">Fee Tetap (Rp)</label>
                  <input type="number" min={0} value={adminFee} onChange={(e) => setAdminFee(parseInt(e.target.value) || 0)}
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]" />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--muted)] mb-1">Fee Persen (%)</label>
                  <input type="number" min={0} max={100} step={0.1} value={adminFeePercent} onChange={(e) => setAdminFeePercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]" />
                </div>
              </div>
              <p className="text-[10px] text-[var(--muted)] mt-1">Kosongkan (0) jika tidak ingin menambah biaya admin</p>
            </div>
          </div>
        </section>

        {/* Telegram */}
        <section className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5">
          <h3 className="font-medium mb-4">Telegram Notifikasi</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Bot Token</label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--primary)] pr-16"
                />
                <button type="button" onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-white px-2 py-1">
                  {showToken ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Chat ID (Notifikasi Order)</label>
              <input type="text" value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Chat ID Log (Error & Login) — kosongkan jika sama</label>
              <input type="text" value={telegramLogChatId} onChange={(e) => setTelegramLogChatId(e.target.value)} placeholder="Opsional, default sama dengan di atas"
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--primary)]" />
            </div>
          </div>
        </section>

        {/* Maintenance */}
        <section className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="font-medium mb-4">Maintenance Mode</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Mode Maintenance</p>
                <p className="text-xs text-[var(--muted)]">Semua halaman publik akan redirect ke halaman maintenance</p>
              </div>
              <button
                type="button"
                onClick={() => setMaintenance(!maintenance)}
                className={`relative w-11 h-6 rounded-full transition ${maintenance ? "bg-[var(--warning)]" : "bg-[var(--card-border)]"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${maintenance ? "translate-x-5" : ""}`} />
              </button>
            </div>
            {maintenance && (
              <div>
                <label className="block text-xs text-[var(--muted)] mb-1">Pesan Maintenance (opsional)</label>
                <input type="text" value={maintenanceMsg} onChange={(e) => setMaintenanceMsg(e.target.value)}
                  placeholder="Website sedang dalam perbaikan..."
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]" />
              </div>
            )}
          </div>
        </section>

        {/* Account */}
        <section className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="font-medium mb-4">Akun Admin</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Password Lama (isi jika mau ganti)</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Password Baru</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]" />
            </div>
          </div>
        </section>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-8 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white rounded-xl font-medium transition"
        >
          {saving ? "Menyimpan..." : "Simpan Semua"}
        </button>
      </div>

      {/* Toast */}
      {msg && (
        <div className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-xl text-sm shadow-lg animate-[fadeIn_0.2s] border ${
          msgType === "ok" ? "bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]" : "bg-[var(--danger)]/10 border-[var(--danger)]/30 text-[var(--danger)]"
        }`}>
          {msg}
        </div>
      )}
    </div>
  );
}
