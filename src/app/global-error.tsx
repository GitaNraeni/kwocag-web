"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="id">
      <body style={{ background: "#000", color: "#e8edf5", fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ textAlign: "center", maxWidth: "350px" }}>
            <div style={{ width: "64px", height: "64px", margin: "0 auto 1.5rem", borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Terjadi Kesalahan</h1>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>
              Maaf, ada yang salah. Coba muat ulang halaman.
            </p>
            <button
              onClick={reset}
              style={{ padding: "0.625rem 1.25rem", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
