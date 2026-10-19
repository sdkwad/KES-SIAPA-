'use strict';
/* KES SIAPA? — Cluedo edisi Malaysia.
   Telefon meja: urus giliran, semak siapa boleh sangkal, simpan rekod siasatan.
   Telefon pemain: imbas QR → kad tangan + buku nota grid. Tiada server: semua data pemain ada dalam link (#c=...). */

// Alamat awam. Bila telefon meja buka fail/localhost, QR tetap halakan kawan ke sini.
const PUBLIC_URL = 'https://kessiapa.vercel.app/';
const HOST_KEY = 'kessiapa_meja_v2';
const NOTE_KEY = 'kessiapa_nota_';

// ================= KAD =================
const SUSPECTS = [
  { id: 's1', name: 'Datin Mawar', tag: 'DM', col: '#e2554a', role: 'Sosialit, tuan rumah' },
  { id: 's2', name: 'Kapten Kunyit', tag: 'KK', col: '#e8b23a', role: 'Bekas tentera, panas baran' },
  { id: 's3', name: 'Mak Cik Melur', tag: 'MM', col: '#ece6d6', role: 'Tukang masak 30 tahun' },
  { id: 's4', name: 'Encik Pandan', tag: 'EP', col: '#4cbf86', role: 'Peguam keluarga' },
  { id: 's5', name: 'Puan Merak', tag: 'PM', col: '#4a90e2', role: 'Penyanyi kelab malam' },
  { id: 's6', name: 'Prof. Terung', tag: 'PT', col: '#a274e0', role: 'Pensyarah sejarah' }
];
const WEAPONS = [
  { id: 'w1', name: 'Keris', icon: 'keris' },
  { id: 'w2', name: 'Parang', icon: 'parang' },
  { id: 'w3', name: 'Lesung Batu', icon: 'lesung' },
  { id: 'w4', name: 'Rotan', icon: 'rotan' },
  { id: 'w5', name: 'Kuali Besi', icon: 'kuali' },
  { id: 'w6', name: 'Senapang Patah', icon: 'senapang' }
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
  { id: 'r9', name: 'Loteng', icon: 'loteng' }
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
const PCOLORS = ['#e0b25a', '#5aa9e6', '#4cbf86', '#ef6f62', '#b98be6', '#f08a3c'];

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
  rumah: '<path d="M3 11l9-8 9 8M5 9.5V21h14V9.5"/>',
  buang: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  // Senjata
  keris: '<path d="M12 2l1.4 2.5-1 2 1 2.2-1 2.2 1 2.1h-2.8l1-2.1-1-2.2 1-2.2-1-2z"/><path d="M8 13h8M12 13v3.5M10.6 16.5h2.8l-.4 5h-2z"/>',
  parang: '<path d="M6.5 15.5L18.5 3.5c1.7 2.3 1.6 6.3-1.2 9.2L10 18.5z"/><path d="M8.2 17.2L4 21.4M3 20.4l1.6-1.6"/>',
  lesung: '<path d="M3.5 12h17a8.5 7 0 01-17 0z"/><path d="M8 21h8M13.5 12l5-9.2 1.8 1-4 8.2"/>',
  rotan: '<path d="M7.5 21.5L16 6.2a3 3 0 015.2 2.8"/><path d="M10 17.2l1.6.9M12.4 12.8l1.6.9"/>',
  kuali: '<path d="M3 11h18a9 6.5 0 01-18 0z"/><path d="M1 11h2M21 11h2M9 7.5c0-1.4 1-1.9 1-3.3M13.5 7.5c0-1.4 1-1.9 1-3.3"/>',
  senapang: '<path d="M2 9.5h15l2-2h3v4.5l-9 1-2 4H7.5l1-3.2H2z"/><path d="M11 12.8v2.2"/>',
  // Bilik
  anjung: '<path d="M2.5 10.5L12 4l9.5 6.5"/><path d="M5 10v7M19 10v7M3 17h18M8 21h8M9.5 17v4M14.5 17v4"/>',
  sofa: '<path d="M5 11V8a2 2 0 012-2h10a2 2 0 012 2v3"/><path d="M3 13a2 2 0 014 0v2h10v-2a2 2 0 014 0v5H3z"/><path d="M5 18v2M19 18v2"/>',
  makan: '<circle cx="12.5" cy="12" r="5.5"/><circle cx="12.5" cy="12" r="2.5"/><path d="M3 4v5a1.5 1.5 0 003 0V4M4.5 10.5V20M21.5 4c-1.8 0-2.3 3-2.3 6h2.3v10"/>',
  api: '<path d="M12 21.5c-4 0-6.5-2.6-6.5-6 0-3.8 3.2-5.4 3.8-9.5 2 1.5 3.2 3.2 3.2 5.2 1-1 1.6-2.1 1.6-3.2 2.2 1.6 4.4 4.3 4.4 7.5 0 3.4-2.5 6-6.5 6z"/>',
  buku: '<path d="M2 5h6a4 4 0 014 4v12a3 3 0 00-3-3H2zM22 5h-6a4 4 0 00-4 4v12a3 3 0 013-3h7z"/>',
  katil: '<path d="M3 6v14M3 16h18v4M21 16v-3a3 3 0 00-3-3h-8v6"/><circle cx="6.5" cy="12" r="1.8"/>',
  bunga: '<circle cx="12" cy="6" r="3"/><circle cx="7.6" cy="9.6" r="3"/><circle cx="16.4" cy="9.6" r="3"/><path d="M12 12v9.5M12 18c-2.5 0-4-1.5-4.5-3.5M12 16.5c2 0 3.5-1 4-3"/>',
  kereta: '<path d="M3 16.5v-4.5l2.2-5h13.6l2.2 5v4.5z"/><path d="M3 12h18"/><circle cx="7" cy="16.5" r="2"/><circle cx="17" cy="16.5" r="2"/>',
  loteng: '<path d="M2 12l10-9 10 9"/><path d="M5 10v11h14V10M10 21v-5h4v5"/><circle cx="12" cy="10.5" r="1.6"/>'
};

