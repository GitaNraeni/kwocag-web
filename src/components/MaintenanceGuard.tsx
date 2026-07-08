"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function MaintenanceGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Jangan cek kalau sudah di /maintenance atau /admin
    if (pathname.startsWith("/maintenance") || pathname.startsWith("/admin")) return;

    // Cek sekali saat mount — server-side layout.tsx sudah handle redirect otomatis
    // Tidak perlu polling karena layout server component redirect langsung
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

    check();
    // Tidak ada setInterval — hemat invocation
  }, [pathname, router]);

  return null;
}
