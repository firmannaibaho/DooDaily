/**
 * Tipe & konstanta untuk fitur chat admin.
 *
 * Model: satu sistem, tiga KONTEKS percakapan.
 *   - general : obrolan umum user ↔ admin (satu per user)
 *   - cart    : obrolan tentang isi keranjang sebelum checkout (satu per user)
 *   - order   : obrolan yang menempel pada satu pesanan (satu per order_id)
 *
 * File ini murni tipe + konstanta, tanpa akses database, agar bisa dipakai
 * baik di server maupun client component.
 */

export type ChatKind = "general" | "cart" | "order";

export type ChatSenderRole = "user" | "admin";

export type ChatThreadStatus = "open" | "closed";

export interface ChatThread {
  id: number;
  user_id: number;
  kind: ChatKind;
  /** Terisi hanya bila kind === "order". */
  order_id: string | null;
  subject: string;
  last_message_at: string;
  last_message_preview: string;
  unread_for_admin: number;
  unread_for_user: number;
  status: ChatThreadStatus;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  thread_id: number;
  sender_id: number | null;
  sender_role: ChatSenderRole;
  body: string;
  read_at: string | null;
  created_at: string;
}

/** Ringkasan thread untuk daftar di panel admin. */
export interface AdminThreadSummary extends ChatThread {
  user_name: string;
  user_email: string;
}

/** Label singkat konteks untuk ditampilkan di UI. */
export const CHAT_KIND_META: Record<ChatKind, { label: string; icon: string; title: string }> = {
  general: { label: "Umum", icon: "🟢", title: "Chat Umum" },
  cart: { label: "Keranjang", icon: "🛒", title: "Tanya soal Keranjang" },
  order: { label: "Pesanan", icon: "📦", title: "Chat Pesanan" },
};

/** Batas panjang satu pesan (selaras dengan CHECK di database). */
export const MAX_CHAT_BODY_LENGTH = 2000;

/** Jumlah pesan yang dimuat per kali ambil. */
export const CHAT_PAGE_SIZE = 100;

/** Interval polling (ms) saat panel chat terbuka. */
export const CHAT_POLL_INTERVAL_MS = 4000;

/** Interval polling (ms) untuk badge unread di Navbar. */
export const CHAT_UNREAD_POLL_INTERVAL_MS = 15000;

/** Rapikan isi pesan: buang spasi berlebih & batasi panjang. */
export function sanitizeChatBody(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_CHAT_BODY_LENGTH);
}

/** Preview singkat untuk daftar thread. */
export function buildPreview(body: string, max = 60): string {
  const clean = body.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}
