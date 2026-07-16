# 🤖 KWOCAG ID - Website Sewa Bot WhatsApp

Website untuk order/sewa bot WhatsApp dengan pembayaran otomatis via QRIS.

🌐 Live: [kwocag.web.id](https://kwocag.web.id)

## Fitur

- 🏪 Landing page dengan daftar tipe bot & harga
- 📝 Form order (pilih bot, durasi, link grup, kontak)
- 💳 Pembayaran otomatis QRIS via **Pakasir** atau **RamaShop**
- 👨‍💼 Admin dashboard (kelola order, rental, tipe bot, banner, settings)
- 📱 Notifikasi order & alert ke Telegram
- 🔗 API integrasi dengan script bot WhatsApp
- ⚡ Bot pickup order otomatis dalam ~30 detik setelah payment

---

## Setup (Step by Step)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database (PostgreSQL)

Pilih salah satu:
- **Neon** (gratis): https://neon.tech
- **Supabase** (gratis): https://supabase.com

### 3. Buat file `.env`

```bash
copy .env.example .env
```

Isi nilai yang diperlukan:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Payment Gateway — pilih salah satu (atur di Admin → Settings)
# Pakasir: butuh API Key + Project Slug
# RamaShop: butuh API Key saja
PAKASIR_API_KEY="api_key_dari_pakasir"
PAKASIR_PROJECT_SLUG="slug_project_pakasir"

# Telegram Notifikasi
TELEGRAM_BOT_TOKEN="token_bot_telegram"
TELEGRAM_CHAT_ID="chat_id_tujuan_notifikasi"

# App
NEXT_PUBLIC_APP_URL="https://kwocag.web.id"
JWT_SECRET="random_string_panjang"
```

### 4. Setup Database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Jalankan Dev Server

```bash
npm run dev
```

Buka http://localhost:3000

### 6. Login Admin

- URL: `/admin` atau `/panel` (sesuai `ADMIN_PATH`)
- Username & password sesuai seed atau yang diatur di admin settings

---

## Payment Gateway

Website mendukung dua provider, bisa dipilih di **Admin → Settings**:

| Provider | Yang dibutuhkan | Catatan |
|---|---|---|
| **Pakasir** | `PAKASIR_API_KEY` + `PAKASIR_PROJECT_SLUG` | Default. Set callback URL ke `/api/payment/callback` |
| **RamaShop** | `PAKASIR_API_KEY` (isi dengan RamaShop API key) | Status di-poll dari frontend, tidak butuh webhook |

---

## Deploy ke Vercel

1. Push ke GitHub
2. Import project di https://vercel.com
3. Set Environment Variables (sama seperti `.env`)
4. Set `NEXT_PUBLIC_APP_URL` ke domain production
5. Untuk Pakasir: set callback URL di dashboard Pakasir ke `https://domain.com/api/payment/callback`

---

## Integrasi Script Bot WhatsApp

Copy file dari folder `docs/` ke script bot kamu:

- `docs/web-integration-kimmy.js` → untuk bot Kimmy (jaga grup)
- `docs/web-integration-kimistore.js` → untuk bot Kimi Store

Ganti konstanta di bagian atas file:

```js
const API_URL = 'https://kwocag.web.id';
const API_KEY = 'isi_dengan_PAKASIR_API_KEY';
const INSTANCE = 1; // nomor instance bot
const HANDLE_SLUGS = ['kimmy']; // slug tipe bot yang di-handle
```

### Cara kerja integrasi

Bot menggunakan sistem dua-tahap untuk efisiensi:

1. **Polling ringan** `/api/bot-integration/pending-signal` tiap 30 detik — hanya cek apakah ada order baru (1 COUNT query)
2. **Kalau ada signal** → fetch `/api/bot-integration/webhook` untuk ambil detail order → bot join grup

Bot pickup order dalam **~30 detik** setelah payment sukses.

### Endpoint bot-integration

| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/bot-integration/pending-signal` | GET | Cek cepat ada order baru (ringan) |
| `/api/bot-integration/webhook` | GET | Ambil order SUCCESS yang belum di-join |
| `/api/bot-integration/webhook` | POST | Konfirmasi bot sudah join / failed |
| `/api/bot-integration/expired` | GET | List rental yang sudah expired |
| `/api/bot-integration/expired` | POST | Konfirmasi bot sudah leave |
| `/api/bot-integration/heartbeat` | POST | Update status bot masih hidup |
| `/api/bot-integration/sync` | POST | Sinkronisasi data sewa dari bot ke website |
| `/api/bot-integration/kicked` | POST | Notif bot di-kick dari grup |
| `/api/bot-integration/check` | GET | Cek apakah grup masih aktif sewa |
| `/api/bot-integration/active` | GET | List semua rental aktif |

Semua endpoint membutuhkan header `x-api-key: <PAKASIR_API_KEY>`.

---

## Struktur Project

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── order/                      # Halaman order
│   ├── admin/dashboard/            # Admin panel
│   └── api/
│       ├── bots/                   # Public: list bot & stats
│       ├── orders/                 # Public: create & cek order
│       ├── payment/callback/       # Webhook dari Pakasir
│       ├── admin/                  # Admin API
│       └── bot-integration/        # API untuk script bot
├── components/                     # UI components
└── lib/
    ├── prisma.ts                   # Database client
    ├── pakasir.ts                  # Payment gateway (Pakasir + RamaShop)
    ├── telegram.ts                 # Notifikasi Telegram
    └── utils.ts                    # Helper functions
prisma/
├── schema.prisma                   # Database schema
└── seed.ts                         # Data awal
docs/
├── web-integration-kimmy.js        # Integrasi untuk bot Kimmy
├── web-integration-kimistore.js    # Integrasi untuk bot Kimi Store
└── INTEGRASI-BOT.md               # Panduan integrasi
```
