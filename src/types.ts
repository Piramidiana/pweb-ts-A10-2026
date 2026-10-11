// ============================================================
// TIPE DATA BERSAMA — dipakai semua halaman
// Pemilik: Piramidiana. Jangan ubah tanpa kabar ke grup.
// PENTING: file bersama TIDAK boleh pakai import/export (lihat README).
// ============================================================

type Role = "admin" | "moderator" | "user";
type Priority = "Normal" | "Lansia" | "Disabilitas" | "VIP";
type TicketStatus = "Menunggu" | "Dipanggil" | "Selesai" | "Dilewati";

// Jenis antrian, contoh: { kode: "A", nama: "UMUM-1", aktif: true }
interface QueueType {
  kode: string; // 1 huruf kapital
  nama: string;
  aktif: boolean; // false = tidak bisa dipilih saat ambil tiket baru
}

// Satu tiket antrian
interface Ticket {
  id: number; // unik, naik terus (id baru = id terbesar + 1)
  kode: string; // kode jenis antrian, mis. "A"
  nomor: number; // urutan per jenis: 1, 2, 3, ...
  label: string; // tampilan: "A-001"
  prioritas: Priority;
  status: TicketStatus;
  createdAt: number; // Date.now() saat tiket dibuat
}

// Data sesi login yang disimpan di localStorage
interface Session {
  token: string;
  role: Role;
  firstName: string;
}
