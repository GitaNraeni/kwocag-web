import type { Metadata } from "next";
import { Space_Grotesk, Inter, Oxanium } from "next/font/google";
import "./globals.css";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const oxanium = Oxanium({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kwocag.web.id"),
  title: {
    default: "KWOCAG ID - Sewa Bot WhatsApp",
    template: "%s | KWOCAG ID",
  },
  description: "Layanan sewa bot WhatsApp untuk grup kamu. Aktif otomatis, langsung bisa digunakan.",
  keywords: ["sewa bot whatsapp", "bot whatsapp otomatis", "bot grup whatsapp", "KWOCAG", "KWOCAG ID", "rental bot WA", "bot jaga grup", "bot store whatsapp"],
  authors: [{ name: "KWOCAG ID" }],
  alternates: {
    canonical: "https://kwocag.web.id",
  },
  openGraph: {
    title: "KWOCAG ID - Sewa Bot WhatsApp",
    description: "Layanan sewa bot WhatsApp untuk grup kamu. Aktif otomatis, langsung bisa digunakan.",
    url: "https://kwocag.web.id",
    siteName: "KWOCAG ID",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "https://files.catbox.moe/amosh8.png",
        width: 1200,
        height: 630,
        alt: "KWOCAG ID - Sewa Bot WhatsApp Otomatis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KWOCAG ID - Sewa Bot WhatsApp",
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
  icons: [
    {
      rel: "icon",
      url: "https://files.catbox.moe/lt03d3.png",
      type: "image/png",
    },
    {
      rel: "apple-touch-icon",
      url: "https://files.catbox.moe/lt03d3.png",
    },
  ],
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
      className={`${spaceGrotesk.variable} ${inter.variable} ${oxanium.variable} h-full antialiased`}
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
