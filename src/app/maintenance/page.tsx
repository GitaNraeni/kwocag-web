"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MaintenancePage() {
  const router = useRouter();
  const [siteName, setSiteName] = useState("KWOCAG");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const check = () => {
      fetch("/api/site").then(r => r.json()).then(d => {
        if (d.success) {
          setSiteName(d.data.siteName);
          if (d.data.maintenanceMsg) setMessage(d.data.maintenanceMsg);
          if (!d.data.maintenance) router.push("/");
        }
      }).catch(() => {});
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--warning)]/[0.03] blur-[120px]" />
      </div>

      <div className="text-center max-w-md relative z-10 animate-fade-in">
        {/* Icon — wrench */}
        <div className="w-20 h-20 mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-[var(--warning)]/5 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-[var(--card)] border border-[var(--warning)]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{siteName}</h1>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--warning)]/10 border border-[var(--warning)]/20 text-xs text-[var(--warning)] mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] animate-pulse" />
          Maintenance
        </div>
        <p className="text-sm text-[var(--muted)] leading-relaxed max-w-sm mx-auto">
          {message || "Website sedang dalam perbaikan. Silakan kembali beberapa saat lagi."}
        </p>
      </div>
    </div>
  );
}
