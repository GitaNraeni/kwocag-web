# Cara Integrasi Website ke Script Bot WhatsApp

File `bot-integration-example.js` yang ada di folder `docs/` ini BUKAN bagian dari website.
File ini nanti di-copy ke folder script bot WhatsApp kamu (yang jalan di VPS/server bot).

## Kapan dipakai?
Setelah website sudah jalan dan bisa terima order, baru file ini ditaruh di script bot.

## Dimana ditaruh?
Taruh di root folder script bot kamu, sejajar dengan file utama bot.

Contoh struktur folder bot kamu:
```
script-bot/
├── index.js          (file utama bot)
├── bot-integration.js (copy dari docs/bot-integration-example.js)
├── database/
│   └── sewa.json     (file JSON sewa yang sudah ada)
└── ...
```

## Cara pakai?
Di file utama bot, tambahkan:
```js
const { startIntegration } = require("./bot-integration");
// setelah koneksi WA ready:
startIntegration(sock);
```

Untuk sekarang ABAIKAN DULU file ini. Fokus ke website dulu.
