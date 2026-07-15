/**
 * WEB INTEGRATION - KIMI STORE (Bot Store)
 * 
 * File ini = web-integration.js
 * Sudah di-import di index.js
 */

const fs = require('fs');
const path = require('path');

// ============ GANTI INI ============
const API_URL = 'https://sewabot.kwocag.web.id';
const API_KEY = 'GANTI_DENGAN_PAKASIR_API_KEY';
const INSTANCE = 1;
const HANDLE_SLUGS = ['kimi-store'];
// ===================================

const SEWA_PATH = path.resolve('./database/db_sewa.json');

function readSewa() {
  try {
    if (!fs.existsSync(SEWA_PATH)) { fs.writeFileSync(SEWA_PATH, '{}'); return {}; }
    return JSON.parse(fs.readFileSync(SEWA_PATH, 'utf-8'));
  } catch { return {}; }
}

function writeSewa(data) { fs.writeFileSync(SEWA_PATH, JSON.stringify(data, null, 2)); }

function addSewaEntry(groupId, name, expired) {
  const data = readSewa();
  data[groupId] = { name: name || 'Web Order', expired };
  writeSewa(data);
}

async function checkWebOrders(sock) {
  try {
    const slugFilter = HANDLE_SLUGS.length > 0 ? `&slug=${HANDLE_SLUGS[0]}` : '';
    const res = await fetch(`${API_URL}/api/bot-integration/webhook?instance=${INSTANCE}${slugFilter}`, {
      headers: { 'x-api-key': API_KEY },
    });
    const data = await res.json();
    if (!data.success || data.data.length === 0) return;

    for (const order of data.data) {
      if (HANDLE_SLUGS.length > 0 && !HANDLE_SLUGS.includes(order.botType)) continue;

      console.log(`[WebOrder] New: ${order.orderCode} | ${order.groupLink}`);
      try {
        const inviteCode = order.groupLink.split('https://chat.whatsapp.com/')[1];
        if (!inviteCode) { await confirmJoined(order.orderId); continue; }

        let groupId, groupName;
        try {
          const res = await sock.query({
            tag: 'iq', attrs: { type: 'get', xmlns: 'w:g2', to: '@g.us' },
            content: [{ tag: 'invite', attrs: { code: inviteCode } }],
          });
          groupId = res.content[0].attrs.id + '@g.us';
          groupName = res.content[0].attrs.subject || 'Unknown';
        } catch (e) { console.error(`[WebOrder] Gagal resolve: ${e.message}`); continue; }

        let isExtend = false;
        try { await sock.groupAcceptInvite(inviteCode); }
        catch (e) {
          if (e.message?.includes('already') || e.message?.includes('conflict')) isExtend = true;
          else { console.error(`[WebOrder] Gagal join: ${e.message}`); continue; }
        }

        const sewaData = readSewa();
        if (sewaData[groupId]) isExtend = true;

        const expiredTimestamp = new Date(order.expiresAt).getTime();
        addSewaEntry(groupId, groupName, expiredTimestamp);

        // Greeting
        try {
          await new Promise(r => setTimeout(r, 2000));
          const days = Math.ceil((expiredTimestamp - Date.now()) / 86400000);
          const text = isExtend
            ? `╭─── *SEWA DIPERPANJANG* ───\n│\n│ Sewa bot diperpanjang!\n│ Durasi: *+${days} hari*\n│\n╰────────────────────────`
            : `╭─── *BOT AKTIF* ───\n│\n│ Halo semuanya!\n│ Bot Store aktif di grup ini.\n│ Durasi: *${days} hari*\n│\n│ Ketik *.menu* untuk fitur.\n│\n│ _${API_URL}_\n╰────────────────────────`;
          await sock.sendMessage(groupId, { text });
        } catch {}

        await confirmJoined(order.orderId);
        console.log(`[WebOrder] OK: ${order.orderCode} → ${groupName}`);
      } catch (err) { console.error(`[WebOrder] FAIL: ${err.message}`); }
    }
  } catch {}
}

