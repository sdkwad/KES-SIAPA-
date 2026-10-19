'use strict';
/* KES SIAPA? — Cluedo edisi Malaysia.
   Telefon meja: urus giliran, semak siapa boleh sangkal, simpan rekod siasatan.
   Telefon pemain: imbas QR → kad tangan + buku nota grid. Tiada server: semua data pemain ada dalam link (#c=...). */

// Alamat awam. Bila telefon meja buka fail/localhost, QR tetap halakan kawan ke sini.
const PUBLIC_URL = 'https://kessiapa.vercel.app/';
const HOST_KEY = 'kessiapa_meja_v2';
const NOTE_KEY = 'kessiapa_nota_';
const MAX_PLAYERS = 8;
const QR_MAX_BYTES = 228; // had QR versi 9 (ECC-L) dalam js/qr.js

// ================= KAD =================
// Kad bertanda big:true hanya dalam dek Besar (27 kad) — wajib untuk 7–8 detektif.
const SUSPECTS = [
  { id: 's1', name: 'Datin Mawar', tag: 'DM', col: '#e2554a', role: 'Sosialit, tuan rumah' },
  { id: 's2', name: 'Kapten Kunyit', tag: 'KK', col: '#e8b23a', role: 'Bekas tentera, panas baran' },
  { id: 's3', name: 'Mak Cik Melur', tag: 'MM', col: '#ece6d6', role: 'Tukang masak 30 tahun' },
  { id: 's4', name: 'Encik Pandan', tag: 'EP', col: '#4cbf86', role: 'Peguam keluarga' },
  { id: 's5', name: 'Puan Merak', tag: 'PM', col: '#4a90e2', role: 'Penyanyi kelab malam' },
  { id: 's6', name: 'Prof. Terung', tag: 'PT', col: '#a274e0', role: 'Pensyarah sejarah' },
  { id: 's7', name: 'Cik Jambu', tag: 'CJ', col: '#f59fb0', role: 'Influencer media sosial', big: true },
  { id: 's8', name: 'Sarjan Kelabu', tag: 'SK', col: '#9aa3ad', role: 'Pengawal keselamatan', big: true }
];
const WEAPONS = [
  { id: 'w1', name: 'Keris', icon: 'keris' },
  { id: 'w2', name: 'Parang', icon: 'parang' },
  { id: 'w3', name: 'Lesung Batu', icon: 'lesung' },
  { id: 'w4', name: 'Rotan', icon: 'rotan' },
  { id: 'w5', name: 'Kuali Besi', icon: 'kuali' },
  { id: 'w6', name: 'Senapang Patah', icon: 'senapang' },
  { id: 'w7', name: 'Botol Racun', icon: 'racun', big: true },
  { id: 'w8', name: 'Tali Guni', icon: 'tali', big: true }
];
const ROOMS = [
  { id: 'r1', name: 'Anjung', icon: 'anjung' },
  { id: 'r2', name: 'Ruang Tamu', icon: 'sofa' },
  { id: 'r3', name: 'Ruang Makan', icon: 'makan' },
  { id: 'r4', name: 'Dapur', icon: 'api' },
  { id: 'r5', name: 'Bilik Bacaan', icon: 'buku' },
  { id: 'r6', name: 'Bilik Tidur', icon: 'katil' },
  { id: 'r7', name: 'Taman Orkid', icon: 'bunga' },
  { id: 'r8', name: 'Garaj', icon: 'kereta' },
  { id: 'r9', name: 'Loteng', icon: 'loteng' },
  { id: 'ra', name: 'Kolam Renang', icon: 'kolam', big: true },
  { id: 'rb', name: 'Bilik Karaoke', icon: 'mikrofon', big: true }
];
SUSPECTS.forEach(c => { c.k = 's'; });
WEAPONS.forEach(c => { c.k = 'w'; });
ROOMS.forEach(c => { c.k = 'r'; });
const CATS = [
  { k: 's', label: 'Suspek', q: 'Siapa?', cards: SUSPECTS },
  { k: 'w', label: 'Senjata', q: 'Guna apa?', cards: WEAPONS },
  { k: 'r', label: 'Bilik', q: 'Di mana?', cards: ROOMS }
];
const ALL = [...SUSPECTS, ...WEAPONS, ...ROOMS];
const CARD = Object.fromEntries(ALL.map(c => [c.id, c]));
const ORDER = Object.fromEntries(ALL.map((c, i) => [c.id, i]));
const CAT_LABEL = { s: 'Suspek', w: 'Senjata', r: 'Bilik' };
const DECKS = { k: { label: 'Klasik', n: 21 }, b: { label: 'Besar', n: 27 } };
const inDeck = (c, d) => d === 'b' || !c.big;
const deckAll = d => ALL.filter(c => inDeck(c, d));
const deckCats = d => CATS.map(cat => ({ ...cat, cards: cat.cards.filter(c => inDeck(c, d)) }));
const PCOLORS = ['#e0b25a', '#5aa9e6', '#4cbf86', '#ef6f62', '#b98be6', '#f08a3c', '#f27fb2', '#3fc7c7'];

