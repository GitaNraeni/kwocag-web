/**
 * WEB INTEGRATION - KIMMY (Bot Jaga Grup)
 * 
 * File ini = web-integration.js
 * Sudah di-import di lib/connection.js
 * 
 * PENTING: Ganti INSTANCE sesuai panel yang dipakai!
 * - Panel 1 (nomor pertama) → INSTANCE = 1
 * - Panel 2 (nomor kedua)  → INSTANCE = 2
 */
console.log('[DEBUG] web-integration.js loaded');

import { addSewa, findSewa, listSewa } from './lib/sewa.js';
import { findGroup, updateGroup } from './lib/group.js';
import { logWithTime, selisihHari } from './lib/utils.js';
import { deleteCache } from './lib/globalCache.js';

// ============ GANTI INI PER PANEL ============
const API_URL = 'https://kwocag.web.id';
const API_KEY = 'chuLlTmvIq3rtp6WxCyglK3VABzHKEih';
const INSTANCE = 1; // Panel 1 = 1, Panel 2 = 2
const HANDLE_SLUGS = ['kimmy'];
// =============================================

// Retry tracker — order yang gagal diproses
const failedRetries = new Map(); // orderId → { count, lastError }
const MAX_RETRIES = 3;

async function checkWebOrders(sock) {
  try {
    const slugFilter = HANDLE_SLUGS.length > 0 ? `slug=${HANDLE_SLUGS[0]}` : '';
    const res = await fetch(`${API_URL}/api/bot-integration/webhook?instance=${INSTANCE}&${slugFilter}`, {
      headers: { 'x-api-key': API_KEY },
      signal: AbortSignal.timeout(15000), // 15 detik timeout
    });
    const data = await res.json();
    if (!data.success || data.data.length === 0) return;

    for (const order of data.data) {
      if (HANDLE_SLUGS.length > 0 && !HANDLE_SLUGS.includes(order.botType)) continue;
      if (order.orderCode && order.orderCode.startsWith('SYNC-')) continue;

      // Cek retry count — skip kalau sudah melebihi batas
      const retryInfo = failedRetries.get(order.orderId);
      if (retryInfo && retryInfo.count >= MAX_RETRIES) {
        // Sudah 3x gagal, mark sebagai failed di website dan skip
        await confirmFailed(order.orderId, retryInfo.lastError);
        failedRetries.delete(order.orderId);
        logWithTime('WebOrder', `SKIP (max retry): ${order.orderCode} — ${retryInfo.lastError}`);
        continue;
      }

      logWithTime('WebOrder', `Processing: ${order.orderCode} | ${order.botTypeName} | ${order.groupLink} (attempt ${(retryInfo?.count || 0) + 1})`);

      try {
        const inviteCode = order.groupLink.split('https://chat.whatsapp.com/')[1]?.split('?')[0]?.split(' ')[0]?.trim();
        if (!inviteCode) {
          await confirmJoined(order.orderId);
          logWithTime('WebOrder', `No invite code, confirmed: ${order.orderCode}`);
          continue;
        }

        let groupId, groupName;
        try {
          const queryRes = await sock.query({
            tag: 'iq', attrs: { type: 'get', xmlns: 'w:g2', to: '@g.us' },
            content: [{ tag: 'invite', attrs: { code: inviteCode } }],
          });
          groupId = queryRes.content[0].attrs.id + '@g.us';
          groupName = queryRes.content[0].attrs.subject || 'Unknown';
        } catch (e) {
          const errMsg = e.message || String(e);
          // not-authorized = bot pernah di-kick, nggak bisa join lagi via link
          if (errMsg.includes('not-authorized')) {
            trackRetry(order.orderId, 'Bot pernah di-kick dari grup ini. Minta admin invite manual.');
            // Langsung mark failed karena nggak akan bisa resolve
            await confirmFailed(order.orderId, 'Bot pernah di-kick, tidak bisa join via link. Admin harus invite manual.');
            failedRetries.delete(order.orderId);
          } else if (errMsg.includes('gone') || errMsg.includes('not-found')) {
            // Link sudah invalid/expired
            await confirmFailed(order.orderId, 'Link grup sudah tidak valid atau expired.');
            failedRetries.delete(order.orderId);
          } else {
            trackRetry(order.orderId, `Gagal resolve: ${errMsg}`);
          }
          logWithTime('WebOrder', `Gagal resolve ${order.orderCode}: ${errMsg}`);
          continue;
        }

        let isExtend = false;
        try { await sock.groupAcceptInvite(inviteCode); }
        catch (e) {
          const errMsg = e.message || String(e);
          if (errMsg.includes('already') || errMsg.includes('conflict')) {
            isExtend = true;
          } else if (errMsg.includes('not-authorized')) {
            await confirmFailed(order.orderId, 'Bot pernah di-kick, tidak bisa join. Admin harus invite manual.');
            failedRetries.delete(order.orderId);
            logWithTime('WebOrder', `Gagal join (kicked) ${order.orderCode}`);
            continue;
          } else {
            trackRetry(order.orderId, `Gagal join: ${errMsg}`);
            logWithTime('WebOrder', `Gagal join ${order.orderCode}: ${errMsg}`);
            continue;
          }
        }

        // Cek apakah sudah ada di sewa.json — kalau iya, ini perpanjang
        const existingSewa = await findSewa(groupId);
        if (existingSewa) isExtend = true;

        // order.expiresAt dari website SUDAH final & benar (server sudah menghitung
        // sisa waktu rental lama + durasi order baru). Jangan ditambah-tambah lagi
        // di sini — itu yang bikin total hari jadi lebih dari seharusnya kalau lagi
        // perpanjang (mis. harusnya 72 hari malah jadi 85 hari).
        const expiredTimestamp = new Date(order.expiresAt).getTime();

        await addSewa(groupId, {
          linkGrub: order.groupLink,
          start: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
          expired: expiredTimestamp,
        });
        deleteCache(`sewa-${groupId}`);

        // Set premium grup kalau order isPremium
        const durationDays = Math.ceil((expiredTimestamp - Date.now()) / 86400000);
        if (order.isPremium) {
          try {
            const groupData = await findGroup(groupId);
            const premiumExpiry = new Date(expiredTimestamp).toISOString();
            if (groupData) await updateGroup(groupId, { fitur: { ...groupData.fitur, premium: premiumExpiry } });
            else await updateGroup(groupId, { fitur: { premium: premiumExpiry } });
          } catch (e) {
            logWithTime('WebOrder', `Gagal set premium ${order.orderCode}: ${e.message}`);
          }
        }

        // Greeting
        try {
          await new Promise(r => setTimeout(r, 2000));
          const greetText = isExtend
            ? `╭─── *SEWA DIPERPANJANG* ───\n│\n│ Sewa bot diperpanjang!\n│ Durasi: *+${durationDays} hari*\n│ Expired: *${selisihHari(expiredTimestamp)}*\n│\n╰────────────────────────`
            : `╭─── *BOT AKTIF* ───\n│\n│ Halo semuanya!\n│ Bot telah aktif di grup ini.\n│ Durasi: *${durationDays} hari*\n│ Expired: *${selisihHari(expiredTimestamp)}*\n│\n│ Ketik *.menu* untuk melihat fitur.\n│\n│ _${API_URL}_\n╰────────────────────────`;
          await sock.sendMessage(groupId, { text: greetText });
        } catch (e) {
          logWithTime('WebOrder', `Gagal kirim greeting ${order.orderCode}: ${e.message}`);
        }

        await confirmJoined(order.orderId, groupName, groupId, isExtend);
        // Berhasil — hapus dari retry tracker
        failedRetries.delete(order.orderId);
        logWithTime('WebOrder', `OK: ${order.orderCode} → ${groupName} (${isExtend ? 'extend' : 'new'})`);
      } catch (err) {
        trackRetry(order.orderId, err.message);
        logWithTime('WebOrder', `FAIL ${order.orderCode}: ${err.message}`);
      }
    }
  } catch (err) {
    logWithTime('WebOrder', `Polling error: ${err.message}`);
  }
}

