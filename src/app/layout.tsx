import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kwocag.web.id"),
  title: {
    default: "KWOCAG - Sewa Bot WhatsApp",
    template: "%s | KWOCAG",
  },
  description: "Layanan sewa bot WhatsApp untuk grup kamu. Aktif otomatis, langsung bisa digunakan.",
  keywords: ["sewa bot whatsapp", "bot whatsapp otomatis", "bot grup whatsapp", "KWOCAG", "rental bot WA", "bot jaga grup", "bot store whatsapp"],
  authors: [{ name: "KWOCAG" }],
  alternates: {
    canonical: "https://kwocag.web.id",
  },
  openGraph: {
    title: "KWOCAG - Sewa Bot WhatsApp",
    description: "Layanan sewa bot WhatsApp untuk grup kamu. Aktif otomatis, langsung bisa digunakan.",
    url: "https://kwocag-web.vercel.app",
    siteName: "KWOCAG",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "https://files.catbox.moe/amosh8.png",
        width: 1200,
        height: 630,
        alt: "KWOCAG - Sewa Bot WhatsApp Otomatis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KWOCAG - Sewa Bot WhatsApp",
    description: "Layanan sewa bot WhatsApp untuk grup kamu. Aktif otomatis, langsung bisa digunakan.",
    images: ["https://files.catbox.moe/amosh8.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: [],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Cek maintenance langsung via Prisma
  // Skip kalau path adalah /admin, /api, atau /maintenance itu sendiri
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const skip = pathname.startsWith("/admin") ||
               pathname.startsWith("/api") ||
               pathname === "/maintenance" ||
               pathname.startsWith("/maintenance");

  if (!skip) {
    let settings = null;
    try {
      settings = await prisma.siteSettings.findUnique({
        where: { id: "main" },
        select: { maintenance: true },
      });
    } catch {
      // DB error → lanjut normal
    }
    if (settings?.maintenance === true) {
      redirect("/maintenance");
    }
  }

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <DynamicFavicon />
        <MaintenanceGuard />
        {children}
      </body>
    </html>
  );
}
