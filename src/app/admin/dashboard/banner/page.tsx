"use client";

import { useState, useEffect } from "react";

export default function BannerPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerImage, setBannerImage] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerText, setBannerText] = useState("");
  const [bannerLink, setBannerLink] = useState("");
  const [bannerLinkLabel, setBannerLinkLabel] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/banner")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setBannerEnabled(d.data.bannerEnabled);
          setBannerImage(d.data.bannerImage || "");
          setBannerTitle(d.data.bannerTitle || "");
          setBannerText(d.data.bannerText || "");
          setBannerLink(d.data.bannerLink || "");
          setBannerLinkLabel(d.data.bannerLinkLabel || "");
        }
      })
      .catch(() => setError("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!bannerImage && !bannerTitle && !bannerText) {
      setError("Isi minimal satu: judul, teks, atau gambar");
      return;
    }
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/admin/banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerEnabled, bannerImage, bannerTitle, bannerText, bannerLink, bannerLinkLabel }),
      });
      const data = await res.json();
      if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(data.message || "Gagal menyimpan");
    } catch {
      setError("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const hasContent = bannerImage || bannerTitle || bannerText;

  if (loading) {
    return (
      <div className="max-w-xl animate-fade-in">
        <div className="skeleton h-8 w-40 mb-6" />
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-10 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-1">Pengumuman Pop-up</h2>
      <p className="text-xs text-[var(--muted)] mb-6">Muncul saat pengunjung pertama buka website. Bisa pakai judul, teks, gambar, atau kombinasi.</p>

      <div className="space-y-4">
        {/* Card form */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Aktifkan pop-up untuk pengunjung</p>
            </div>
            <button
              type="button"
              onClick={() => setBannerEnabled(!bannerEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                bannerEnabled ? "bg-[var(--primary)]" : "bg-[var(--card-border)]"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                bannerEnabled ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Judul */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5">Judul <span className="opacity-50">(opsional)</span></label>
            <input
              type="text"
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              placeholder="Contoh: Promo Spesial! atau Info Penting"
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* Teks */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5">Teks / Deskripsi <span className="opacity-50">(opsional)</span></label>
            <textarea
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              rows={3}
              placeholder="Tulis isi pengumuman di sini..."
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] resize-none"
            />
          </div>

          {/* URL Gambar */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5">URL Gambar <span className="opacity-50">(opsional)</span></label>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="https://i.imgur.com/xxx.jpg"
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* Link */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1.5">Link Tujuan <span className="opacity-50">(opsional)</span></label>
              <input
                type="url"
                value={bannerLink}
                onChange={(e) => setBannerLink(e.target.value)}
                placeholder="https://wa.me/..."
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1.5">Label Tombol <span className="opacity-50">(opsional)</span></label>
              <input
                type="text"
                value={bannerLinkLabel}
                onChange={(e) => setBannerLinkLabel(e.target.value)}
                placeholder="Contoh: Hubungi Kami"
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {error && (
            <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-xs rounded-lg p-3">{error}</div>
          )}
          {saved && (
            <div className="bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] text-xs rounded-lg p-3">Tersimpan</div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white rounded-xl font-medium transition"
          >
            {saving ? "Menyimpan..." : "Simpan Pengumuman"}
          </button>
        </div>

        {/* Preview — hanya muncul kalau ada konten */}
        {hasContent && (
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
            <p className="text-xs text-[var(--muted)] mb-3 font-medium">Preview tampilan di website:</p>
            <div className="max-w-sm mx-auto rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--background)]">
              {bannerImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bannerImage}
                  alt="Preview"
                  className="w-full object-cover max-h-52"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              {(bannerTitle || bannerText || (bannerLink && bannerLinkLabel)) && (
                <div className="p-4 space-y-2">
                  {bannerTitle && (
                    <p className="text-base font-bold text-[var(--foreground)] leading-snug">{bannerTitle}</p>
                  )}
                  {bannerText && (
                    <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap">{bannerText}</p>
                  )}
                  {bannerLink && bannerLinkLabel && (
                    <div className="pt-1">
                      <span className="inline-block px-4 py-2 bg-[var(--primary)] text-white text-xs rounded-lg font-medium">
                        {bannerLinkLabel}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