async function checkWebExpired(sock) {
  try {
    const slugFilter = HANDLE_SLUGS.length > 0 ? `?slug=${HANDLE_SLUGS[0]}&instance=${INSTANCE}` : `?instance=${INSTANCE}`;
    const res = await fetch(`${API_URL}/api/bot-integration/expired${slugFilter}`, {
      headers: { 'x-api-key': API_KEY },
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    if (!data.success || data.data.length === 0) return;

    for (const order of data.data) {
      try {
        const groupId = order.groupId ? order.groupId + '@g.us' : null;
        if (groupId) {
          // Hapus dari sewa.json
          const { deleteSewa } = await import('./lib/sewa.js');
          await deleteSewa(groupId);
          deleteCache(`sewa-${groupId}`);

          // Keluar dari grup
          try {
            await sock.sendMessage(groupId, { text: '🔔 Masa sewa telah berakhir. Bot otomatis keluar dari grup. Terima kasih!' });
            await new Promise(r => setTimeout(r, 1500));
            await sock.groupLeave(groupId);
            logWithTime('WebExpired', `Bot keluar dari ${groupId}`);
          } catch (e) {
            logWithTime('WebExpired', `Gagal keluar dari ${groupId}: ${e.message}`);
          }
        }

        // Konfirmasi ke website
        await confirmLeft(order.orderId || order.rentalId);
      } catch (e) {
        logWithTime('WebExpired', `Error handle expired ${order.orderId}: ${e.message}`);
      }
    }
  } catch (err) {
    logWithTime('WebExpired', `Check error: ${err.message}`);
  }
}

async function syncSewaToWebsite(sock) {
  try {
    const allSewa = await listSewa();
    if (!allSewa || Object.keys(allSewa).length === 0) return;

    const entries = [];
    for (const [groupId, data] of Object.entries(allSewa)) {
      let groupName = null;
      let isPremium = false;
      try { const m = await sock.groupMetadata(groupId); groupName = m.subject; } catch {}
      try {
        const groupData = await findGroup(groupId);
        if (groupData?.fitur?.premium) {
          const premExpiry = new Date(groupData.fitur.premium);
          if (premExpiry > new Date()) isPremium = true;
        }
      } catch {}
      entries.push({ groupId, groupLink: data.linkGrub || '', groupName, expired: data.expired, contactPhone: data.contactPhone || null, isPremium });
    }

    const slug = HANDLE_SLUGS[0] || 'kimmy';
    await fetch(`${API_URL}/api/bot-integration/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ botTypeSlug: slug, entries, instance: INSTANCE }),
      signal: AbortSignal.timeout(30000),
    });
    logWithTime('WebSync', `Synced ${entries.length} entries`);
  } catch (err) {
    logWithTime('WebSync', `Sync error: ${err.message}`);
  }
}

function trackRetry(orderId, errorMsg) {
  const existing = failedRetries.get(orderId) || { count: 0, lastError: '' };
  failedRetries.set(orderId, { count: existing.count + 1, lastError: errorMsg });
}

async function confirmJoined(orderId, groupName, groupId, isExtend = false) {
  try {
    await fetch(`${API_URL}/api/bot-integration/webhook`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ orderId, groupName, groupId, isExtend }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    logWithTime('WebOrder', `Gagal confirm joined ${orderId}: ${err.message}`);
  }
}

async function confirmFailed(orderId, reason) {
  try {
    await fetch(`${API_URL}/api/bot-integration/webhook`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ orderId, failed: true, reason }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    logWithTime('WebOrder', `Gagal confirm failed ${orderId}: ${err.message}`);
  }
}

async function confirmLeft(orderId) {
  try {
    await fetch(`${API_URL}/api/bot-integration/expired`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ orderId }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    logWithTime('WebExpired', `Gagal confirm left ${orderId}: ${err.message}`);
  }
}

async function updateGroupName(groupId, groupName) {
  try {
    await fetch(`${API_URL}/api/bot-integration/update-name`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ groupId, groupName }),
      signal: AbortSignal.timeout(10000),
    });
    logWithTime('WebIntegration', `Nama grup diupdate: ${groupName} (${groupId})`);
  } catch (err) {
    logWithTime('WebIntegration', `Gagal update nama grup ${groupId}: ${err.message}`);
  }
}

async function sendHeartbeat() {
  try {
    await fetch(`${API_URL}/api/bot-integration/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ instance: INSTANCE, botTypeSlug: HANDLE_SLUGS[0] || 'kimmy' }),
      signal: AbortSignal.timeout(10000),
    });
  } catch { /* silent */ }
}

