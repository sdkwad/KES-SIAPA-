# Kes Siapa? — Cluedo edisi Malaysia (1 telefon + QR)

Live: https://kessiapa.vercel.app/

Satu telefon di tengah meja jadi **Meja Siasatan**. Setiap detektif imbas QR guna kamera telefon sendiri untuk buka
**kad tangan & buku nota** — tak perlu download app, tak perlu pass telefon.

## Cara main
1. Telefon meja: masukkan 3–6 nama ikut susunan duduk → **Agih Kad & Jana QR**.
2. Setiap detektif imbas QR mereka (atau **Hantar link** ke WhatsApp). Tiada internet? Guna QR teks (senarai kad sahaja).
3. Pada giliran: **Siasat** (suspek + senjata + bilik). Meja semak ikut arah jam siapa boleh sangkal.
   Detektif itu tunjuk satu kad dari telefonnya kepada penanya sahaja.
4. Catat dalam buku nota grid di telefon sendiri (✓ ada, ✗ tiada, ? syak). Deduksi automatik isi petak yang pasti
   dan kesan jawapan sampul.
5. **Tuduhan muktamad**: tepat = menang, salah = tersingkir (masih kena tunjuk kad).

## Struktur
- `index.html` — kerangka
- `css/style.css` — tema "Fail Siasatan Malam"
- `js/app.js` — logik meja, telefon pemain (`#c=` dalam link), deduksi buku nota
- `js/qr.js` — penjana QR tanpa internet
- `sw.js`, `manifest.webmanifest`, `icons/` — PWA (boleh pasang ke skrin utama)

Tiada build. Vercel terbitkan folder ini terus. `PUBLIC_URL` dalam `js/app.js` = alamat live (untuk QR bila dibuka dari fail tempatan).

## Uji di komputer
```
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```
Kemudian buka http://localhost:8090/