// ================= ALAT BANTU =================
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const shuffle = a => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const byOrder = (a, b) => ORDER[a] - ORDER[b];
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* tiada getaran */ } };
const initial = name => esc((name || '?').trim().charAt(0).toUpperCase());
const ava = (name, i, cls = '') => `<span class="ava ${cls}" style="--c:${PCOLORS[i % PCOLORS.length]}">${initial(name)}</span>`;
const cardArt = (c, big = false) => c.k === 's'
  ? `<span class="tok${big ? ' big' : ''}" style="--c:${c.col}">${c.tag}</span>`
  : `<span class="art art-${c.k}${big ? ' big' : ''}">${ic(c.icon)}</span>`;
const evi = (id, attrs = '') => { const c = CARD[id]; const tag = attrs ? 'button' : 'div';
  return `<${tag} class="evi ${c.k}" ${attrs}>${cardArt(c)}<span>${esc(c.name)}</span><small>${CAT_LABEL[c.k]}</small></${tag}>`; };

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
// Format: 2|indeksSaya|kadSeorang|nama~nama~...|kadTangan|kadMeja, XOR ringkas supaya tak boleh dibaca terus, base64url.
const XKEY = [107, 101, 115, 115, 105, 97, 112, 97];
function encodeCode(o) {
  const raw = ['2', o.me, o.cpp, o.names.join('~'), o.hand.join(''), o.pub.join('')].join('|');
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
    const [v, me, cpp, names, hand, pub] = new TextDecoder().decode(bytes).split('|');
    if (v !== '2') return null;
    const ids = s => (String(s || '').match(/[swr]\d/g) || []).filter(id => CARD[id]);
    const o = { me: +me, cpp: +cpp, names: names.split('~'), hand: ids(hand), pub: ids(pub) };
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
const ui = { modal: null };

function freshHost(names) {
  return { phase: 'setup', names: names || ['', '', '', ''], players: [], pub: [], vault: null, cpp: 0,
    start: 0, turn: 0, round: 1, dealIdx: 0, qrText: false, mode: 'sug', from: 'turn',
    pick: { s: null, w: null, r: null }, res: null, logs: [], win: null, why: '' };
}
function saveHost() { store.set(HOST_KEY, H); }
function loadHost() { const o = store.get(HOST_KEY); return o && o.phase ? o : freshHost(); }

const cleanName = n => String(n || '').replace(/[|~]/g, '').trim().slice(0, 14);
const codeFor = i => encodeCode({ me: i, cpp: H.cpp, names: H.players.map(p => p.name), hand: H.players[i].hand, pub: H.pub });
const linkFor = i => `${baseUrl()}#c=${codeFor(i)}`;
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
  if (names.length > 6) return toast('Maksimum 6 detektif');
  if (new Set(names.map(n => n.toLowerCase())).size !== names.length) return toast('Nama setiap detektif mesti berbeza');
  const vault = { s: shuffle(SUSPECTS)[0].id, w: shuffle(WEAPONS)[0].id, r: shuffle(ROOMS)[0].id };
  const rest = shuffle(ALL.map(c => c.id).filter(id => !Object.values(vault).includes(id)));
  const cpp = Math.floor(rest.length / names.length);
  const start = Math.floor(Math.random() * names.length);
  Object.assign(H, {
    phase: 'deal', names, cpp, vault, start, turn: start, round: 1, dealIdx: 0, qrText: false,
    pub: rest.slice(cpp * names.length).sort(byOrder),
    players: names.map((name, i) => ({ name, hand: rest.slice(i * cpp, (i + 1) * cpp).sort(byOrder), elim: false, lastRoom: null })),
    res: null, logs: [], win: null, why: ''
  });
  ui.modal = null;
  render(true);
}

