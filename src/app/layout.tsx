import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DynamicFavicon } from "@/components/DynamicFavicon";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kwocag-web.vercel.app"),
  title: {
    default: "KWOCAG - Sewa Bot WhatsApp",
    template: "%s | KWOCAG",
  },
  description: "Layanan sewa bot WhatsApp otomatis untuk manajemen grup dan toko online. Proses cepat, bayar via QRIS, bot langsung aktif.",
  keywords: ["sewa bot whatsapp", "bot whatsapp otomatis", "bot grup whatsapp", "KWOCAG", "rental bot WA", "bot jaga grup", "bot store whatsapp"],
  authors: [{ name: "KWOCAG" }],
  alternates: {
    canonical: "https://kwocag-web.vercel.app",
  },
  openGraph: {
    title: "KWOCAG - Sewa Bot WhatsApp",
    description: "Layanan sewa bot WhatsApp untuk manajemen grup dan toko online. Bayar QRIS, bot langsung aktif dalam hitungan menit.",
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
    description: "Bot otomatis untuk toko online dan manajemen grup. Bayar QRIS, bot langsung join.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}