async function checkWebExpired(sock) {
  try {
    const res = await fetch(`${API_URL}/api/bot-integration/expired`, { headers: { 'x-api-key': API_KEY } });
    const data = await res.json();
    if (!data.success || data.data.length === 0) return;
    for (const order of data.data) { await confirmLeft(order.orderId); }
  } catch {}
}

async function syncSewaToWebsite(sock) {
  try {
    const data = readSewa();
    if (!data || Object.keys(data).length === 0) return;

    const entries = [];
    for (const [groupId, entry] of Object.entries(data)) {
      let groupName = null;
      try { const m = await sock.groupMetadata(groupId); groupName = m.subject; } catch {}
      entries.push({ groupId, groupLink: '', groupName: groupName || entry.name, expired: entry.expired });
    }

    const slug = HANDLE_SLUGS[0] || 'kimi-store';
    await fetch(`${API_URL}/api/bot-integration/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ botTypeSlug: slug, entries }),
    });
    console.log(`[WebSync] Synced ${entries.length} entries`);
  } catch {}
}

async function confirmJoined(orderId, groupName) {
  await fetch(`${API_URL}/api/bot-integration/webhook`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({ orderId, groupName }),
  });
}

async function confirmLeft(orderId) {
  await fetch(`${API_URL}/api/bot-integration/expired`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({ orderId }),
  });
}

/**
 * Polling ringan — hanya cek apakah ada order baru yang menunggu.
 * Kirim ?since=<timestamp> supaya server hanya cek order setelah polling terakhir.
 * Kalau hasPending = true → langsung fetch order penuh via checkWebOrders.
 */
let lastSignalCheck = Date.now() - 15 * 60 * 1000; // mulai dari 15 menit lalu biar tidak miss

async function pollPendingSignal(sock) {
  try {
    const slug = HANDLE_SLUGS.length > 0 ? HANDLE_SLUGS[0] : '';
    const params = new URLSearchParams({ since: String(lastSignalCheck) });
    if (slug) params.set('slug', slug);

    const res = await fetch(`${API_URL}/api/bot-integration/pending-signal?${params}`, {
      headers: { 'x-api-key': API_KEY },
    });
    const data = await res.json();

    if (data?.timestamp) lastSignalCheck = data.timestamp;

    if (data?.hasPending) {
      console.log(`[WebOrder] Signal: ada ${data.count} order pending → fetch sekarang`);
      await checkWebOrders(sock);
    }
  } catch { /* silent */ }
}

let p1, p2, p3, p4;
function startWebIntegration(sock) {
  console.log('[WebIntegration] Started');
  // Strategi dua-tahap untuk hemat invocations tapi tetap pickup order cepat:
  //
  // p1 — pending-signal tiap 30 detik (RINGAN: 1 COUNT query, di-cache 25 dtk)
  //      → kalau ada order baru, langsung trigger checkWebOrders
  //      → bot pickup order dalam ~30 detik setelah payment
  //
  // p2 — checkWebOrders tiap 5 menit (FALLBACK: kalau signal miss)
  // p3 — checkWebExpired tiap 10 menit
  // p4 — syncSewaToWebsite tiap 30 menit
  p1 = setInterval(() => pollPendingSignal(sock), 30 * 1000);      // 30 detik (ringan)
  p2 = setInterval(() => checkWebOrders(sock), 5 * 60 * 1000);     // 5 menit (fallback)
  p3 = setInterval(() => checkWebExpired(sock), 10 * 60 * 1000);   // 10 menit
  p4 = setInterval(() => syncSewaToWebsite(sock), 30 * 60 * 1000); // 30 menit
  setTimeout(() => checkWebOrders(sock), 5000);
  setTimeout(() => syncSewaToWebsite(sock), 15000);
}

function stopWebIntegration() {
  if (p1) { clearInterval(p1); p1 = null; }
  if (p2) { clearInterval(p2); p2 = null; }
  if (p3) { clearInterval(p3); p3 = null; }
  if (p4) { clearInterval(p4); p4 = null; }
}

module.exports = { startWebIntegration, stopWebIntegration };