function nextAlive(from) {
  const n = H.players.length;
  for (let i = 1; i <= n; i++) { const c = (from + i) % n; if (!H.players[c].elim) return c; }
  return from;
}
function endTurn() {
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
      <button class="icon-btn" data-a="help" aria-label="Cara main">${ic('bantuan')}</button>
      ${inGame ? `<button class="icon-btn" data-a="menu" aria-label="Menu">${ic('menu')}</button>` : ''}
    </div>
  </header>`;
}

function viewSetup() {
  const names = H.names;
  return `<section class="screen">
    <div class="folder">
      <div class="ftype">FAIL KES NO. 21/BSK</div>
      <span class="stamp">SULIT</span>
      <h1>KES<br>SIAPA?</h1>
      <p><b>Tan Sri Jaafar</b> ditemui mati di Banglo Seri Kenanga. Enam suspek, enam senjata, sembilan bilik. <b>Siapa? Guna apa? Di mana?</b></p>
      <span class="glass">${ic('kaca')}</span>
    </div>

    <div class="card">
      <div class="card-head"><span class="eyebrow brass">Detektif · ikut susunan duduk</span><span class="pill mute">${names.length} / 6</span></div>
      ${names.map((n, i) => `<div class="name-row">
        ${ava(n || String(i + 1), i)}
        <input type="text" value="${esc(n)}" maxlength="14" placeholder="Nama detektif ${i + 1}" data-name="${i}" enterkeyhint="next" autocomplete="off">
        ${names.length > 3 ? `<button class="x-btn" data-a="delName" data-v="${i}" aria-label="Buang">${ic('x')}</button>` : ''}
      </div>`).join('')}
      ${names.length < 6 ? `<button class="add-btn" data-a="addName">${ic('tambah')} Tambah detektif</button>` : ''}
      <p class="tiny" style="margin-top:10px">Masukkan nama ikut arah jam di meja. Setiap detektif perlu telefon berkamera & internet untuk imbas QR kad masing-masing.</p>
    </div>

    <div class="footer">
      <button class="btn btn-brass btn-lg" data-a="deal">${ic('qr')} Agih Kad & Jana QR</button>
      <button class="link" data-a="help" style="align-self:center">${ic('bantuan')} Cara main</button>
    </div>
  </section>`;
}

function viewDeal() {
  const i = H.dealIdx, p = H.players[i], last = i === H.players.length - 1;
  const showWarn = !H.qrText && isLocal() && !PUBLIC_URL;
  return `<section class="screen">
    <div class="dots">${H.players.map((_, j) => `<span class="dot ${j < i ? 'done' : j === i ? 'now' : ''}"></span>`).join('')}</div>
    <div class="deal-head">
      <div class="eyebrow">Agih kad · ${i + 1} / ${H.players.length}</div>
      <div class="who">${esc(p.name)}, imbas!</div>
      <p class="sub">${H.qrText ? 'QR teks: senarai kad terus keluar, tanpa internet.' : 'Buka kamera → halakan ke QR → tekan link yang muncul.'}</p>
    </div>
    <div class="qr-box">${QR.makeSVG(H.qrText ? textFor(i) : linkFor(i), 260)}</div>
    ${showWarn ? '<div class="warn">Game dibuka dari fail/localhost — QR web tak boleh dibuka di telefon lain.</div>' : ''}
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
  return `<div class="strip">${H.players.map((p, i) => `<button class="chip ${i === H.turn ? 'now' : ''} ${p.elim ? 'out' : ''}" data-a="showQR" data-v="${i}" aria-label="QR ${esc(p.name)}">
    ${ava(p.name, i)}<span>${esc(p.name)}</span></button>`).join('')}</div>`;
}

