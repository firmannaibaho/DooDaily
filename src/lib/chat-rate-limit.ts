/**
 * Rate limiter sederhana (in-memory) untuk endpoint chat.
 *
 * Cukup untuk dev & deployment single-instance. Bila nanti di-scale ke
 * beberapa instance, ganti penyimpanan `Map` dengan Redis/Upstash tanpa
 * mengubah pemanggil (API-nya sudah async).
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Sisa waktu tunggu (detik) bila ditolak. */
  retryAfterSeconds: number;
}

/** Jarak minimum antar pesan dari user yang sama. */
const MIN_INTERVAL_MS = 2_000;
/** Batas jumlah pesan dalam jendela waktu. */
const WINDOW_MS = 60_000;
const MAX_IN_WINDOW = 30;

/** key → daftar timestamp pesan (ms, terlama → terbaru). */
const buckets = new Map<string, number[]>();

/** Bersihkan entri lama agar Map tidak tumbuh tanpa batas. */
function prune(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

/**
 * Cek apakah user boleh mengirim pesan sekarang.
 * @param key pengenal unik, mis. `user:3`
 */
export function checkChatRateLimit(key: string, now = Date.now()): RateLimitResult {
  const history = prune(buckets.get(key) ?? [], now);
  const last = history[history.length - 1];

  // 1. Jarak minimum antar pesan
  if (last !== undefined && now - last < MIN_INTERVAL_MS) {
    const waitMs = MIN_INTERVAL_MS - (now - last);
    buckets.set(key, history);
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(waitMs / 1000)) };
  }

  // 2. Batas per menit
  if (history.length >= MAX_IN_WINDOW) {
    const oldest = history[0];
    const waitMs = WINDOW_MS - (now - oldest);
    buckets.set(key, history);
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(waitMs / 1000)) };
  }

  buckets.set(key, [...history, now]);
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Kosongkan riwayat satu key (dipakai di pengujian). */
export function resetChatRateLimit(key?: string): void {
  if (key === undefined) buckets.clear();
  else buckets.delete(key);
}

/** Konstanta untuk dokumentasi & pengujian. */
export const CHAT_RATE_LIMIT = { MIN_INTERVAL_MS, WINDOW_MS, MAX_IN_WINDOW };
