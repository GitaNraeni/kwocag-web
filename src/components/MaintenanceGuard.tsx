"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export function MaintenanceGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const checked = useRef(false);

  useEffect(() => {
    // Jangan cek kalau sudah di /maintenance atau /admin
    if (pathname.startsWith("/maintenance") || pathname.startsWith("/admin")) return;

    // Cek hanya sekali per session — tidak perlu re-fetch setiap navigasi
    // Server-side layout.tsx sudah handle redirect saat halaman pertama load
    if (checked.current) return;
    checked.current = true;

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