// ================= IKON (24x24, garisan) =================
const ICONS = {
  kaca: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M8 8.5a3.5 3.5 0 013-1.5"/>',
  tuduh: '<path d="M13 3.5l7.5 7.5M10.5 6l7.5 7.5M11.8 4.8l-5 5M19.2 12.2l-5 5M8.8 11.2L3 17l3 3 5.8-5.8M2 22h11"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3h-3zM20.5 14v.01M14 20.5h.01M17.5 20.5H21v-3.5"/>',
  kongsi: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
  tambah: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  betul: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  bantuan: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1.2-1.5 2.5M12 17v.01"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  balik: '<path d="M15 5l-7 7 7 7"/>',
  depan: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  piala: '<path d="M8 4h8v5a4 4 0 01-8 0zM8 6H4.5a3 3 0 003.5 4M16 6h3.5a3 3 0 01-3.5 4M12 13v4M8.5 21h7M10 17h4v4h-4z"/>',
  sampul: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  mata: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  tutupmata: '<path d="M3 3l18 18M10.6 5.1A10.5 10.5 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3 3.8M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7a9.8 9.8 0 005.4-1.6M9.9 9.9a3 3 0 004.2 4.2"/>',
  ulang: '<path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/>',
  rumah: '<path d="M3 11l9-8 9 8M5 9.5V21h14V9.5"/>',
  buang: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  pensel: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19z"/><path d="M14.5 6.5l3 3"/>',
  // Senjata
  keris: '<path d="M12 2l1.4 2.5-1 2 1 2.2-1 2.2 1 2.1h-2.8l1-2.1-1-2.2 1-2.2-1-2z"/><path d="M8 13h8M12 13v3.5M10.6 16.5h2.8l-.4 5h-2z"/>',
  parang: '<path d="M6.5 15.5L18.5 3.5c1.7 2.3 1.6 6.3-1.2 9.2L10 18.5z"/><path d="M8.2 17.2L4 21.4M3 20.4l1.6-1.6"/>',
  lesung: '<path d="M3.5 12h17a8.5 7 0 01-17 0z"/><path d="M8 21h8M13.5 12l5-9.2 1.8 1-4 8.2"/>',
  rotan: '<path d="M7.5 21.5L16 6.2a3 3 0 015.2 2.8"/><path d="M10 17.2l1.6.9M12.4 12.8l1.6.9"/>',
  kuali: '<path d="M3 11h18a9 6.5 0 01-18 0z"/><path d="M1 11h2M21 11h2M9 7.5c0-1.4 1-1.9 1-3.3M13.5 7.5c0-1.4 1-1.9 1-3.3"/>',
  senapang: '<path d="M2 9.5h15l2-2h3v4.5l-9 1-2 4H7.5l1-3.2H2z"/><path d="M11 12.8v2.2"/>',
  racun: '<path d="M9 2.5h6M10 2.5V7l-3.6 4.6A6 6 0 0012 21.5a6 6 0 005.6-9.9L14 7V2.5"/><path d="M9.5 13.5l5 4M14.5 13.5l-5 4"/>',
  tali: '<path d="M12 12a2 2 0 11-2-2 4 4 0 115.5 4.5A6 6 0 116.2 8.5 8 8 0 1119.8 15"/><path d="M19.8 15l1.7 6"/>',
  // Bilik
  anjung: '<path d="M2.5 10.5L12 4l9.5 6.5"/><path d="M5 10v7M19 10v7M3 17h18M8 21h8M9.5 17v4M14.5 17v4"/>',
  sofa: '<path d="M5 11V8a2 2 0 012-2h10a2 2 0 012 2v3"/><path d="M3 13a2 2 0 014 0v2h10v-2a2 2 0 014 0v5H3z"/><path d="M5 18v2M19 18v2"/>',
  makan: '<circle cx="12.5" cy="12" r="5.5"/><circle cx="12.5" cy="12" r="2.5"/><path d="M3 4v5a1.5 1.5 0 003 0V4M4.5 10.5V20M21.5 4c-1.8 0-2.3 3-2.3 6h2.3v10"/>',
  api: '<path d="M12 21.5c-4 0-6.5-2.6-6.5-6 0-3.8 3.2-5.4 3.8-9.5 2 1.5 3.2 3.2 3.2 5.2 1-1 1.6-2.1 1.6-3.2 2.2 1.6 4.4 4.3 4.4 7.5 0 3.4-2.5 6-6.5 6z"/>',
  buku: '<path d="M2 5h6a4 4 0 014 4v12a3 3 0 00-3-3H2zM22 5h-6a4 4 0 00-4 4v12a3 3 0 013-3h7z"/>',
  katil: '<path d="M3 6v14M3 16h18v4M21 16v-3a3 3 0 00-3-3h-8v6"/><circle cx="6.5" cy="12" r="1.8"/>',
  bunga: '<circle cx="12" cy="6" r="3"/><circle cx="7.6" cy="9.6" r="3"/><circle cx="16.4" cy="9.6" r="3"/><path d="M12 12v9.5M12 18c-2.5 0-4-1.5-4.5-3.5M12 16.5c2 0 3.5-1 4-3"/>',
  kereta: '<path d="M3 16.5v-4.5l2.2-5h13.6l2.2 5v4.5z"/><path d="M3 12h18"/><circle cx="7" cy="16.5" r="2"/><circle cx="17" cy="16.5" r="2"/>',
  loteng: '<path d="M2 12l10-9 10 9"/><path d="M5 10v11h14V10M10 21v-5h4v5"/><circle cx="12" cy="10.5" r="1.6"/>',
  kolam: '<path d="M9 14V3.5M15 14V3.5M9 6.5h6M9 10h6"/><path d="M2 17.5c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 21.5c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/>',
  mikrofon: '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5v4M8.5 21.5h7"/>'
};

// ================= ALAT BANTU =================
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const shuffle = a => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const byOrder = (a, b) => ORDER[a] - ORDER[b];
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* tiada getaran */ } };
// Huruf avatar: huruf pertama, atau dua huruf jika ada nama lain bermula dengan huruf sama (Ali / Abu → Al / Ab).
const tagsOf = names => names.map(n => {
  const t = String(n || '?').trim(), f = t.charAt(0).toUpperCase();
  const clash = names.filter(m => String(m || '').trim().charAt(0).toUpperCase() === f).length > 1;
  return clash ? f + t.charAt(1).toLowerCase() : f;
});
const ava = (tag, i, cls = '') => `<span class="ava ${cls}" style="--c:${PCOLORS[i % PCOLORS.length]}">${esc(tag)}</span>`;
const cardArt = (c, big = false) => c.k === 's'
  ? `<span class="tok${big ? ' big' : ''}" style="--c:${c.col}">${c.tag}</span>`
  : `<span class="art art-${c.k}${big ? ' big' : ''}">${ic(c.icon)}</span>`;
const evi = (id, attrs = '') => { const c = CARD[id]; const tag = attrs ? 'button' : 'div';
  return `<${tag} class="evi ${c.k}" ${attrs}>${cardArt(c)}<span>${esc(c.name)}</span><small>${CAT_LABEL[c.k]}</small></${tag}>`; };
const trio = r => `${esc(CARD[r.s].name)} · ${esc(CARD[r.w].name)} · ${esc(CARD[r.r].name)}`;

let toastTimer = 0;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storan penuh/disekat */ } }
};