function logView() {
  if (!H.logs.length) return '<p class="tiny">Belum ada siasatan. Rekod akan muncul di sini — guna untuk isi buku nota anda.</p>';
  return `<div class="log">${H.logs.map(l => {
    const who = esc(H.players[l.who].name), q = `${esc(CARD[l.s].name)} · ${esc(CARD[l.w].name)} · ${esc(CARD[l.r].name)}`;
    if (l.t === 'acc') return `<div class="log-item acc"><div class="lh"><span>Pus. ${l.round} · Tuduhan</span><span>${who}</span></div>
      <div class="q">${q}</div><div class="ans"><span class="${l.ok ? 'yes' : 'no'}">${l.ok ? 'TEPAT — kes selesai' : 'SALAH — tersingkir'}</span></div></div>`;
    return `<div class="log-item ${l.by === null ? 'none' : ''}"><div class="lh"><span>Pus. ${l.round} · Siasatan</span><span>${who}</span></div>
      <div class="q">${q}</div>
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
      ${ava(p.name, H.turn, 'lg')}
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
  const sentence = ready ? `${esc(CARD[pk.s].name)} · ${esc(CARD[pk.w].name)} · ${esc(CARD[pk.r].name)}` : 'Pilih satu dari setiap kategori';
  return `<section class="screen">
    <div class="bar">
      <button class="icon-btn" data-a="cancelPick" aria-label="Kembali">${ic('balik')}</button>
      <div class="grow"><div class="eyebrow ${acc ? '' : 'brass'}" style="${acc ? 'color:#ff9e94' : ''}">${acc ? 'Tuduhan muktamad' : 'Siasatan'}</div><div class="title" style="font-size:1.3rem">${esc(p.name)}</div></div>
    </div>
    ${acc ? '<div class="warn">Tuduhan hanya sekali. Jika salah, anda tersingkir (tapi masih perlu tunjuk kad bila ditanya).</div>' : ''}
    <div class="card">${CATS.map(block).join('')}</div>
    <div class="sticky">
      <p class="tiny" style="text-align:center;margin-bottom:8px">${sentence}</p>
      <button class="btn ${acc ? 'btn-red' : 'btn-brass'} btn-lg" data-a="submitPick" ${ready ? '' : 'disabled'}>${acc ? `${ic('tuduh')} Buka sampul rahsia` : `${ic('kaca')} Umum & semak`}</button>
    </div>
  </section>`;
}

