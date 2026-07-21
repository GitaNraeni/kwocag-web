"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

export function Navbar({ backButton = false }: { backButton?: boolean }) {
  const [siteName, setSiteName] = useState("KWOCAG");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 10);
    if (latest > 60) setOpen(false);
  });

  useEffect(() => {
    // Ambil siteName dari cache localStorage dulu biar tidak ada delay
    try {
      const cached = localStorage.getItem("kwocag_sitename");
      if (cached) setSiteName(cached);
    } catch {}

    fetch("/api/site")
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.siteName) {
          setSiteName(d.data.siteName);
          try { localStorage.setItem("kwocag_sitename", d.data.siteName); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const linkClass = (href: string) => {
    const active = pathname === href;
    return `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? "text-white bg-white/[0.08]"
        : "text-[var(--muted)] hover:text-[var(--primary)] active:text-[var(--primary)] hover:bg-white/[0.05]"
    }`;
  };

  return (
    <>
      {/* Overlay blur saat mobile menu terbuka */}
      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              key="nav-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 40,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                backgroundColor: "rgba(0,0,0,0.45)",
              }}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Navbar full-width sticky */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-black/90 backdrop-blur-xl border-[var(--primary)]/25"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="shrink-0 group mr-auto"
            style={{ fontFamily: "var(--font-logo)" }}
          >
            <span className="text-lg font-bold text-white tracking-wide leading-none group-hover:text-[var(--primary)] group-active:text-[var(--primary)] transition-colors duration-200">
              {siteName}
            </span>
          </Link>

          {/* Desktop menu */}
          <nav className="hidden sm:flex items-center gap-1">
            {backButton ? (
              <Link href="/" className={linkClass("__back")}>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Kembali
                </span>
              </Link>
            ) : (
              <>
                <Link href="/about" className={linkClass("/about")}>Tentang</Link>
                <Link href="/check" className={linkClass("/check")}>Cek Order</Link>
              </>
            )}
          </nav>

          {/* Mobile */}
          <div className="sm:hidden">
            {backButton ? (
              <Link href="/" className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-white transition font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali
              </Link>
            ) : (
              <button
                onClick={() => setOpen(v => !v)}
                className="text-[var(--muted)] hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition"
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="sm:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-xl"
            >
              <div className="max-w-5xl mx-auto px-6 py-2">
                <Link href="/about" onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3.5 text-sm border-b border-white/[0.04] transition-colors ${
                    pathname === "/about" ? "text-white" : "text-[var(--muted)] hover:text-white"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tentang
                </Link>
                <Link href="/check" onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3.5 text-sm transition-colors ${
                    pathname === "/check" ? "text-white" : "text-[var(--muted)] hover:text-white"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Cek Order
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
