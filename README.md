# Kes Siapa? — Cluedo edisi Malaysia (1 telefon + QR)

Live: https://kessiapa.vercel.app/

Satu telefon di tengah meja jadi **Meja Siasatan**. Setiap detektif imbas QR guna kamera telefon sendiri untuk buka
**kad tangan & buku nota** — tak perlu download app, tak perlu pass telefon.

## Cara main
1. Telefon meja: masukkan 3–8 nama ikut susunan duduk, pilih saiz kes → **Agih Kad & Jana QR**.
   - **Klasik** (21 kad): 3–6 detektif.
   - **Besar** (27 kad: +2 suspek, +2 senjata, +2 bilik): 3–8 detektif, wajib untuk 7–8.
2. Setiap detektif imbas QR mereka (atau **Hantar link** ke WhatsApp). Tiada internet? Guna QR teks (senarai kad sahaja).
3. Pada giliran: **Siasat** (suspek + senjata + bilik). Meja semak ikut arah jam siapa boleh sangkal.
   Detektif itu tunjuk satu kad dari telefonnya kepada penanya sahaja. Tersilap tekan? Butang undo di atas.
4. Di telefon sendiri tekan **Catat siasatan** (siapa tanya, 3 kad, siapa tunjuk). Buku nota tanda ✗ untuk yang
   tiada kad, dan deduksi automatik cari kad yang pasti serta jawapan sampul. Boleh juga ketik petak sendiri.
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
