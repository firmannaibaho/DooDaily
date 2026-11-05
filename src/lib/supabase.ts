import { createClient, type SupabaseClient } from "@supabase/supabase-js";

if (typeof globalThis.WebSocket === "undefined" && typeof window === "undefined") {
  // `ws` hanya dibutuhkan untuk realtime di Node; impor dinamis agar ESLint
  // tidak menandainya sebagai require() dan tidak ikut ke bundle browser.
  void import("ws")
    .then((mod) => {
      const Ws = (mod.default ?? mod) as unknown as typeof WebSocket;
      if (typeof globalThis.WebSocket === "undefined") globalThis.WebSocket = Ws;
    })
    .catch(() => {
      /* opsional */
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  "";

/**
 * Kredensial belum diisi → jangan panggil createClient() karena ia melempar
 * error saat modul dievaluasi. Itu membuat SELURUH route (termasuk
 * /api/auth/session) ikut 500 sehingga website menampilkan error.
 *
 * Selama kosong, `supabase` bernilai null dan semua query di lib/db.ts
 * otomatis gagal dengan rapi (mengembalikan kosong) alih-alih crash.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/** Pesan seragam saat fitur database dipakai tanpa kredensial. */
export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  "Database belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local.";

