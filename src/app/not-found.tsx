import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="mb-6">
          <span className="text-6xl font-bold bg-gradient-to-r from-[var(--primary)] to-blue-400 bg-clip-text text-transparent">404</span>
        </div>
        <h1 className="text-xl font-bold mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-[var(--muted)] mb-8">
          Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-medium transition text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Kembali ke Home
        </Link>
      </div>
    </div>
  );
}
