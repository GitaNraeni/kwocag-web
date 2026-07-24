import type { Metadata } from "next";
import { Space_Grotesk, Inter, Oxanium } from "next/font/google";
import "./globals.css";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";

const DEFAULT_ICON = "https://files.catbox.moe/lt03d3.png";

// Ambil status maintenance + info situs (nama, icon) dari DB, di-cache 15 detik.
// Sebelumnya query ini jalan LANGSUNG ke Prisma di setiap navigasi (termasuk
// klik Link biasa), jadi tiap pindah halaman = 1 round-trip DB baru → lambat,
// kerasa kayak "harus klik 2x". Dengan cache ini, DB cuma dihit sesekali,
// sisanya diambil dari memory. Begitu admin toggle maintenance/ganti nama
// situs di dashboard, cache ini langsung di-invalidate lewat
// revalidateTag("site-settings") (lihat src/app/api/admin/settings/route.ts).
const getSiteSettings = unstable_cache(
  async () => {
    try {
      const settings = await prisma.siteSettings.findUnique({
        where: { id: "main" },
        select: {
          maintenance: true,
          siteName: true,
          siteIcon: true,
          siteLogo: true,
        },
      });
      return {
        maintenance: settings?.maintenance === true,
        siteName: settings?.siteName,
        icon: settings?.siteIcon || settings?.siteLogo || undefined,
      };
    } catch {
      // DB error → anggap tidak maintenance, biar situs tetap jalan
      return { maintenance: false, siteName: undefined, icon: undefined };
    }
  },
  ["site-settings"],
  { revalidate: 15, tags: ["site-settings"] }
);

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

// Tidak di-export langsung — cuma dipakai sebagai basis di generateMetadata()
// di bawah. Next.js tidak mengizinkan `metadata` dan `generateMetadata`
// di-export bareng dari file yang sama.
const baseMetadata: Metadata = {
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
      url: DEFAULT_ICON,
      type: "image/png",
    },
    {
      rel: "apple-touch-icon",
      url: DEFAULT_ICON,
    },
  ],
};

// Title & favicon dinamis (nama situs, icon) sekarang di-generate di sini,
// server-side, lewat API resmi Next.js — BUKAN lagi dengan manipulasi
// document.head/document.title manual di client (komponen DynamicFavicon
// lama sudah dihapus). Manipulasi DOM manual itu bentrok sama reconciler
// React/Next pas navigasi antar halaman, dan itu penyebab error
// "Cannot read properties of null (reading 'removeChild')" serta gejala
// "harus klik 2x" yang dialami.
export async function generateMetadata(): Promise<Metadata> {
  const { siteName, icon } = await getSiteSettings();
  return {
    ...baseMetadata,
    title: siteName
      ? { default: `${siteName} - Sewa Bot WhatsApp`, template: `%s | ${siteName}` }
      : baseMetadata.title,
    icons: icon
      ? [
          { rel: "icon", url: icon, type: "image/png" },
          { rel: "apple-touch-icon", url: icon },
        ]
      : baseMetadata.icons,
  };
}

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
    const { maintenance } = await getSiteSettings();
    if (maintenance) {
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
        <MaintenanceGuard />
        {children}
      </body>
    </html>
  );
}