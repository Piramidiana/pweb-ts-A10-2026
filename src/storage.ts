// ============================================================
// AKSES LOCALSTORAGE BERSAMA
// Pemilik: Piramidiana.
// Fungsi di sini cuma baca/tulis data dasar. Logika khusus halaman
// (issueTicket -> Viko, sortByPriority -> RayhanFa) ditulis oleh pemiliknya.
// ============================================================

const STORAGE_KEYS = {
  session: "session",
  queueTypes: "queueTypes",
  tickets: "tickets",
  ticketCounters: "ticketCounters", // { "A": 3, "B": 12 } = nomor terakhir per kode
} as const;

function readJSON<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback; // data rusak -> anggap kosong, jangan bikin halaman crash
  }
}

function writeJSON(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Jenis antrian ----------
function getQueueTypes(): QueueType[] {
  return readJSON<QueueType[]>(STORAGE_KEYS.queueTypes, []);
}
function saveQueueTypes(list: QueueType[]): void {
  writeJSON(STORAGE_KEYS.queueTypes, list);
}

// ---------- Tiket ----------
function getTickets(): Ticket[] {
  return readJSON<Ticket[]>(STORAGE_KEYS.tickets, []);
}
function saveTickets(list: Ticket[]): void {
  writeJSON(STORAGE_KEYS.tickets, list);
}

// ---------- Counter nomor tiket per kode ----------
function getTicketCounters(): Record<string, number> {
  return readJSON<Record<string, number>>(STORAGE_KEYS.ticketCounters, {});
}
function saveTicketCounters(counters: Record<string, number>): void {
  writeJSON(STORAGE_KEYS.ticketCounters, counters);
}

// ---------- Helper kecil ----------
// formatTicketLabel("A", 1) -> "A-001"
function formatTicketLabel(kode: string, nomor: number): string {
  return `${kode}-${String(nomor).padStart(3, "0")}`;
}

// Panggil callback tiap ada perubahan data (tab lain) + polling berkala.
// Dipakai layar.html dan ambil-antrian.html untuk update otomatis.
function watchStorage(callback: () => void, intervalMs: number = 2000): void {
  window.addEventListener("storage", callback);
  window.setInterval(callback, intervalMs);
}

// ---------- Data contoh untuk testing ----------
// Panggil seedDemoData() di console / di awal halaman saat testing.
// force = true -> timpa data yang ada dengan data contoh.
function seedDemoData(force: boolean = false): void {
  if (!force && getQueueTypes().length > 0) return;

  const types: QueueType[] = [
    { kode: "A", nama: "UMUM-1", aktif: true },
    { kode: "B", nama: "UMUM-2", aktif: true },
    { kode: "C", nama: "UMUM-3", aktif: true },
    { kode: "G", nama: "GIGI", aktif: true },
    { kode: "F", nama: "FARMASI", aktif: true },
    { kode: "P", nama: "PSIKOLOG", aktif: true },
  ];

  // [kode, prioritas, status] — urutan = urutan dibuatnya
  const samples: Array<[string, Priority, TicketStatus]> = [
    ["A", "Normal", "Dipanggil"],
    ["B", "Normal", "Menunggu"],
    ["B", "Normal", "Menunggu"],
    ["B", "Disabilitas", "Menunggu"],
    ["B", "Disabilitas", "Menunggu"],
    ["C", "Normal", "Menunggu"],
    ["G", "Lansia", "Dipanggil"],
    ["G", "Normal", "Menunggu"],
    ["G", "Normal", "Menunggu"],
    ["F", "Normal", "Dipanggil"],
    ["P", "Normal", "Menunggu"],
    ["P", "Normal", "Menunggu"],
    ["P", "VIP", "Menunggu"],
  ];

  const counters: Record<string, number> = {};
  const now = Date.now();

  const tickets: Ticket[] = samples.map(([kode, prioritas, status], i) => {
    const nomor = (counters[kode] ?? 0) + 1;
    counters[kode] = nomor;
    return {
      id: i + 1,
      kode,
      nomor,
      label: formatTicketLabel(kode, nomor),
      prioritas,
      status,
      createdAt: now - (samples.length - i) * 60000, // tiap tiket selisih 1 menit
    };
  });

  saveQueueTypes(types);
  saveTickets(tickets);
  saveTicketCounters(counters);
}
