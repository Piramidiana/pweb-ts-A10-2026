# Antrian Rumah Sakit (TypeScript) — Praktikum Modul 3

Native HTML/CSS/TypeScript, tanpa framework. Kelompok: Piramidiana, Viko, RayhanFa.

## Cara mulai (sekali saja per laptop)
```bash
npm install          # pasang TypeScript
npm run watch        # kompilasi otomatis src/*.ts -> dist/*.js (biarkan jalan)
```
Buka HTML lewat **Live Server**. Folder `dist/` **wajib ikut di-commit** (HTML memanggil `dist/*.js`).

## Struktur
```
src/            <- tulis TypeScript di sini
  types.ts      <- tipe data bersama      (Piramidiana)
  storage.ts    <- akses localStorage     (Piramidiana)
  auth.ts       <- sesi login + guard     (Piramidiana)
  login.ts, ambil-antrian.ts   (Piramidiana)
  dashboard.ts  (Viko)
  operator.ts, layar.ts        (RayhanFa)
dist/           <- hasil kompilasi (jangan diedit manual)
```

## Aturan WAJIB
1. **Jangan pakai `import` / `export`.** Semua file dimuat sebagai script biasa dengan `defer`, seperti di Modul 2.
2. **Bungkus seluruh isi file halaman dengan IIFE**, supaya nama variabel tidak bentrok antar file:
   ```ts
   (() => {
     const session = requireAuth({ adminOnly: true }); // contoh dashboard
     if (!session) return;
     // ... kode halamanmu
   })();
   ```
   Tanpa ini tsc error: `Cannot redeclare block-scoped variable`.
3. **File bersama (`types.ts`, `storage.ts`, `auth.ts`) hanya diubah Piramidiana.** Butuh fungsi/tipe baru? Minta di grup.
4. Urutan script di HTML (shared dulu, baru file halaman):
   ```html
   <script src="dist/storage.js" defer></script>
   <script src="dist/auth.js" defer></script>
   <script src="dist/dashboard.js" defer></script>
   ```
   (`login.html` dan halaman publik yang tidak butuh guard tetap memuat `storage.js`; `auth.js` hanya kalau dipakai.)
5. Satu orang = satu branch (`piramidiana-...`, `viko-dashboard`, `rayhanfa-operator-layar`). Merge ke `main` setelah dicoba di browser.

## Data di localStorage (jangan ubah bentuknya)
| Key | Isi |
|---|---|
| `session` | `{ token, role, firstName }` |
| `queueTypes` | `QueueType[]` — `{ kode, nama, aktif }` |
| `tickets` | `Ticket[]` — `{ id, kode, nomor, label, prioritas, status, createdAt }` |
| `ticketCounters` | `{ "A": 3, "B": 12 }` — nomor terakhir per kode |

Aturan: `id` tiket baru = id terbesar + 1 (atau 1 kalau kosong). Reset antrian mengosongkan `tickets` **dan** `ticketCounters`.

## Fungsi yang sudah tersedia
- `getQueueTypes() / saveQueueTypes(list)`
- `getTickets() / saveTickets(list)`
- `getTicketCounters() / saveTicketCounters(obj)`
- `formatTicketLabel("A", 1)` -> `"A-001"`
- `watchStorage(callback, intervalMs = 2000)` — update otomatis (dipakai layar & ambil-antrian)
- `seedDemoData(force = false)` — isi data contoh untuk testing (jalankan di Console browser)
- `getSession() / saveSession(s) / clearSession() / logout()`
- `requireAuth()` / `requireAuth({ adminOnly: true })` — redirect ke `login.html` kalau gagal; moderator = admin

## Yang ditulis pemilik masing-masing halaman
- Viko: `issueTicket(kode, prioritas)` (+ `resetQueue()`, validasi jenis antrian) — dipakai juga oleh `ambil-antrian`
- RayhanFa: `sortByPriority()` — urutan VIP > Disabilitas > Lansia > Normal, lalu `createdAt` terlama

## Tes cepat tanpa login
Di Console browser: `seedDemoData(true)`, lalu isi sesi manual:
```js
saveSession({ token: "x", role: "admin", firstName: "Tes" })
```
