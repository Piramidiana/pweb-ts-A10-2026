type Role = "admin" | "moderator" | "user";
type Priority = "Normal" | "Lansia" | "Disabilitas" | "VIP";
type TicketStatus = "Menunggu" | "Dipanggil" | "Selesai" | "Dilewati";

interface QueueType {
  kode: string;
  nama: string;
  aktif: boolean;
}

interface Ticket {
  id: number; 
  kode: string; 
  nomor: number; 
  label: string; 
  prioritas: Priority;
  status: TicketStatus;
  createdAt: number; 
}

interface Session {
  token: string;
  role: Role;
  firstName: string;
}
