"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function MaintenanceGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Jangan cek kalau sudah di /maintenance atau /admin
    if (pathname.startsWith("/maintenance") || pathname.startsWith("/admin")) return;

    const check = async () => {
      try {
        const res = await fetch("/api/site");
        const data = await res.json();
        if (data?.data?.maintenance === true) {
          router.replace("/maintenance");
        }
      } catch {
        // fetch gagal → biarkan
      }
    };

    // Cek langsung saat mount
    check();

    // Polling tiap 15 detik
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, [pathname, router]);

  return null;
}
