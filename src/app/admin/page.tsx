"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tfaCode, setTfaCode] = useState("");
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
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
        if (data.requires2FA) {
          setStep("2fa");
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        setError(data.message);
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tfaCode }),
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
          <p className="text-sm text-[var(--muted)] mt-1">
            {step === "credentials" ? "Masuk ke panel administrasi" : "Verifikasi identitas"}
          </p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 card-glow">
          {step === "credentials" ? (
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
          ) : (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-xs text-[var(--muted)]">Kode 6 digit dikirim ke Telegram</p>
              </div>
              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={tfaCode}
                  onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3.5 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-[var(--primary)] transition"
                />
              </div>
              {error && (
                <p className="text-[var(--danger)] text-xs bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || tfaCode.length !== 6}
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white py-3 rounded-xl font-medium transition shadow-lg shadow-[var(--primary)]/20"
              >
                {loading ? "Memverifikasi..." : "Verifikasi"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("credentials"); setError(""); setTfaCode(""); }}
                className="w-full text-xs text-[var(--muted)] hover:text-white transition py-2"
              >
                Kembali ke login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
