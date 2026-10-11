

const STORAGE_KEYS = {
  session: "session",
  queueTypes: "queueTypes",
  tickets: "tickets",
  ticketCounters: "ticketCounters", 
} as const;

function readJSON<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback; 
  }
}

function writeJSON(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}


function getQueueTypes(): QueueType[] {
  return readJSON<QueueType[]>(STORAGE_KEYS.queueTypes, []);
}
function saveQueueTypes(list: QueueType[]): void {
  writeJSON(STORAGE_KEYS.queueTypes, list);
}


function getTickets(): Ticket[] {
  return readJSON<Ticket[]>(STORAGE_KEYS.tickets, []);
}
function saveTickets(list: Ticket[]): void {
  writeJSON(STORAGE_KEYS.tickets, list);
}

function getTicketCounters(): Record<string, number> {
  return readJSON<Record<string, number>>(STORAGE_KEYS.ticketCounters, {});
}
function saveTicketCounters(counters: Record<string, number>): void {
  writeJSON(STORAGE_KEYS.ticketCounters, counters);
}


function formatTicketLabel(kode: string, nomor: number): string {
  return `${kode}-${String(nomor).padStart(3, "0")}`;
}

function watchStorage(callback: () => void, intervalMs: number = 2000): void {
  window.addEventListener("storage", callback);
  window.setInterval(callback, intervalMs);
}


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
      createdAt: now - (samples.length - i) * 60000, 
    };
  });

  saveQueueTypes(types);
  saveTickets(tickets);
  saveTicketCounters(counters);
}
