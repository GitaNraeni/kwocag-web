/**
 * WEB INTEGRATION - KIMMY (Bot Jaga Grup)
 * 
 * File ini = web-integration.js
 * Sudah di-import di lib/connection.js
 */

import { addSewa, findSewa, listSewa } from './lib/sewa.js';
import { findGroup, updateGroup } from './lib/group.js';
import { logWithTime, selisihHari } from './lib/utils.js';
import { deleteCache } from './lib/globalCache.js';

// ============ GANTI INI ============
const API_URL = 'https://kwocag-web.vercel.app';
const API_KEY = 'GANTI_DENGAN_PAKASIR_API_KEY';
const INSTANCE = 1;
const HANDLE_SLUGS = ['kimmy'];
// ===================================

const SLUG_MAP = {
  'kimmy': 'sewa',
  'kimmy-vip': 'sewavip',
  'kimi-store': 'sewa',
};

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

      logWithTime('WebOrder', `New: ${order.orderCode} | ${order.botTypeName} | ${order.groupLink}`);

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
        } catch (e) { logWithTime('WebOrder', `Gagal resolve: ${e.message}`); continue; }

        let isExtend = false;
        try { await sock.groupAcceptInvite(inviteCode); }
        catch (e) {
          if (e.message?.includes('already') || e.message?.includes('conflict')) isExtend = true;
          else { logWithTime('WebOrder', `Gagal join: ${e.message}`); continue; }
        }

        const existingSewa = await findSewa(groupId);
        if (existingSewa) isExtend = true;

        const expiredTimestamp = new Date(order.expiresAt).getTime();

        await addSewa(groupId, {
          linkGrub: order.groupLink,
          start: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
          expired: expiredTimestamp,
        });
        deleteCache(`sewa-${groupId}`);

        // Auto premium kalau >= 30 hari
        const sewaType = SLUG_MAP[order.botType] || 'sewa';
        const durationDays = Math.ceil((expiredTimestamp - Date.now()) / 86400000);
        if (sewaType === 'sewavip' || durationDays >= 30) {
          const groupData = await findGroup(groupId);
          const premiumExpiry = new Date(expiredTimestamp).toISOString();
          if (groupData) await updateGroup(groupId, { fitur: { ...groupData.fitur, premium: premiumExpiry } });
          else await updateGroup(groupId, { fitur: { premium: premiumExpiry } });
        }

        // Greeting
        try {
          await new Promise(r => setTimeout(r, 2000));
          const greetText = isExtend
            ? `╭─── *SEWA DIPERPANJANG* ───\n│\n│ Sewa bot diperpanjang!\n│ Durasi: *+${durationDays} hari*\n│ Expired: *${selisihHari(expiredTimestamp)}*\n│\n╰────────────────────────`
            : `╭─── *BOT AKTIF* ───\n│\n│ Halo semuanya!\n│ Bot telah aktif di grup ini.\n│ Durasi: *${durationDays} hari*\n│ Expired: *${selisihHari(expiredTimestamp)}*\n│\n│ Ketik *.menu* untuk fitur.\n│\n│ _${API_URL}_\n╰────────────────────────`;
          await sock.sendMessage(groupId, { text: greetText });
        } catch {}

        await confirmJoined(order.orderId);
        logWithTime('WebOrder', `OK: ${order.orderCode} → ${groupName}`);
      } catch (err) { logWithTime('WebOrder', `FAIL: ${err.message}`); }
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
    const allSewa = await listSewa();
    if (!allSewa || Object.keys(allSewa).length === 0) return;

    const entries = [];
    for (const [groupId, data] of Object.entries(allSewa)) {
      let groupName = null;
      try { const m = await sock.groupMetadata(groupId); groupName = m.subject; } catch {}
      entries.push({ groupId, groupLink: data.linkGrub || '', groupName, expired: data.expired });
    }

    const slug = HANDLE_SLUGS[0] || 'kimmy';
    await fetch(`${API_URL}/api/bot-integration/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ botTypeSlug: slug, entries }),
    });
    logWithTime('WebSync', `Synced ${entries.length} entries`);
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

let p1, p2, p3;
export function startWebIntegration(sock) {
  logWithTime('WebIntegration', 'Started');
  p1 = setInterval(() => checkWebOrders(sock), 30000);
  p2 = setInterval(() => checkWebExpired(sock), 120000);
  p3 = setInterval(() => syncSewaToWebsite(sock), 300000);
  setTimeout(() => checkWebOrders(sock), 5000);
  setTimeout(() => syncSewaToWebsite(sock), 15000);
}

export function stopWebIntegration() {
  if (p1) clearInterval(p1); if (p2) clearInterval(p2); if (p3) clearInterval(p3);
}
