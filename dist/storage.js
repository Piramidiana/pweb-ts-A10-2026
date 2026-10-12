"use strict";
const STORAGE_KEYS = {
    session: "session",
    queueTypes: "queueTypes",
    tickets: "tickets",
    ticketCounters: "ticketCounters",
};
function readJSON(key, fallback) {
    const raw = localStorage.getItem(key);
    if (raw === null)
        return fallback;
    try {
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
function getQueueTypes() {
    return readJSON(STORAGE_KEYS.queueTypes, []);
}
function saveQueueTypes(list) {
    writeJSON(STORAGE_KEYS.queueTypes, list);
}
function getTickets() {
    return readJSON(STORAGE_KEYS.tickets, []);
}
function saveTickets(list) {
    writeJSON(STORAGE_KEYS.tickets, list);
}
function getTicketCounters() {
    return readJSON(STORAGE_KEYS.ticketCounters, {});
}
function saveTicketCounters(counters) {
    writeJSON(STORAGE_KEYS.ticketCounters, counters);
}
function formatTicketLabel(kode, nomor) {
    return `${kode}-${String(nomor).padStart(3, "0")}`;
}
function watchStorage(callback, intervalMs = 2000) {
    window.addEventListener("storage", callback);
    window.setInterval(callback, intervalMs);
}
function seedDemoData(force = false) {
    if (!force && getQueueTypes().length > 0)
        return;
    const types = [
        { kode: "A", nama: "UMUM-1", aktif: true },
        { kode: "B", nama: "UMUM-2", aktif: true },
        { kode: "C", nama: "UMUM-3", aktif: true },
        { kode: "G", nama: "GIGI", aktif: true },
        { kode: "F", nama: "FARMASI", aktif: true },
        { kode: "P", nama: "PSIKOLOG", aktif: true },
    ];
    const samples = [
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
    const counters = {};
    const now = Date.now();
    const tickets = samples.map(([kode, prioritas, status], i) => {
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
function issueTicket(kode, prioritas) {
    const queueType = getQueueTypes().find((type) => type.kode.toUpperCase() === kode.toUpperCase() && type.aktif);
    if (!queueType) {
        alert("Jenis antrian tidak ditemukan atau sedang nonaktif!");
        return null;
    }
    const tickets = getTickets();
    const counters = getTicketCounters();
    const nomor = (counters[queueType.kode] ?? 0) + 1;
    counters[queueType.kode] = nomor;
    const newTicket = {
        id: tickets.reduce((maxId, ticket) => Math.max(maxId, ticket.id), 0) + 1,
        kode: queueType.kode,
        nomor,
        label: formatTicketLabel(queueType.kode, nomor),
        prioritas,
        status: "Menunggu",
        createdAt: Date.now(),
    };
    tickets.push(newTicket);
    saveTickets(tickets);
    saveTicketCounters(counters);
    return newTicket;
}
function resetQueue() {
    saveTickets([]);
    saveTicketCounters({});
}
