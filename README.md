# 🤖 RentalBot - Website Sewa Bot WhatsApp

Website untuk order/sewa bot WhatsApp dengan pembayaran otomatis via QRIS (Pakasir).

## Fitur

- 🏪 Landing page dengan daftar tipe bot
- 📝 Form order (pilih bot, durasi, link grup, kontak)
- 💳 Pembayaran otomatis QRIS via Pakasir.com
- 👨‍💼 Admin dashboard (kelola order, CRUD tipe bot, perpanjang sewa)
- 📱 Notifikasi order ke Telegram
- 🔗 API integrasi dengan script bot (cek sewa aktif, list aktif)
- ➕ Admin bisa tambah tipe bot baru kapan saja

---

## Cara Run (Step by Step)

### 1. Install Dependencies

Buka terminal di folder `rental-bot`, lalu jalankan:

```bash
npm install @prisma/client zod uuid
npm install -D prisma @types/uuid tsx
```

### 2. Setup Database (PostgreSQL Gratis)

Pilih salah satu:
- **Supabase** (gratis): https://supabase.com → buat project → copy connection string
- **Neon** (gratis): https://neon.tech → buat project → copy connection string

### 3. Buat file `.env`

Copy dari `.env.example`:

```bash
copy .env.example .env
```

Lalu isi:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
PAKASIR_API_KEY="api_key_dari_pakasir"
PAKASIR_MERCHANT_ID="merchant_id_dari_pakasir"
TELEGRAM_BOT_TOKEN="token_bot_telegram_kamu"
TELEGRAM_CHAT_ID="chat_id_telegram_kamu"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="random_string_panjang_bebas"
```

### 4. Setup Database & Seed Data

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

Ini akan:
- Generate Prisma client
- Buat tabel di database
- Isi data awal (2 tipe bot + admin account)

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka http://localhost:3000

### 6. Login Admin

- URL: http://localhost:3000/admin
- Username: `admin`
- Password: `admin123`

---

## Deploy ke Vercel

1. Push ke GitHub
2. Buka https://vercel.com → Import project
3. Tambahkan Environment Variables (sama seperti `.env`)
4. Deploy!

Jangan lupa update `NEXT_PUBLIC_APP_URL` dan `PAKASIR_CALLBACK_URL` ke domain Vercel kamu.

---

## API Integrasi Script Bot

Untuk script bot kamu bisa panggil API ini:

### Cek apakah grup masih aktif sewa

```
GET /api/bot-integration/check?group=https://chat.whatsapp.com/xxx
Header: x-api-key: <PAKASIR_API_KEY>
```

Response:
```json
{
  "success": true,
  "active": true,
  "data": {
    "orderCode": "ORD-XXXXXXXX",
    "botType": "bot-store",
    "botTypeName": "Bot Store",
    "expiresAt": "2025-02-01T00:00:00.000Z"
  }
}
```

### List semua sewa aktif

```
GET /api/bot-integration/active?botType=bot-store
Header: x-api-key: <PAKASIR_API_KEY>
```

---

## Struktur Project

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── order/
│   │   ├── [slug]/page.tsx   # Form order per bot
│   │   └── status/
│   │       ├── page.tsx      # Cek order by code
│   │       └── [code]/page.tsx # Detail status order
│   ├── admin/
│   │   ├── page.tsx          # Login admin
│   │   ├── dashboard/page.tsx # Kelola orders
│   │   └── bots/page.tsx     # CRUD tipe bot
│   └── api/
│       ├── bots/             # Public: list bot
│       ├── orders/           # Public: create & check order
│       ├── payment/callback/ # Callback dari Pakasir
│       ├── admin/            # Admin: login, orders, bots
│       └── bot-integration/  # API untuk script bot
├── lib/
│   ├── prisma.ts             # Database client
│   ├── auth.ts               # JWT auth
│   ├── pakasir.ts            # Payment gateway
│   ├── telegram.ts           # Notifikasi Telegram
│   └── utils.ts              # Helper functions
└── prisma/
    ├── schema.prisma         # Database schema
    └── seed.ts               # Data awal
```

## Setup Pakasir.com

1. Daftar di https://pakasir.com
2. Buat merchant → aktifkan QRIS
3. Copy API Key & Merchant ID ke `.env`
4. Set callback URL ke `https://domain-kamu.vercel.app/api/payment/callback`

## Setup Telegram Notifikasi

1. Chat @BotFather di Telegram → `/newbot` → copy token
2. Chat @userinfobot untuk dapat chat_id kamu
3. Masukkan ke `.env`
