import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "./supabase";

/**
 * Penyimpanan berkas UNGGAHAN (bukti bayar, gambar referensi, gambar testimoni).
 *
 * ⚠️ KENAPA SUPABASE STORAGE, BUKAN `public/`:
 * Serverless (Vercel) memasang filesystem sebagai READ-ONLY sehingga
 * `fs.mkdir('public/...')` gagal dengan ENOENT/EROFS di produksi. Karena itu
 * berkas disimpan di Supabase Storage, dan database hanya menyimpan PATH
 * relatif (`bukti/xxx.jpg`) — URL publik dibentuk saat dibaca, sehingga
 * env/domain bisa berubah tanpa migrasi data.
 *
 * Sebagai kemudahan pengembangan lokal, bila Storage tidak tersedia
 * (tanpa SERVICE ROLE KEY) berkas ditulis ke `public/uploads/` dan disajikan
 * lewat path `/uploads/...`.
 */
export const UPLOAD_BUCKET = process.env.SUPABASE_UPLOAD_BUCKET?.trim() || "uploads";

export type UploadFolder = "bukti" | "referensi" | "testimoni";

const LOCAL_ROOT = path.join(process.cwd(), "public", "uploads");

/** Batas ukuran berkas: 5 MB. Cukup untuk foto struk / screenshot. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * Ekstensi yang diizinkan → tipe MIME yang sah.
 *
 * Ekstensi ditentukan dari ISI berkas (magic number), bukan dari nama kiriman
 * browser, supaya berkas `.php` yang dinamai `.jpg` tetap ditolak.
 */
const ALLOWED_TYPES: { ext: string; mime: string; test: (b: Uint8Array) => boolean }[] = [
  {
    ext: "jpg",
    mime: "image/jpeg",
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "png",
    mime: "image/png",
    test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    ext: "webp",
    mime: "image/webp",
    test: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    ext: "gif",
    mime: "image/gif",
    test: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46,
  },
];

export interface SavedUpload {
  /** Path relatif dalam bucket, mis. `bukti/bukti-123-abc.jpg`. Ini disimpan di DB. */
  path: string;
  /** URL publik siap pakai (Storage di produksi, `/uploads/...` saat lokal). */
  url: string;
  bytes: number;
}

/** Ambil nama berkas saja (anti path traversal). */
function safeName(fileName: string): string {
  const base = path.basename(fileName.trim());
  if (!base || base === "." || base === "..") return "";
  return base;
}

/** Validasi isi berkas & kembalikan buffer + tipe yang sah. */
async function readValidImage(file: File): Promise<{ buffer: Buffer; ext: string; mime: string }> {
  if (file.size === 0) throw new Error("Berkas kosong.");
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Ukuran gambar maksimal ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const head = new Uint8Array(buffer.subarray(0, 12));
  const match = ALLOWED_TYPES.find((t) => t.test(head));
  if (!match) throw new Error("Format gambar harus JPG, PNG, WEBP, atau GIF.");

  return { buffer, ext: match.ext, mime: match.mime };
}

/** Base URL publik Storage, mis. `https://xxx.supabase.co/storage/v1/object/public/uploads`. */
function storagePublicBase(): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
  return base ? `${base}/storage/v1/object/public/${UPLOAD_BUCKET}` : "";
}

/** Apakah Supabase Storage siap dipakai (butuh SERVICE ROLE KEY). */
export function isStorageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) && Boolean(storagePublicBase());
}

/**
 * Simpan berkas unggahan.
 *
 * Nama berkas dibuat sendiri (`<folder>-<timestamp>-<uuid8>.<ext>`) sehingga
 * nama dari browser tidak pernah dipakai langsung — mencegah path traversal
 * (`../../`), tabrakan nama, dan nama berkas berisi karakter aneh.
 */
export async function saveUpload(file: File, folder: UploadFolder): Promise<SavedUpload> {
  const { buffer, ext, mime } = await readValidImage(file);

  const stamp = Date.now();
  const rand = randomUUID().replace(/-/g, "").slice(0, 8);
  const objectPath = `${folder}/${folder}-${stamp}-${rand}.${ext}`;

  const client = supabaseAdmin();
  const publicBase = storagePublicBase();

  // ── Jalur utama: Supabase Storage ──
  if (client && publicBase) {
    const { error } = await client.storage
      .from(UPLOAD_BUCKET)
      .upload(objectPath, buffer, { contentType: mime, upsert: false });

    if (error) {
      const hint = /bucket/i.test(error.message)
        ? ` Bucket "${UPLOAD_BUCKET}" belum ada di Supabase Storage (buat & set Public).`
        : ` ${error.message}`;
      throw new Error(`Gagal mengunggah berkas ke storage.${hint}`);
    }

    return { path: objectPath, url: `${publicBase}/${objectPath}`, bytes: buffer.length };
  }

  // ── Cadangan: filesystem lokal (hanya pengembangan) ──
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    throw new Error(
      "Penyimpanan berkas belum dikonfigurasi. Isi SUPABASE_SERVICE_ROLE_KEY agar unggahan disimpan ke Supabase Storage."
    );
  }

  const dir = path.join(LOCAL_ROOT, folder);
  await fs.mkdir(dir, { recursive: true });
  const fileName = path.basename(objectPath);
  await fs.writeFile(path.join(dir, fileName), buffer);

  return { path: objectPath, url: `/uploads/${objectPath}`, bytes: buffer.length };
}

/**
 * Hapus berkas unggahan.
 *
 * Menerima path relatif (`bukti/xxx.jpg`) maupun nama berkas lama (`xxx.jpg`)
 * — nama berkas diperlakukan sebagai anggota `folder`. Diam-diam berhasil
 * bila berkas memang sudah tidak ada.
 */
export async function deleteUpload(value: string, folder: UploadFolder): Promise<void> {
  const clean = value.split("?")[0].replace(/^\/+/, "");
  if (!clean || clean.includes("..")) return;

  const objectPath = clean.includes("/") ? clean : `${folder}/${safeName(clean)}`;
  if (!objectPath.includes("/")) return;

  const client = supabaseAdmin();
  if (client && storagePublicBase()) {
    await client.storage.from(UPLOAD_BUCKET).remove([objectPath]).catch(() => {});
    return;
  }

  try {
    await fs.unlink(path.join(LOCAL_ROOT, objectPath));
  } catch {
    /* Berkas mungkin sudah tidak ada — anggap berhasil. */
  }
}

/** Ambil nama berkas dari nilai yang mungkin URL penuh atau path. */
export function fileNameOf(value: string): string {
  const clean = value.split("?")[0].split("/").pop() ?? "";
  return safeName(clean);
}

/**
 * Ubah nilai kolom database menjadi URL publik.
 *
 * Menerima:
 *   - path relatif  → `bukti/xxx.jpg`        → URL publik Storage
 *   - nama berkas   → `xxx.jpg` (data lama)  → dicari di `folder/`
 *   - URL penuh     → dikembalikan apa adanya (kompatibilitas data lama)
 *   - path absolut  → `/uploads/...`         → dikembalikan apa adanya
 */
export function uploadUrl(value: string, folder: UploadFolder): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  if (value.startsWith("/")) return value;

  const objectPath = value.includes("/") ? value : `${folder}/${fileNameOf(value)}`;
  const base = storagePublicBase();
  return base ? `${base}/${objectPath}` : `/uploads/${objectPath}`;
}

