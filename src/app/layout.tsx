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
  title: "KWOCAG - Sewa Bot WhatsApp",
  description: "Sewa bot WhatsApp otomatis untuk toko online dan manajemen grup. Bayar QRIS, bot langsung join. Tanpa ribet.",
  keywords: ["sewa bot whatsapp", "bot whatsapp otomatis", "bot grup whatsapp", "KWOCAG", "rental bot WA"],
  authors: [{ name: "KWOCAG" }],
  openGraph: {
    title: "KWOCAG - Sewa Bot WhatsApp",
    description: "Bot otomatis untuk toko online dan manajemen grup. Bayar QRIS, bot langsung join dalam 1 menit.",
    url: "https://kwocag-web.vercel.app",
    siteName: "KWOCAG",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "https://files.catbox.moe/vms1wj.jpg",
        width: 512,
        height: 512,
        alt: "KWOCAG - Sewa Bot WhatsApp",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "KWOCAG - Sewa Bot WhatsApp",
    description: "Bot otomatis untuk toko online dan manajemen grup. Bayar QRIS, bot langsung join.",
    images: ["https://files.catbox.moe/vms1wj.jpg"],
  },
  robots: {
    index: true,
    follow: true,
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