// ================= KOD PEMAIN (dalam link QR) =================
// Format v3: 3|dek|indeksSaya|kadSeorang|nama~nama~...|kadTangan|kadMeja, XOR ringkas supaya tak boleh dibaca terus, base64url.
// v2 (tanpa dek, sentiasa Klasik) masih diterima supaya link lama tak rosak.
const XKEY = [107, 101, 115, 115, 105, 97, 112, 97];
function encodeCode(o) {
  const raw = ['3', o.deck, o.me, o.cpp, o.names.join('~'), o.hand.join(''), o.pub.join('')].join('|');
  let bin = '';
  new TextEncoder().encode(raw).forEach((b, i) => { bin += String.fromCharCode(b ^ XKEY[i % 8]); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decodeCode(code) {
  try {
    let b64 = code.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) ^ XKEY[i % 8];
    const parts = new TextDecoder().decode(bytes).split('|');
    if (parts[0] === '2') parts.splice(1, 0, 'k');
    else if (parts[0] !== '3') return null;
    const [, deck, me, cpp, names, hand, pub] = parts;
    const ids = s => (String(s || '').match(/[swr][0-9a-z]/g) || []).filter(id => CARD[id]);
    const o = { deck: deck === 'b' ? 'b' : 'k', me: +me, cpp: +cpp, names: names.split('~'), hand: ids(hand), pub: ids(pub) };
    if (!o.names[o.me] || !o.hand.length || !(o.cpp > 0)) return null;
    return o;
  } catch (e) { return null; }
}

const isLocal = () => location.protocol === 'file:' || /^(localhost|127\.|\[::1\]|192\.168\.|10\.)/.test(location.hostname);
const baseUrl = () => (isLocal() ? PUBLIC_URL : location.href.split('#')[0]);

// =====================================================================
// TELEFON MEJA
// =====================================================================
let H = null;
const ui = { modal: null, rec: null };

function freshHost(names, deckPick) {
  return { phase: 'setup', names: names || ['', '', '', ''], deckPick: deckPick || 'k', deck: 'k', players: [], pub: [], vault: null, cpp: 0,
    start: 0, turn: 0, round: 1, dealIdx: 0, qrText: false, mode: 'sug', from: 'turn',
    pick: { s: null, w: null, r: null }, res: null, logs: [], win: null, why: '', hist: [] };
}
function saveHost() { store.set(HOST_KEY, H); }
function loadHost() {
  const o = store.get(HOST_KEY);
  if (!o || !o.phase) return freshHost();
  return { deck: 'k', deckPick: 'k', hist: [], ...o };
}

const cleanName = n => String(n || '').replace(/[|~]/g, '').trim().slice(0, 14);
const filledNames = () => H.names.map(cleanName).filter(Boolean);
const deckFor = count => (count > 6 ? 'b' : H.deckPick);
const hostTags = () => tagsOf(H.players.map(p => p.name));

// Link pemain mesti muat dalam QR: pendekkan nama dalam kod (hanya untuk label buku nota) jika perlu.
function linkFor(i) {
  for (const len of [14, 10, 7, 4, 2]) {
    const names = H.players.map(p => [...p.name].slice(0, len).join(''));
    const url = `${baseUrl()}#c=${encodeCode({ deck: H.deck, me: i, cpp: H.cpp, names, hand: H.players[i].hand, pub: H.pub })}`;
    if (new TextEncoder().encode(url).length <= QR_MAX_BYTES || len === 2) return url;
  }
  return '';
}
function textFor(i) {
  const p = H.players[i];
  return `KES SIAPA? — Kad ${p.name.toUpperCase()}\n` +
    p.hand.map(id => `• ${CARD[id].name} (${CAT_LABEL[CARD[id].k]})`).join('\n') +
    (H.pub.length ? `\n\nBukti meja: ${H.pub.map(id => CARD[id].name).join(', ')}` : '') +
    '\n\nRahsia! Jangan tunjuk sesiapa.';
}

function deal(names) {
  names = names.map(cleanName).filter(Boolean);
  if (names.length < 3) return toast('Perlu sekurang-kurangnya 3 detektif');
  if (names.length > MAX_PLAYERS) return toast(`Maksimum ${MAX_PLAYERS} detektif`);
  if (new Set(names.map(n => n.toLowerCase())).size !== names.length) return toast('Nama setiap detektif mesti berbeza');
  const deck = deckFor(names.length), cats = deckCats(deck);
  const vault = { s: shuffle(cats[0].cards)[0].id, w: shuffle(cats[1].cards)[0].id, r: shuffle(cats[2].cards)[0].id };
  const rest = shuffle(deckAll(deck).map(c => c.id).filter(id => !Object.values(vault).includes(id)));
  const cpp = Math.floor(rest.length / names.length);
  const start = Math.floor(Math.random() * names.length);
  Object.assign(H, {
    phase: 'deal', names, deck, cpp, vault, start, turn: start, round: 1, dealIdx: 0, qrText: false,
    pub: rest.slice(cpp * names.length).sort(byOrder),
    players: names.map((name, i) => ({ name, hand: rest.slice(i * cpp, (i + 1) * cpp).sort(byOrder), elim: false, lastRoom: null })),
    res: null, logs: [], win: null, why: '', hist: []
  });
  ui.modal = null;
  render(true);
}

// Undo: simpan salinan keadaan sebelum setiap langkah penting (maks 12).
function snap() {
  const { hist, ...rest } = H;
  H.hist = [...(hist || []).slice(-11), JSON.stringify(rest)];
}
function undo() {
  if (!H.hist || !H.hist.length) { toast('Tiada langkah untuk dibatalkan'); return; }
  const hist = H.hist.slice(0, -1);
  H = { ...JSON.parse(H.hist[H.hist.length - 1]), hist };
  ui.modal = null; toast('Langkah terakhir dibatalkan'); render(true);
}

function nextAlive(from) {
  const n = H.players.length;
  for (let i = 1; i <= n; i++) { const c = (from + i) % n; if (!H.players[c].elim) return c; }
  return from;
}
function endTurn() {
  snap();
  const n = H.players.length, dist = i => (i - H.start + n) % n;
  const nxt = nextAlive(H.turn);
  if (dist(nxt) <= dist(H.turn)) H.round++;
  H.turn = nxt; H.res = null; H.phase = 'turn';
  buzz(15); render(true);
}

function startPick(mode, from) {
  H.mode = mode; H.from = from || 'turn';
  H.pick = { s: null, w: null, r: null };
  H.phase = 'pick'; render(true);
}

function submitSuggestion() {
  snap();
  const { s, w, r } = H.pick, n = H.players.length, me = H.players[H.turn];
  const ask = [s, w, r], passed = [];
  let by = null;
  for (let i = 1; i < n; i++) {
    const idx = (H.turn + i) % n;
    if (H.players[idx].hand.some(id => ask.includes(id))) { by = idx; break; }
    passed.push(idx);
  }
  me.lastRoom = r;
  H.res = { s, w, r, passed, by };
  H.logs.unshift({ t: 'sug', round: H.round, who: H.turn, s, w, r, passed, by });
  H.phase = 'result';
  buzz(by === null ? [60, 40, 60] : 30);
  render(true);
}

function submitAccusation() {
  snap();
  const { s, w, r } = H.pick, v = H.vault, me = H.players[H.turn];
  const right = s === v.s && w === v.w && r === v.r;
  H.logs.unshift({ t: 'acc', round: H.round, who: H.turn, s, w, r, ok: right });
  ui.modal = null;
  if (right) {
    H.win = H.turn; H.why = `${me.name} selesaikan kes dengan tuduhan tepat!`; H.phase = 'over';
    buzz([80, 60, 80, 60, 200]);
  } else {
    me.elim = true;
    const alive = H.players.map((p, i) => (p.elim ? -1 : i)).filter(i => i >= 0);
    if (alive.length === 1) {
      H.win = alive[0]; H.why = `Semua detektif lain tersilap tuduh. ${H.players[alive[0]].name} menang!`; H.phase = 'over';
    } else H.phase = 'wrong';
    buzz([200, 80, 200]);
  }
  render(true);
}

async function shareLink(i) {
  const url = linkFor(i), name = H.players[i].name;
  try {
    if (navigator.share) { await navigator.share({ title: 'Kes Siapa? — kad ' + name, text: `Kad rahsia ${name} (jangan buka kalau bukan kau!)`, url }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(url); toast('Link ' + name + ' disalin'); } catch (e) { prompt('Salin link ini:', url); }
}

// ---------- Paparan meja ----------
function hostBar() {
  const inGame = H.phase !== 'setup';
  return `<header class="bar ${inGame ? '' : 'home'}">
    <div class="brand"><span class="mark">${ic('kaca')}</span><div><b>KES SIAPA?</b><small>FAIL SIASATAN · MEJA</small></div></div>
    <div class="bar-act">
      ${inGame && H.hist && H.hist.length ? `<button class="icon-btn" data-a="undo" aria-label="Batal langkah terakhir">${ic('undo')}</button>` : ''}
      <button class="icon-btn" data-a="help" aria-label="Cara main">${ic('bantuan')}</button>
      ${inGame ? `<button class="icon-btn" data-a="menu" aria-label="Menu">${ic('menu')}</button>` : ''}
    </div>
  </header>`;
}

function dealInfo() {
  const n = filledNames().length, deck = deckFor(n);
  if (n < 3) return `Dek ${DECKS[deck].label}: ${DECKS[deck].n} kad`;
  const dealt = DECKS[deck].n - 3, cpp = Math.floor(dealt / n), pub = dealt - cpp * n;
  return `${n} detektif · ${cpp} kad seorang${pub ? ` · ${pub} terbuka di meja` : ''}`;
}

function viewSetup() {
  const names = H.names, forced = filledNames().length > 6, deck = deckFor(filledNames().length);
  return `<section class="screen">
    <div class="folder">
      <div class="ftype">FAIL KES NO. 21/BSK</div>
      <span class="stamp">SULIT</span>
      <h1>KES<br>SIAPA?</h1>
      <p><b>Tan Sri Jaafar</b> ditemui mati di Banglo Seri Kenanga. Siapa pembunuhnya, <b>guna apa, dan di mana?</b></p>
      <span class="glass">${ic('kaca')}</span>
    </div>

    <div class="card">
      <div class="card-head"><span class="eyebrow brass">Detektif · ikut susunan duduk</span><span class="pill mute">${names.length} / ${MAX_PLAYERS}</span></div>
      ${names.map((n, i) => `<div class="name-row">
        ${ava((cleanName(n).charAt(0) || String(i + 1)).toUpperCase(), i)}
        <input type="text" value="${esc(n)}" maxlength="14" placeholder="Nama detektif ${i + 1}" data-name="${i}" enterkeyhint="next" autocomplete="off">
        ${names.length > 3 ? `<button class="x-btn" data-a="delName" data-v="${i}" aria-label="Buang">${ic('x')}</button>` : ''}
      </div>`).join('')}
      ${names.length < MAX_PLAYERS ? `<button class="add-btn" data-a="addName">${ic('tambah')} Tambah detektif</button>` : ''}
      <p class="tiny" style="margin-top:10px">Masukkan nama ikut arah jam di meja. Setiap detektif perlu telefon berkamera & internet untuk imbas QR.</p>
    </div>

    <div class="card">
      <div class="card-head"><span class="eyebrow brass">Saiz kes</span></div>
      <div class="seg">
        <button class="${deck === 'k' ? 'on' : ''}" data-a="deck" data-v="k" ${forced ? 'disabled' : ''}>Klasik<small>21 kad · 3–6</small></button>
        <button class="${deck === 'b' ? 'on' : ''}" data-a="deck" data-v="b">Besar<small>27 kad · 3–8</small></button>
      </div>
      <p class="tiny" style="margin-top:10px" id="deal-info">${dealInfo()}</p>
      <p class="tiny">Besar tambah Cik Jambu, Sarjan Kelabu, Botol Racun, Tali Guni, Kolam Renang & Bilik Karaoke. Kes lebih panjang; wajib untuk 7–8 detektif.</p>
    </div>

    <div class="footer">
      <button class="btn btn-brass btn-lg" data-a="deal">${ic('qr')} Agih Kad & Jana QR</button>
      <button class="link" data-a="help" style="align-self:center">${ic('bantuan')} Cara main</button>
    </div>
  </section>`;
}

function viewDeal() {
  const i = H.dealIdx, p = H.players[i], last = i === H.players.length - 1;
  return `<section class="screen">
    <div class="dots">${H.players.map((_, j) => `<span class="dot ${j < i ? 'done' : j === i ? 'now' : ''}"></span>`).join('')}</div>
    <div class="deal-head">
      <div class="eyebrow">Agih kad · ${i + 1} / ${H.players.length}</div>
      <div class="who">${esc(p.name)}, imbas!</div>
      <p class="sub">${H.qrText ? 'QR teks: senarai kad terus keluar, tanpa internet.' : 'Buka kamera → halakan ke QR → tekan link yang muncul.'}</p>
    </div>
    <div class="qr-box">${QR.makeSVG(H.qrText ? textFor(i) : linkFor(i), 260)}</div>
    <p class="tiny qr-note">Orang lain pandang tempat lain dulu ya. Kad kau hanya untuk mata kau.</p>
    <div class="row">
      <button class="btn btn-ghost btn-sm" data-a="share" data-v="${i}">${ic('kongsi')} Hantar link</button>
      <button class="btn btn-ghost btn-sm" data-a="qrText">${ic(H.qrText ? 'qr' : 'buku')} ${H.qrText ? 'QR web' : 'Tiada internet?'}</button>
    </div>
    <div class="footer">
      <button class="btn btn-brass btn-lg" data-a="dealNext">${last ? `${ic('kaca')} Mula Siasatan` : `Seterusnya: ${esc(H.players[i + 1].name)} ${ic('depan')}`}</button>
      ${i > 0 ? `<button class="link" data-a="dealPrev" style="align-self:center">${ic('balik')} Kembali ke ${esc(H.players[i - 1].name)}</button>` : ''}
    </div>
  </section>`;
}

function strip() {
  const tags = hostTags();
  return `<div class="strip">${H.players.map((p, i) => `<button class="chip ${i === H.turn ? 'now' : ''} ${p.elim ? 'out' : ''}" data-a="showQR" data-v="${i}" aria-label="QR ${esc(p.name)}">
    ${ava(tags[i], i)}<span>${esc(p.name)}</span></button>`).join('')}</div>`;
}

function logView() {
  if (!H.logs.length) return '<p class="tiny">Belum ada siasatan. Rekod muncul di sini — salin ke telefon anda dengan butang <b>Catat siasatan</b>.</p>';
  return `<div class="log">${H.logs.map(l => {
    const who = esc(H.players[l.who].name);
    if (l.t === 'acc') return `<div class="log-item acc"><div class="lh"><span>Pus. ${l.round} · Tuduhan</span><span>${who}</span></div>
      <div class="q">${trio(l)}</div><div class="ans"><span class="${l.ok ? 'yes' : 'no'}">${l.ok ? 'TEPAT — kes selesai' : 'SALAH — tersingkir'}</span></div></div>`;
    return `<div class="log-item ${l.by === null ? 'none' : ''}"><div class="lh"><span>Pus. ${l.round} · Siasatan</span><span>${who}</span></div>
      <div class="q">${trio(l)}</div>
      <div class="ans">${l.passed.map(i => `<span class="no">✗ ${esc(H.players[i].name)}</span>`).join('')}
      ${l.by === null ? '<span class="nil">Tiada siapa sangkal</span>' : `<span class="yes">✓ ${esc(H.players[l.by].name)} tunjuk kad</span>`}</div></div>`;
  }).join('')}</div>`;
}

function viewTurn() {
  const p = H.players[H.turn], first = !H.logs.length;
  return `<section class="screen">
    ${strip()}
    <div class="card turn-card">
      <div class="eyebrow brass">Pusingan ${H.round} · ${first ? 'Mula dulu' : 'Giliran'}</div>
      ${ava(hostTags()[H.turn], H.turn, 'lg')}
      <div class="who">${esc(p.name)}</div>
      <p class="sub">${p.lastRoom ? `Siasat bilik lain selain <b>${esc(CARD[p.lastRoom].name)}</b>, atau buat tuduhan jika yakin.` : 'Pilih suspek, senjata & bilik untuk disiasat.'}</p>
      <div class="row">
        <button class="btn btn-brass btn-lg" data-a="startSug">${ic('kaca')} Siasat</button>
      </div>
      <button class="btn btn-line-red btn-sm" style="width:100%;margin-top:8px" data-a="startAcc">${ic('tuduh')} Buat tuduhan muktamad</button>
    </div>
    ${H.pub.length ? `<div class="card"><div class="card-head"><span class="eyebrow">Bukti terbuka di meja</span><span class="tiny">bukan jawapan</span></div>
      <div class="mini-cards">${H.pub.map(id => evi(id)).join('')}</div></div>` : ''}
    <div class="card"><div class="card-head"><span class="eyebrow">Rekod siasatan</span><span class="pill mute">${H.logs.length}</span></div>${logView()}</div>
  </section>`;
}

function viewPick() {
  const p = H.players[H.turn], acc = H.mode === 'acc', pk = H.pick;
  const ready = pk.s && pk.w && pk.r;
  const block = cat => `<div class="sec"><span class="eyebrow brass">${cat.label}</span><span class="tiny">${cat.q}</span></div>
    <div class="tiles">${cat.cards.map(c => {
      const locked = !acc && cat.k === 'r' && p.lastRoom === c.id;
      return `<button class="tile ${pk[cat.k] === c.id ? 'on' : ''}" data-a="pick" data-v="${cat.k}:${c.id}" ${locked ? 'disabled' : ''}>
        ${cardArt(c)}<span>${esc(c.name)}</span>${locked ? '<span class="lock">BILIK TADI</span>' : ''}</button>`;
    }).join('')}</div>`;
  return `<section class="screen">
    <div class="bar">
      <button class="icon-btn" data-a="cancelPick" aria-label="Kembali">${ic('balik')}</button>
      <div class="grow"><div class="eyebrow ${acc ? '' : 'brass'}" style="${acc ? 'color:#ff9e94' : ''}">${acc ? 'Tuduhan muktamad' : 'Siasatan'}</div><div class="title" style="font-size:1.3rem">${esc(p.name)}</div></div>
    </div>
    ${acc ? '<div class="warn">Tuduhan hanya sekali. Jika salah, anda tersingkir (tapi masih perlu tunjuk kad bila ditanya).</div>' : ''}
    <div class="card">${deckCats(H.deck).map(block).join('')}</div>
    <div class="sticky">
      <p class="tiny" style="text-align:center;margin-bottom:8px">${ready ? trio(pk) : 'Pilih satu dari setiap kategori'}</p>
      <button class="btn ${acc ? 'btn-red' : 'btn-brass'} btn-lg" data-a="submitPick" ${ready ? '' : 'disabled'}>${acc ? `${ic('tuduh')} Buka sampul rahsia` : `${ic('kaca')} Umum & semak`}</button>
    </div>
  </section>`;
}

function viewResult() {
  const r = H.res, asker = H.players[H.turn], tags = hostTags();
  const disp = r.by === null ? null : H.players[r.by];
  return `<section class="screen">
    <div class="card">
      <div class="eyebrow">${esc(asker.name)} bertanya</div>
      <div class="mini-cards" style="margin-top:10px">${[r.s, r.w, r.r].map(id => evi(id)).join('')}</div>
    </div>
    <div class="chain">
      ${r.passed.map((i, k) => `<div class="ln no" style="animation-delay:${k * 0.12}s">${ava(tags[i], i)}<span>${esc(H.players[i].name)}</span><span class="st">✗ tiada kad</span></div>`).join('')}
      ${disp ? `<div class="ln yes" style="animation-delay:${r.passed.length * 0.12}s">${ava(tags[r.by], r.by)}<span>${esc(disp.name)}</span><span class="st">✓ ADA BUKTI</span></div>` : ''}
    </div>
    ${disp ? `<div class="callout ok">
        <div class="big">${esc(disp.name)}, tunjuk 1 kad!</div>
        <p class="sub">Buka telefon kau, ketik <b>satu</b> kad yang sepadan, tunjuk kepada <b>${esc(asker.name)}</b> sahaja secara rahsia.</p>
      </div>`
    : `<div class="callout gold">
        <div class="big">Tiada siapa boleh sangkal!</div>
        <p class="sub">Tiada detektif lain pegang kad ini. Sama ada ia jawapan… atau ${esc(asker.name)} sendiri yang pegang.</p>
      </div>`}
    <p class="tiny" style="text-align:center">Semua: tekan <b>Catat siasatan</b> di telefon masing-masing untuk rekod giliran ini.</p>
    <div class="footer">
      <button class="btn btn-brass btn-lg" data-a="endTurn">${disp ? 'Dah tunjuk — tamat giliran' : 'Tamat giliran'} ${ic('depan')}</button>
      <button class="btn btn-line-red btn-sm" style="width:100%" data-a="startAccFromResult">${ic('tuduh')} ${esc(asker.name)} nak tuduh sekarang</button>
    </div>
  </section>`;
}

function viewWrong() {
  const p = H.players[H.turn];
  return `<section class="screen">
    <div class="verdict"><span class="big-stamp red">SALAH!</span>
      <div class="title">${esc(p.name)} tersingkir</div>
      <p class="sub" style="margin-top:6px">Tuduhan tidak tepat. ${esc(p.name)} tiada giliran lagi, tetapi <b>masih perlu tunjuk kad</b> bila disiasat. Jangan bocorkan apa-apa!</p>
    </div>
    <div class="card"><div class="eyebrow">Tuduhan tadi</div><div class="mini-cards" style="margin-top:10px">${[H.pick.s, H.pick.w, H.pick.r].map(id => evi(id)).join('')}</div></div>
    <div class="footer"><button class="btn btn-brass btn-lg" data-a="endTurn">Teruskan siasatan ${ic('depan')}</button></div>
  </section>`;
}

function viewOver() {
  const w = H.players[H.win], sugs = H.logs.filter(l => l.t === 'sug').length;
  return `<section class="screen">
    <div class="verdict"><span class="big-stamp ok">KES SELESAI</span>
      <div class="title">${ic('piala')} ${esc(w.name)} menang!</div>
      <p class="sub" style="margin-top:6px">${esc(H.why)}</p>
    </div>
    <div class="card"><div class="eyebrow brass">${ic('sampul')} Isi sampul rahsia</div>
      <div class="mini-cards reveal" style="margin-top:10px">${[H.vault.s, H.vault.w, H.vault.r].map(id => evi(id)).join('')}</div>
      <p class="sub" style="text-align:center;margin-top:12px"><b>${esc(CARD[H.vault.s].name)}</b> membunuh Tan Sri Jaafar dengan <b>${esc(CARD[H.vault.w].name)}</b> di <b>${esc(CARD[H.vault.r].name)}</b>.</p>
    </div>
    <div class="stats"><div class="stat"><b>${H.round}</b><span class="tiny">pusingan</span></div><div class="stat"><b>${sugs}</b><span class="tiny">siasatan</span></div></div>
    <div class="footer">
      <button class="btn btn-brass btn-lg" data-a="again">${ic('ulang')} Main lagi (detektif sama)</button>
      <button class="btn btn-ghost" data-a="toSetup">${ic('rumah')} Tukar detektif</button>
    </div>
  </section>`;
}

// ---------- Modal meja ----------
function modalHost() {
  const m = ui.modal;
  if (!m) return '';
  if (m.t === 'help') return helpSheet();
  if (m.t === 'menu') return `<div class="overlay" data-a="close"><div class="sheet">
    <div class="card-head" style="margin:0"><span class="title" style="font-size:1.3rem">Menu meja</span><button class="icon-btn" data-a="close">${ic('x')}</button></div>
    <p class="tiny">Ketik nama pemain di bahagian atas skrin untuk paparkan semula QR mereka.</p>
    ${H.hist && H.hist.length ? `<button class="menu-item" data-a="undo">${ic('undo')} Batal langkah terakhir (tersilap tekan)</button>` : ''}
    <button class="menu-item" data-a="again">${ic('ulang')} Kocok semula — kes baru, detektif sama</button>
    <button class="menu-item danger" data-a="toSetup">${ic('buang')} Tamatkan kes & tukar detektif</button>
  </div></div>`;
  if (m.t === 'qr') {
    const i = m.i, p = H.players[i];
    return `<div class="overlay" data-a="close"><div class="sheet center">
      <div class="card-head" style="margin:0"><span class="title" style="font-size:1.3rem">QR ${esc(p.name)}</span><button class="icon-btn" data-a="close">${ic('x')}</button></div>
      <p class="sub">Untuk ${esc(p.name)} sahaja — jika telefon tertutup atau tab hilang. Nota lama kekal.</p>
      <div class="qr-box">${QR.makeSVG(H.qrText ? textFor(i) : linkFor(i), 260)}</div>
      <div class="row">
        <button class="btn btn-ghost btn-sm" data-a="share" data-v="${i}">${ic('kongsi')} Hantar link</button>
        <button class="btn btn-ghost btn-sm" data-a="qrText">${H.qrText ? 'QR web' : 'QR teks'}</button>
      </div>
    </div></div>`;
  }
  if (m.t === 'confirmAcc') {
    const pk = H.pick;
    return `<div class="overlay full" data-a="close"><div class="sheet center">
      <span class="eyebrow" style="color:#ff9e94;justify-content:center">Tuduhan muktamad · ${esc(H.players[H.turn].name)}</span>
      <div class="mini-cards">${[pk.s, pk.w, pk.r].map(id => evi(id)).join('')}</div>
      <p class="sub">Pasti? Jika salah, anda tersingkir dari giliran.</p>
      <div class="row"><button class="btn btn-ghost" data-a="close">Batal</button><button class="btn btn-red" data-a="doAcc">${ic('sampul')} Buka sampul</button></div>
    </div></div>`;
  }
  return '';
}

function helpSheet() {
  return `<div class="overlay" data-a="close"><div class="sheet">
    <div class="card-head" style="margin:0"><span class="title" style="font-size:1.3rem">Cara main</span><button class="icon-btn" data-a="close">${ic('x')}</button></div>
    <div>
      <div class="step"><span class="n">1</span><div><b>Agih kad</b><p class="tiny">Satu telefon di tengah meja (3–8 detektif). Setiap detektif imbas QR sendiri untuk dapat kad tangan & buku nota. 3 kad (suspek, senjata, bilik) disorok dalam sampul rahsia.</p></div></div>
      <div class="step"><span class="n">2</span><div><b>Siasat</b><p class="tiny">Pada giliran, pilih suspek + senjata + bilik di telefon meja. Bilik mesti berbeza dari siasatan anda yang lepas.</p></div></div>
      <div class="step"><span class="n">3</span><div><b>Sangkal</b><p class="tiny">Telefon meja semak ikut arah jam siapa pegang salah satu kad itu. Detektif pertama yang ada mesti tunjuk <b>satu</b> kad dari telefonnya kepada penanya sahaja.</p></div></div>
      <div class="step"><span class="n">4</span><div><b>Catat</b><p class="tiny">Di telefon anda tekan <b>Catat siasatan</b>: pilih siapa tanya, 3 kad, dan siapa tunjuk. Buku nota terus tanda ✗ untuk yang tiada kad dan buat deduksi automatik. Boleh juga ketik petak sendiri: ✓ ada, ✗ tiada, ? syak.</p></div></div>
      <div class="step"><span class="n">5</span><div><b>Tuduh</b><p class="tiny">Yakin? Buat tuduhan muktamad pada giliran anda (boleh terus selepas siasatan). Tepat = menang. Salah = tersingkir, tapi masih kena tunjuk kad.</p></div></div>
    </div>
    <p class="tiny">Tersilap tekan di telefon meja? Butang ${ic('undo')} di atas membatalkan langkah terakhir. Bukti terbuka di meja ialah baki kad yang tak cukup untuk dibahagi sama rata — semua tahu ia bukan jawapan.</p>
  </div></div>`;
}

function renderHost(scrollTop) {
  const views = { setup: viewSetup, deal: viewDeal, turn: viewTurn, pick: viewPick, result: viewResult, wrong: viewWrong, over: viewOver };
  $('#app').innerHTML = (H.phase === 'pick' ? '' : hostBar()) + (views[H.phase] || viewSetup)();
  $('#modal').innerHTML = modalHost();
  if (scrollTop) scrollTo(0, 0);
  saveHost();
}

function hostAction(a, v) {
  switch (a) {
    case 'help': ui.modal = { t: 'help' }; break;
    case 'menu': ui.modal = { t: 'menu' }; break;
    case 'close': ui.modal = null; break;
    case 'undo': return undo();
    case 'addName': if (H.names.length < MAX_PLAYERS) H.names.push(''); render(); setTimeout(() => { const ins = document.querySelectorAll('[data-name]'); ins[ins.length - 1]?.focus(); }, 30); return;
    case 'delName': H.names.splice(+v, 1); break;
    case 'deck': H.deckPick = v; break;
    case 'deal': return deal(H.names);
    case 'again': return deal(H.players.length ? H.players.map(p => p.name) : H.names);
    case 'toSetup': H = freshHost(H.players.length ? H.players.map(p => p.name) : H.names, H.deckPick); ui.modal = null; return render(true);
    case 'dealNext':
      if (H.dealIdx < H.players.length - 1) { H.dealIdx++; buzz(15); return render(true); }
      H.phase = 'turn'; buzz([30, 40, 30]); return render(true);
    case 'dealPrev': H.dealIdx = Math.max(0, H.dealIdx - 1); break;
    case 'qrText': H.qrText = !H.qrText; break;
    case 'share': shareLink(+v); return;
    case 'showQR': ui.modal = { t: 'qr', i: +v }; break;
    case 'startSug': return startPick('sug', 'turn');
    case 'startAcc': return startPick('acc', 'turn');
    case 'startAccFromResult': return startPick('acc', 'result');
    case 'pick': { const [k, id] = v.split(':'); H.pick[k] = H.pick[k] === id ? null : id; buzz(8); break; }
    case 'cancelPick': H.phase = H.from === 'result' && H.res ? 'result' : 'turn'; return render(true);
    case 'submitPick':
      if (!(H.pick.s && H.pick.w && H.pick.r)) return;
      if (H.mode === 'sug') return submitSuggestion();
      ui.modal = { t: 'confirmAcc' }; break;
    case 'doAcc': return submitAccusation();
    case 'endTurn': return endTurn();
    default: return;
  }
  render();
}

// =====================================================================
// TELEFON PEMAIN (BUKU NOTA)
// =====================================================================
let P = null;

function loadPlayer(code) {
  const d = decodeCode(code);
  if (!d) { P = { bad: true }; return; }
  const saved = store.get(NOTE_KEY + code) || {};
  P = { ...d, code, marks: saved.marks || {}, log: saved.log || [], hide: !!saved.hide, zoom: null };
}
const savePlayer = () => store.set(NOTE_KEY + P.code, { marks: P.marks, log: P.log, hide: P.hide });
const pname = i => (i === P.me ? 'Saya' : P.names[i]);

// Pemain yang "tiada kad": ikut arah jam selepas penanya, sehingga orang yang tunjuk (by < 0 = tiada siapa).
function passersOf(r) {
  const n = P.names.length, out = [];
  for (let i = 1; i < n; i++) { const idx = (r.a + i) % n; if (idx === r.by) break; out.push(idx); }
  return out;
}

// Deduksi: fakta tetap (kad sendiri, kad meja) + tanda manual + rekod siasatan → isi petak yang pasti, cari jawapan sampul.
function deduce() {
  const all = deckAll(P.deck), cats = deckCats(P.deck);
  const others = P.names.map((_, i) => i).filter(i => i !== P.me);
  const own = id => P.hand.includes(id) || P.pub.includes(id);
  const E = {};
  all.forEach(c => {
    E[c.id] = {};
    others.forEach(p => {
      const m = (P.marks[c.id] || {})[p] || '';
      E[c.id][p] = own(c.id) ? { v: 'n', how: 'fix' } : { v: m, how: m ? 'me' : '' };
    });
  });
  const isY = x => x.v === 'y', isN = x => x.v === 'n', unk = x => !isY(x) && !isN(x);
  const set = (x, v) => { if (x && unk(x)) { x.v = v; x.how = 'auto'; return true; } return false; };

  // Rekod siasatan: yang lepas = tiada ketiga-tiga kad; yang tunjuk = ada sekurang-kurangnya satu.
  const cons = [];
  P.log.forEach(r => {
    const cards = [r.s, r.w, r.r].filter(id => E[id]);
    passersOf(r).forEach(p => { if (p !== P.me) cards.forEach(id => set(E[id][p], 'n')); });
    if (r.by < 0 || r.by === P.me) return;
    if (r.a === P.me && r.seen && E[r.seen]) set(E[r.seen][r.by], 'y');
    else cons.push({ p: r.by, cards });
  });

  const heldBy = id => own(id) || others.some(p => isY(E[id][p]));
  let changed = true, guard = 0;
  while (changed && guard++ < 40) {
    changed = false;
    // Satu kad hanya ada satu pemilik.
    all.forEach(c => { const row = others.map(p => E[c.id][p]); if (row.some(isY)) row.forEach(x => { changed = set(x, 'n') || changed; }); });
    // Bilangan kad setiap pemain diketahui.
    others.forEach(p => {
      const col = all.map(c => E[c.id][p]), y = col.filter(isY).length, u = col.filter(unk);
      if (!u.length) return;
      if (y >= P.cpp) u.forEach(x => { changed = set(x, 'n') || changed; });
      else if (y + u.length === P.cpp) u.forEach(x => { changed = set(x, 'y') || changed; });
    });
    // Orang yang tunjuk kad: jika hanya satu daripada 3 kad masih mungkin, itulah kadnya.
    cons.forEach(k => {
      const cells = k.cards.map(id => E[id][k.p]);
      if (cells.some(isY)) return;
      const open = cells.filter(x => !isN(x));
      if (open.length === 1) changed = set(open[0], 'y') || changed;
    });
    // Jika semua kad lain dalam kategori sudah ada pemilik, baki itu dalam sampul.
    cats.forEach(cat => {
      const free = cat.cards.filter(c => !heldBy(c.id));
      if (free.length === 1) others.forEach(p => { changed = set(E[free[0].id][p], 'n') || changed; });
    });
  }

  const sol = {}, left = {};
  let conflict = cons.some(k => k.cards.every(id => isN(E[id][k.p])));
  cats.forEach(cat => {
    const free = cat.cards.filter(c => !heldBy(c.id));
    left[cat.k] = free.length;
    if (!free.length) conflict = true;
    const env = free.filter(c => others.every(p => isN(E[c.id][p])));
    if (env.length > 1) conflict = true;
    sol[cat.k] = env.length === 1 ? env[0].id : (free.length === 1 ? free[0].id : null);
  });
  all.forEach(c => { if (others.filter(p => isY(E[c.id][p])).length > (own(c.id) ? 0 : 1)) conflict = true; });
  others.forEach(p => { if (all.filter(c => isY(E[c.id][p])).length > P.cpp) conflict = true; });
  return { E, others, cats, heldBy, sol, left, conflict };
}

function recLine(r) {
  const passed = passersOf(r).map(i => esc(pname(i)));
  const shown = r.by < 0 ? '<span class="nil">tiada siapa sangkal</span>'
    : `<span class="yes">✓ ${esc(pname(r.by))}${r.seen ? ` — ${esc(CARD[r.seen].name)}` : ''}</span>`;
  return `<div class="q">${esc(pname(r.a))}: ${trio(r)}</div>
    <div class="ans">${passed.map(n => `<span class="no">✗ ${n}</span>`).join('')}${shown}</div>`;
}

function viewPlayer() {
  if (P.bad) return `<section class="screen" style="justify-content:center;text-align:center">
    <span class="mark" style="margin:0 auto">${ic('kaca')}</span>
    <div class="title">Link tidak sah</div>
    <p class="sub">Imbas semula QR anda di telefon meja.</p></section>`;
  const D = deduce(), me = P.names[P.me], tags = tagsOf(P.names), many = D.others.length > 4;
  const slot = cat => {
    const id = D.sol[cat.k];
    return id ? `<div class="slot solved">${cardArt(CARD[id])}<span class="v">${esc(CARD[id].name)}</span><span class="k">${cat.label}</span></div>`
      : `<div class="slot"><span class="n">${D.left[cat.k]}</span><span class="k">${cat.label}</span><span class="tiny">calon tinggal</span></div>`;
  };
  const head = D.others.map(p => `<th>${ava(tags[p], p)}<span class="nm">${esc(P.names[p].slice(0, 6))}</span></th>`).join('');
  const rows = D.cats.map(cat => `<tr class="grp"><td colspan="${D.others.length + 1}">${cat.label}</td></tr>` + cat.cards.map(c => {
    const mine = P.hand.includes(c.id), pub = P.pub.includes(c.id), envRow = D.sol[c.k] === c.id;
    const cls = [mine ? 'mine' : '', pub ? 'pub' : '', D.heldBy(c.id) ? 'held' : '', envRow ? 'env' : ''].join(' ');
    const cells = D.others.map(p => {
      const x = D.E[c.id][p], sym = x.v === 'y' ? '✓' : x.v === 'n' ? '✗' : x.v === 'q' ? '?' : '';
      const fix = x.how === 'fix';
      return `<td class="c"><button class="cell ${x.v} ${x.how === 'auto' ? 'auto' : ''} ${fix ? 'fix' : ''}" ${fix ? 'disabled' : `data-a="mark" data-v="${c.id}:${p}"`} aria-label="${esc(c.name)} — ${esc(P.names[p])}"><span class="m">${sym}</span></button></td>`;
    }).join('');
    return `<tr class="${cls}"><td class="cn"><span>${cardArt(c)}<em>${esc(c.name)}</em></span></td>${cells}</tr>`;
  }).join('')).join('');
  const solved = D.sol.s && D.sol.w && D.sol.r;

  return `<section class="screen">
    <header class="bar">
      <div class="brand"><span class="mark">${ic('kaca')}</span><div><b>${esc(me)}</b><small>FAIL DETEKTIF · RAHSIA</small></div></div>
      <div class="bar-act"><button class="icon-btn" data-a="help" aria-label="Cara main">${ic('bantuan')}</button></div>
    </header>

    <div class="card">
      <div class="card-head"><span class="eyebrow brass">Kad di tangan (${P.hand.length})</span>
        <button class="link" data-a="hide">${ic(P.hide ? 'mata' : 'tutupmata')} ${P.hide ? 'Tunjuk' : 'Sorok'}</button></div>
      <div class="hand ${P.hide ? 'blur' : ''}">${P.hand.map(id => evi(id, `data-a="zoom" data-v="${id}"`)).join('')}</div>
      <p class="tiny" style="margin-top:10px">Kena sangkal? Ketik <b>satu</b> kad yang sepadan untuk paparkan besar, tunjuk kepada penanya sahaja.</p>
    </div>

    ${P.pub.length ? `<div class="card"><div class="card-head"><span class="eyebrow">Bukti terbuka di meja</span></div><div class="mini-cards">${P.pub.map(id => evi(id)).join('')}</div></div>` : ''}

    <div class="card">
      <div class="card-head"><span class="eyebrow brass">${ic('sampul')} Sampul rahsia</span>${solved ? '<span class="pill ok">Sedia tuduh!</span>' : ''}</div>
      <div class="case">${D.cats.map(slot).join('')}</div>
      ${D.conflict ? '<div class="warn" style="margin-top:10px">Ada catatan yang bercanggah. Semak rekod atau tanda manual anda.</div>' : ''}
    </div>

    <button class="btn btn-brass btn-lg" data-a="recOpen">${ic('pensel')} Catat siasatan</button>

    <div class="card">
      <div class="card-head"><span class="eyebrow brass">Buku nota</span><button class="link" data-a="resetNotes">${ic('ulang')} Kosongkan</button></div>
      <table class="nb ${many ? 'many' : ''}"><thead><tr><th class="cn">Kad</th>${head}</tr></thead><tbody>${rows}</tbody></table>
      <div class="legend" style="margin-top:10px">
        <span><i style="background:rgba(76,191,134,.2);color:var(--ok)">✓</i>ada</span>
        <span><i style="color:var(--dim)">✗</i>tiada</span>
        <span><i style="background:rgba(224,178,90,.16);color:var(--brass)">?</i>syak</span>
        <span><i style="opacity:.55;color:var(--ok)">✓</i>deduksi auto</span>
      </div>
      <p class="tiny" style="margin-top:8px">Ketik petak untuk tukar. Garis hijau = kad anda, garis biru = kad meja. Baris emas = jawapan sampul.</p>
    </div>

    ${P.log.length ? `<div class="card"><div class="card-head"><span class="eyebrow">Rekod saya</span><span class="pill mute">${P.log.length}</span></div>
      <div class="log">${P.log.map((r, i) => `<div class="log-item rec ${r.by < 0 ? 'none' : ''}">${recLine(r)}<button class="x-btn sm" data-a="recDel" data-v="${i}" aria-label="Padam rekod">${ic('x')}</button></div>`).join('')}</div></div>` : ''}
  </section>`;
}

// Borang "Catat siasatan": 1 siapa tanya · 2 tiga kad · 3 siapa tunjuk · 4 (jika saya penanya) kad yang saya nampak.
function recSheet() {
  const R = ui.rec, n = P.names.length, tags = tagsOf(P.names);
  const chip = (i, on, v) => `<button class="chip ${on ? 'now' : ''}" data-a="rec" data-v="${v}">${ava(tags[i], i)}<span>${esc(pname(i))}</span></button>`;
  const askers = P.names.map((_, i) => chip(i, R.a === i, `a:${i}`)).join('');
  const block = cat => `<div class="sec"><span class="eyebrow">${cat.label}</span></div><div class="tiles sm">${cat.cards.map(c =>
    `<button class="tile ${R[cat.k] === c.id ? 'on' : ''}" data-a="rec" data-v="${cat.k}:${c.id}">${cardArt(c)}<span>${esc(c.name)}</span></button>`).join('')}</div>`;
  let shows = '';
  if (R.a !== null) {
    const order = []; for (let i = 1; i < n; i++) order.push((R.a + i) % n);
    shows = order.map(i => chip(i, R.by === i, `by:${i}`)).join('') +
      `<button class="chip ${R.by === -1 ? 'now' : ''}" data-a="rec" data-v="by:-1"><span>Tiada siapa</span></button>`;
  }
  const needSeen = R.a === P.me && R.by >= 0;
  const cards = [R.s, R.w, R.r].filter(Boolean);
  const ready = R.a !== null && R.s && R.w && R.r && R.by !== undefined && (!needSeen || R.seen);
  const preview = ready ? `<div class="log-item ${R.by < 0 ? 'none' : ''}">${recLine(R)}</div>` : '';
  return `<div class="overlay" data-a="close"><div class="sheet">
    <div class="card-head" style="margin:0"><span class="title" style="font-size:1.3rem">Catat siasatan</span><button class="icon-btn" data-a="close">${ic('x')}</button></div>
    <p class="tiny">Salin dari rekod di telefon meja. Yang “tiada kad” ditanda ✗ automatik.</p>
    <div><span class="eyebrow brass">1 · Siapa bertanya?</span><div class="chips">${askers}</div></div>
    <div><span class="eyebrow brass">2 · Kad yang ditanya</span>${deckCats(P.deck).map(block).join('')}</div>
    ${R.a !== null ? `<div><span class="eyebrow brass">3 · Siapa tunjuk kad?</span><div class="chips">${shows}</div></div>` : ''}
    ${needSeen ? `<div><span class="eyebrow brass">4 · Kad yang ditunjuk kepada anda</span>
      <div class="tiles">${cards.map(id => `<button class="tile ${R.seen === id ? 'on' : ''}" data-a="rec" data-v="seen:${id}">${cardArt(CARD[id])}<span>${esc(CARD[id].name)}</span></button>`).join('')}</div></div>` : ''}
    ${preview}
    <button class="btn btn-brass btn-lg" data-a="recSave" ${ready ? '' : 'disabled'}>${ic('betul')} Simpan ke buku nota</button>
  </div></div>`;
}

function modalPlayer() {
  if (P.zoom) return `<div class="overlay full" data-a="close"><div class="zoom">
    <span class="eyebrow brass">Bukti daripada ${esc(P.names[P.me])}</span>
    <div class="evi ${CARD[P.zoom].k}">${cardArt(CARD[P.zoom], true)}<span>${esc(CARD[P.zoom].name)}</span><small>${CAT_LABEL[CARD[P.zoom].k]}</small></div>
    <button class="btn btn-ghost btn-sm" data-a="close">${ic('tutupmata')} Sorok semula</button></div></div>`;
  if (ui.modal && ui.modal.t === 'help') return helpSheet();
  if (ui.modal && ui.modal.t === 'rec') return recSheet();
  return '';
}

function renderPlayer() {
  const sheet = $('#modal .sheet'), keep = sheet ? sheet.scrollTop : 0;
  $('#app').innerHTML = viewPlayer();
  $('#modal').innerHTML = P.bad ? '' : modalPlayer();
  const s2 = $('#modal .sheet'); if (s2 && keep) s2.scrollTop = keep;
  if (!P.bad) savePlayer();
}

function playerAction(a, v) {
  switch (a) {
    case 'help': ui.modal = { t: 'help' }; break;
    case 'close': P.zoom = null; ui.modal = null; break;
    case 'zoom': P.zoom = v; buzz(20); break;
    case 'hide': P.hide = !P.hide; break;
    case 'mark': {
      const [id, p] = v.split(':'), row = P.marks[id] || (P.marks[id] = {});
      const nxt = { '': 'y', y: 'n', n: 'q', q: '' }[row[p] || ''];
      if (nxt) row[p] = nxt; else delete row[p];
      buzz(8); break;
    }
    case 'recOpen': ui.rec = { a: null, s: null, w: null, r: null, by: undefined, seen: null }; ui.modal = { t: 'rec' }; break;
    case 'rec': {
      const R = ui.rec, [k, x] = v.split(':');
      if (k === 'a') { R.a = +x; R.by = undefined; R.seen = null; }
      else if (k === 'by') { R.by = +x; R.seen = null; }
      else if (k === 'seen') R.seen = x;
      else { R[k] = R[k] === x ? null : x; if (R.seen && ![R.s, R.w, R.r].includes(R.seen)) R.seen = null; }
      buzz(8); break;
    }
    case 'recSave': {
      const R = ui.rec;
      P.log.unshift({ a: R.a, s: R.s, w: R.w, r: R.r, by: R.by, seen: R.a === P.me && R.by >= 0 ? R.seen : null });
      ui.modal = null; ui.rec = null; toast('Siasatan dicatat'); buzz(20); break;
    }
    case 'recDel': if (confirm('Padam rekod ini?')) P.log.splice(+v, 1); break;
    case 'resetNotes': if (confirm('Kosongkan semua tanda & rekod dalam buku nota?')) { P.marks = {}; P.log = []; } break;
    default: return;
  }
  render();
}

// =====================================================================
// PENGHALA
// =====================================================================
const mode = () => (/[#&]c=/.test(location.hash) ? 'player' : 'host');
function boot() {
  ui.modal = null;
  if (mode() === 'player') { loadPlayer(location.hash.match(/[#&]c=([^&]+)/)[1]); document.title = P.bad ? 'Kes Siapa?' : `Kad ${P.names[P.me]} · Kes Siapa?`; }
  else { P = null; H = H || loadHost(); document.title = 'Kes Siapa?'; }
  render(true);
}
function render(top) { return P ? renderPlayer() : renderHost(top); }

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  // Klik pada latar modal sahaja yang menutup; klik dalam kotak modal diabaikan.
  if (el.classList.contains('overlay') && e.target !== el) return;
  (P ? playerAction : hostAction)(el.dataset.a, el.dataset.v);
});
document.addEventListener('input', e => {
  const i = e.target.dataset && e.target.dataset.name;
  if (i === undefined || !H) return;
  H.names[+i] = e.target.value;
  const a = e.target.parentElement.querySelector('.ava');
  if (a) a.textContent = (cleanName(e.target.value).charAt(0) || String(+i + 1)).toUpperCase();
  // Saiz kes bergantung pada bilangan nama: lukis semula kad tetapan tanpa ganggu fokus input.
  const info = $('#deal-info'); if (info) info.textContent = dealInfo();
  const n = filledNames().length, seg = document.querySelectorAll('.seg button');
  if (seg.length === 2) { const d = deckFor(n); seg[0].disabled = n > 6; seg[0].classList.toggle('on', d === 'k'); seg[1].classList.toggle('on', d === 'b'); }
  saveHost();
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target.dataset || e.target.dataset.name === undefined) return;
  const ins = [...document.querySelectorAll('[data-name]')], k = ins.indexOf(e.target);
  if (ins[k + 1]) ins[k + 1].focus(); else e.target.blur();
});
addEventListener('hashchange', boot);
boot();