function viewResult() {
  const r = H.res, asker = H.players[H.turn];
  const disp = r.by === null ? null : H.players[r.by];
  return `<section class="screen">
    <div class="card">
      <div class="eyebrow">${esc(asker.name)} bertanya</div>
      <div class="mini-cards" style="margin-top:10px">${[r.s, r.w, r.r].map(id => evi(id)).join('')}</div>
    </div>
    <div class="chain">
      ${r.passed.map((i, k) => `<div class="ln no" style="animation-delay:${k * 0.12}s">${ava(H.players[i].name, i)}<span>${esc(H.players[i].name)}</span><span class="st">✗ tiada kad</span></div>`).join('')}
      ${disp ? `<div class="ln yes" style="animation-delay:${r.passed.length * 0.12}s">${ava(disp.name, r.by)}<span>${esc(disp.name)}</span><span class="st">✓ ADA BUKTI</span></div>` : ''}
    </div>
    ${disp ? `<div class="callout ok">
        <div class="big">${esc(disp.name)}, tunjuk 1 kad!</div>
        <p class="sub">Buka telefon kau, ketik <b>satu</b> kad yang sepadan, tunjuk kepada <b>${esc(asker.name)}</b> sahaja secara rahsia.</p>
      </div>`
    : `<div class="callout gold">
        <div class="big">Tiada siapa boleh sangkal!</div>
        <p class="sub">Tiada detektif lain pegang kad ini. Sama ada ia jawapan… atau ${esc(asker.name)} sendiri yang pegang.</p>
      </div>`}
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
      <div class="step"><span class="n">1</span><div><b>Agih kad</b><p class="tiny">Satu telefon di tengah meja. Setiap detektif imbas QR sendiri untuk dapat kad tangan & buku nota. 3 kad (suspek, senjata, bilik) disorok dalam sampul rahsia.</p></div></div>
      <div class="step"><span class="n">2</span><div><b>Siasat</b><p class="tiny">Pada giliran, pilih suspek + senjata + bilik di telefon meja. Bilik mesti berbeza dari siasatan anda yang lepas.</p></div></div>
      <div class="step"><span class="n">3</span><div><b>Sangkal</b><p class="tiny">Telefon meja semak ikut arah jam siapa pegang salah satu kad itu. Detektif pertama yang ada mesti tunjuk <b>satu</b> kad dari telefonnya kepada penanya sahaja.</p></div></div>
      <div class="step"><span class="n">4</span><div><b>Catat</b><p class="tiny">Di buku nota telefon anda, ketik petak: ✓ ada, ✗ tiada, ? syak. Yang “✗ tiada kad” dalam rekod meja → tanda ✗ pada ketiga-tiga kad untuk orang itu. Buku nota buat deduksi automatik.</p></div></div>
      <div class="step"><span class="n">5</span><div><b>Tuduh</b><p class="tiny">Yakin? Buat tuduhan muktamad pada giliran anda (boleh terus selepas siasatan). Tepat = menang. Salah = tersingkir, tapi masih kena tunjuk kad.</p></div></div>
    </div>
    <p class="tiny">Bukti terbuka di meja (jika ada) ialah baki kad yang tak cukup untuk dibahagi sama rata — semua orang tahu ia bukan jawapan.</p>
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
    case 'addName': if (H.names.length < 6) H.names.push(''); render(); setTimeout(() => { const ins = document.querySelectorAll('[data-name]'); ins[ins.length - 1]?.focus(); }, 30); return;
    case 'delName': H.names.splice(+v, 1); break;
    case 'deal': return deal(H.names);
    case 'again': return deal(H.players.length ? H.players.map(p => p.name) : H.names);
    case 'toSetup': H = freshHost(H.players.length ? H.players.map(p => p.name) : H.names); ui.modal = null; return render(true);
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
  P = { ...d, code, marks: saved.marks || {}, hide: !!saved.hide, zoom: null };
}
const savePlayer = () => store.set(NOTE_KEY + P.code, { marks: P.marks, hide: P.hide });

// Deduksi: tanda manual + fakta tetap (kad sendiri, kad meja) → isi petak yang pasti, cari jawapan sampul.
function deduce() {
  const n = P.names.length, others = P.names.map((_, i) => i).filter(i => i !== P.me);
  const E = {};
  ALL.forEach(c => {
    E[c.id] = {};
    const known = P.hand.includes(c.id) || P.pub.includes(c.id);
    others.forEach(p => {
      const m = (P.marks[c.id] || {})[p] || '';
      E[c.id][p] = known ? { v: 'n', how: 'fix' } : { v: m, how: m ? 'me' : '' };
    });
  });
  const isY = x => x.v === 'y', isN = x => x.v === 'n', unk = x => x.v !== 'y' && x.v !== 'n';
  const set = (x, v) => { if (unk(x)) { x.v = v; x.how = 'auto'; return true; } return false; };
  let changed = true, guard = 0;
  while (changed && guard++ < 30) {
    changed = false;
    // Satu kad hanya ada satu pemilik.
    ALL.forEach(c => { const row = others.map(p => E[c.id][p]); if (row.some(isY)) row.forEach(x => { changed = set(x, 'n') || changed; }); });
    // Bilangan kad setiap pemain diketahui.
    others.forEach(p => {
      const col = ALL.map(c => E[c.id][p]), y = col.filter(isY).length, u = col.filter(unk);
      if (!u.length) return;
      if (y >= P.cpp) u.forEach(x => { changed = set(x, 'n') || changed; });
      else if (y + u.length === P.cpp) u.forEach(x => { changed = set(x, 'y') || changed; });
    });
    // Jika semua kad lain dalam kategori sudah ada pemilik, baki itu dalam sampul.
    CATS.forEach(cat => {
      const held = id => P.hand.includes(id) || P.pub.includes(id) || others.some(p => isY(E[id][p]));
      const free = cat.cards.filter(c => !held(c.id));
      if (free.length === 1) others.forEach(p => { changed = set(E[free[0].id][p], 'n') || changed; });
    });
  }
  const held = id => P.hand.includes(id) || P.pub.includes(id) || others.some(p => isY(E[id][p]));
  const sol = {}, left = {};
  CATS.forEach(cat => {
    const free = cat.cards.filter(c => !held(c.id));
    left[cat.k] = free.length;
    const env = free.filter(c => others.every(p => isN(E[c.id][p])));
    sol[cat.k] = env.length === 1 ? env[0].id : (free.length === 1 ? free[0].id : null);
  });
  return { E, others, held, sol, left };
}

function viewPlayer() {
  if (P.bad) return `<section class="screen" style="justify-content:center;text-align:center">
    <span class="mark" style="margin:0 auto">${ic('kaca')}</span>
    <div class="title">Link tidak sah</div>
    <p class="sub">Imbas semula QR anda di telefon meja.</p></section>`;
  const D = deduce(), me = P.names[P.me];
  const slot = cat => {
    const id = D.sol[cat.k];
    return id ? `<div class="slot solved">${cardArt(CARD[id])}<span class="v">${esc(CARD[id].name)}</span><span class="k">${cat.label}</span></div>`
      : `<div class="slot"><span class="n">${D.left[cat.k]}</span><span class="k">${cat.label}</span><span class="tiny">calon tinggal</span></div>`;
  };
  const head = D.others.map(p => `<th>${ava(P.names[p], p)}${esc(P.names[p].slice(0, 6))}</th>`).join('');
  const rows = CATS.map(cat => `<tr class="grp"><td colspan="${D.others.length + 1}">${cat.label}</td></tr>` + cat.cards.map(c => {
    const mine = P.hand.includes(c.id), pub = P.pub.includes(c.id), envRow = D.sol[c.k] === c.id;
    const cls = [mine ? 'mine' : '', pub ? 'pub' : '', !mine && !pub && D.held(c.id) ? 'held' : '', envRow ? 'env' : '', (mine || pub) ? 'held' : ''].join(' ');
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
      <div class="case">${CATS.map(slot).join('')}</div>
    </div>

    <div class="card">
      <div class="card-head"><span class="eyebrow brass">Buku nota</span><button class="link" data-a="resetNotes">${ic('ulang')} Kosongkan</button></div>
      <table class="nb"><thead><tr><th class="cn">Kad</th>${head}</tr></thead><tbody>${rows}</tbody></table>
      <div class="legend" style="margin-top:10px">
        <span><i style="background:rgba(76,191,134,.2);color:var(--ok)">✓</i>ada</span>
        <span><i style="color:var(--dim)">✗</i>tiada</span>
        <span><i style="background:rgba(224,178,90,.16);color:var(--brass)">?</i>syak</span>
        <span><i style="opacity:.55;color:var(--ok)">✓</i>deduksi auto</span>
      </div>
      <p class="tiny" style="margin-top:8px">Ketik petak untuk tukar. Garis hijau = kad anda, garis biru = kad meja. Baris emas = jawapan sampul.</p>
    </div>
  </section>`;
}

