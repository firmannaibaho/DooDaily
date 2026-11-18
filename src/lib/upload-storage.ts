import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Penyimpanan berkas UNGGAHAN PENGGUNA (bukan aset desain seperti
 * `public/catalog/`). Ada dua jenis:
 *
 *   bukti/      → bukti pembayaran pesanan (QRIS / transfer bank)
 *   referensi/  → gambar referensi untuk request custom keychain
 *
 * Keduanya sengaja dipisah dari `public/testimoni/` supaya mudah dibedakan
 * dan bisa dibersihkan per jenis tanpa menyentuh yang lain.
 */
export const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export const BUKTI_DIR = path.join(UPLOAD_ROOT, "bukti");
export const REFERENSI_DIR = path.join(UPLOAD_ROOT, "referensi");

/** Prefix URL publik, mis. `/uploads/bukti/...`. */
export const UPLOAD_URL_PREFIX = "/uploads";

/** Batas ukuran berkas: 5 MB. Cukup untuk foto struk / screenshot referensi. */
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
  /** Nama berkas saja, disimpan di kolom database. */
  fileName: string;
  /** URL publik siap pakai, mis. `/uploads/bukti/bukti-....jpg`. */
  url: string;
  bytes: number;
}

/**
 * Simpan berkas unggahan ke subfolder `public/uploads/<folder>/`.
 *
 * Nama berkas dibuat sendiri (`<prefix>-<timestamp>-<uuid8>.<ext>`) sehingga
 * nama dari browser tidak pernah dipakai langsung — mencegah path traversal
 * (`../../`), tabrakan nama, dan nama berkas berisi karakter aneh.
 */
export async function saveUpload(
  file: File,
  folder: "bukti" | "referensi"
): Promise<SavedUpload> {
  if (file.size === 0) {
    throw new Error("Berkas kosong.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(
      `Ukuran gambar maksimal ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB.`
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const head = new Uint8Array(buffer.subarray(0, 12));

  const match = ALLOWED_TYPES.find((t) => t.test(head));
  if (!match) {
    throw new Error("Format gambar harus JPG, PNG, WEBP, atau GIF.");
  }

  const stamp = Date.now();
  const rand = randomUUID().replace(/-/g, "").slice(0, 8);
  const fileName = `${folder}-${stamp}-${rand}.${match.ext}`;

  const dir = path.join(UPLOAD_ROOT, folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), buffer);

  return {
    fileName,
    url: `${UPLOAD_URL_PREFIX}/${folder}/${fileName}`,
    bytes: buffer.length,
  };
}

/**
 * Hapus berkas unggahan.
 *
 * Hanya nama berkas yang diterima, dan `path.basename` dipakai lagi sebagai
 * pengaman terakhir agar tidak ada yang bisa menghapus berkas di luar folder
 * unggahan.
 */
export async function deleteUpload(
  fileName: string,
  folder: "bukti" | "referensi"
): Promise<void> {
  const safe = path.basename(fileName.trim());
  if (!safe || safe === "." || safe === "..") return;

  try {
    await fs.unlink(path.join(UPLOAD_ROOT, folder, safe));
  } catch {
    /* Berkas mungkin sudah tidak ada — anggap berhasil. */
  }
}

/** Ambil nama berkas dari nilai yang mungkin berupa URL penuh. */
export function fileNameOf(value: string): string {
  const clean = value.split("?")[0].split("/").pop() ?? "";
  return path.basename(clean);
}

/**
 * Ubah nilai kolom database menjadi URL publik.
 * Mendukung nilai lama yang mungkin masih berupa URL penuh atau path absolut.
 */
export function uploadUrl(value: string, folder: "bukti" | "referensi"): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  if (value.startsWith("/")) return value;
  return `${UPLOAD_URL_PREFIX}/${folder}/${value}`;
}