/**
 * Polling ringan — hanya cek apakah ada order baru yang menunggu.
 * Kirim ?since=<timestamp> supaya server hanya cek order setelah polling terakhir.
 * Kalau hasPending = true → langsung fetch order penuh via checkWebOrders.
 * Dengan ini bot bisa pickup order dalam ~30 detik tanpa boros invocations.
 */
let lastSignalCheck = Date.now() - 15 * 60 * 1000; // mulai dari 15 menit lalu biar tidak miss

async function pollPendingSignal(sock) {
  try {
    const slug = HANDLE_SLUGS.length > 0 ? HANDLE_SLUGS[0] : '';
    const params = new URLSearchParams({ since: String(lastSignalCheck) });
    if (slug) params.set('slug', slug);

    const res = await fetch(`${API_URL}/api/bot-integration/pending-signal?${params}`, {
      headers: { 'x-api-key': API_KEY },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();

    // Update timestamp dulu sebelum fetch — kalau fetch gagal, tidak re-check order lama
    if (data?.timestamp) lastSignalCheck = data.timestamp;

    if (data?.hasPending) {
      logWithTime('WebOrder', `Signal: ada ${data.count} order pending → fetch sekarang`);
      await checkWebOrders(sock);
    }
  } catch { /* silent */ }
}

// === RECONNECT-SAFE: Stop dulu yang lama sebelum start baru ===
let p1, p2, p3, p4, p5;
let kickListener = null;

function startWebIntegration(sock) {
  // PENTING: Stop interval lama dulu biar nggak duplikat
  stopWebIntegration();
  logWithTime('WebIntegration', `Started (Instance ${INSTANCE}, Slug: ${HANDLE_SLUGS.join(',')})`);

  // Strategi dua-tahap untuk hemat invocations tapi tetap pickup order cepat:
  //
  // p1 — pending-signal tiap 30 detik (RINGAN: 1 COUNT query, di-cache 25 dtk)
  //      → kalau ada order baru, langsung trigger checkWebOrders
  //      → bot pickup order dalam ~30 detik setelah payment
  //
  // p2 — checkWebOrders tiap 5 menit (FALLBACK: kalau signal miss)
  //
  // p3 — checkWebExpired tiap 10 menit
  // p4 — syncSewaToWebsite tiap 30 menit
  // p5 — heartbeat tiap 10 menit
  p1 = setInterval(() => pollPendingSignal(sock), 30 * 1000);      // 30 detik (ringan)
  p2 = setInterval(() => checkWebOrders(sock), 5 * 60 * 1000);     // 5 menit (fallback)
  p3 = setInterval(() => checkWebExpired(sock), 10 * 60 * 1000);   // 10 menit
  p4 = setInterval(() => syncSewaToWebsite(sock), 30 * 60 * 1000); // 30 menit
  p5 = setInterval(() => sendHeartbeat(), 10 * 60 * 1000);         // 10 menit

  // Jalankan sekali langsung saat start
  setTimeout(() => checkWebOrders(sock), 5000);
  setTimeout(() => syncSewaToWebsite(sock), 15000);
  setTimeout(() => sendHeartbeat(), 20000);

  // Detect perubahan nama grup — update ke website
  sock.ev.on('groups.update', async (updates) => {
    try {
      for (const update of updates) {
        if (!update.subject) continue; // bukan perubahan nama
        const groupId = update.id;
        const groupName = update.subject;
        // Cek apakah grup ini ada di sewa.json dulu
        const sewa = await findSewa(groupId);
        if (!sewa) continue; // bukan grup sewa, skip
        await updateGroupName(groupId, groupName);
      }
    } catch (err) {
      logWithTime('WebIntegration', `groups.update error: ${err.message}`);
    }
  });

  // Detect kalau bot di-kick dari grup yang masih ada sewanya
  kickListener = async (update) => {
    try {
      if (update.action !== 'remove') return;
      const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
      const botLid = sock.user?.id;
      const isBot = update.participants.some(p => p === botId || p === botLid || p.includes(sock.user?.id?.split(':')[0]));
      if (!isBot) return;

      const groupId = update.id;
      logWithTime('WebIntegration', `Bot di-kick dari ${groupId}`);

      const { deleteSewa } = await import('./lib/sewa.js');
      await deleteSewa(groupId);

      const slug = HANDLE_SLUGS[0] || 'kimmy';
      await fetch(`${API_URL}/api/bot-integration/kicked`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ groupId, botTypeSlug: slug }),
      }).catch(() => {});
    } catch (err) {
      logWithTime('WebIntegration', `Kick detect error: ${err.message}`);
    }
  };
  sock.ev.on('group-participants.update', kickListener);
}

function stopWebIntegration() {
  if (p1) { clearInterval(p1); p1 = null; }
  if (p2) { clearInterval(p2); p2 = null; }
  if (p3) { clearInterval(p3); p3 = null; }
  if (p4) { clearInterval(p4); p4 = null; }
  if (p5) { clearInterval(p5); p5 = null; }
}

export { startWebIntegration, stopWebIntegration };
