// Global loading — ditampilkan Next.js App Router saat navigasi antar halaman
// Mencegah halaman lama "stuck" tampil saat URL sudah berubah
export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
      </div>
    </div>
  );
}
