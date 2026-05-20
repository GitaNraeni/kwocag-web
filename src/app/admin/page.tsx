"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [siteLogo, setSiteLogo] = useState("");
  const [siteName, setSiteName] = useState("KWOCAG");

  useEffect(() => {
    fetch("/api/site").then(r => r.json()).then(d => {
      if (d.success) {
        if (d.data.siteLogo) setSiteLogo(d.data.siteLogo);
        if (d.data.siteName) setSiteName(d.data.siteName);
      }
    }).catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/dashboard");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--primary)]/[0.03] blur-[120px]" />
      </div>

      <div className="relative max-w-sm w-full">
        <div className="text-center mb-8">
          {siteLogo ? (
            <img src={siteLogo} alt={siteName} className="w-14 h-14 mx-auto mb-4 rounded-xl object-cover" />
          ) : (
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
              <span className="text-lg font-bold text-[var(--primary)]">{siteName.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-xl font-bold">{siteName}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Masuk ke panel administrasi</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 card-glow">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] transition"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] transition"
              />
            </div>
            {error && (
              <p className="text-[var(--danger)] text-xs bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white py-3 rounded-xl font-medium transition shadow-lg shadow-[var(--primary)]/20"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