function modalPlayer() {
  if (P.zoom) return `<div class="overlay full" data-a="close"><div class="zoom">
    <span class="eyebrow brass">Bukti daripada ${esc(P.names[P.me])}</span>
    <div class="evi ${CARD[P.zoom].k}">${cardArt(CARD[P.zoom], true)}<span>${esc(CARD[P.zoom].name)}</span><small>${CAT_LABEL[CARD[P.zoom].k]}</small></div>
    <button class="btn btn-ghost btn-sm" data-a="close">${ic('tutupmata')} Sorok semula</button></div></div>`;
  if (ui.modal && ui.modal.t === 'help') return helpSheet();
  return '';
}

function renderPlayer() {
  $('#app').innerHTML = viewPlayer();
  $('#modal').innerHTML = P.bad ? '' : modalPlayer();
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
    case 'resetNotes': if (confirm('Kosongkan semua tanda dalam buku nota?')) P.marks = {}; break;
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
  if (!el) return;
  // Klik pada latar modal sahaja yang menutup; klik dalam kotak modal diabaikan.
  if (el.classList.contains('overlay') && e.target !== el) return;
  (P ? playerAction : hostAction)(el.dataset.a, el.dataset.v);
});
document.addEventListener('input', e => {
  const i = e.target.dataset && e.target.dataset.name;
  if (i === undefined || !H) return;
  H.names[+i] = e.target.value;
  const a = e.target.parentElement.querySelector('.ava');
  if (a) a.textContent = (e.target.value.trim().charAt(0) || String(+i + 1)).toUpperCase();
  saveHost();
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target.dataset || e.target.dataset.name === undefined) return;
  const ins = [...document.querySelectorAll('[data-name]')], k = ins.indexOf(e.target);
  if (ins[k + 1]) ins[k + 1].focus(); else e.target.blur();
});
addEventListener('hashchange', boot);
boot();
