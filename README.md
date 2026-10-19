# Kes Siapa? — Cluedo Malaysia (1 telefon + QR)

Satu telefon di meja jadi **Meja Utama**. Setiap pemain imbas QR guna kamera telefon sendiri untuk buka
**kad tangan & buku nota** — tak perlu download app, tak perlu pass telefon.

## Main
1. Buka game di telefon meja melalui alamat web (https://...).
2. Masukkan nama 3–6 pemain → **Mula Siasatan & Jana QR**.
3. Setiap pemain imbas QR mereka. Tiada internet? Guna tab **QR Teks Kad Terus** (senarai kad sahaja, tanpa buku nota).

## Hosting (Vercel)
Satu fail `index.html`, tiada build. Import repo ini di https://vercel.com/new — semua tetapan biar default.
Selepas dapat URL, isi `PUBLIC_URL` dalam `index.html` supaya QR tetap betul walaupun telefon meja buka fail tempatan.

## Uji di komputer
```
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```
Kemudian buka http://localhost:8090/
