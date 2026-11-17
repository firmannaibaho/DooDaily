import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Folder penyimpanan gambar testimoni.
 *
 * Berada SEJAJAR dengan `public/catalog/` (folder gambar shop) tetapi terpisah,
 * supaya aset testimoni mudah dibedakan dan tidak tercampur dengan foto produk.
 */
export const TESTIMONI_DIR = path.join(process.cwd(), "public", "testimoni");

/** Prefix URL publik untuk gambar testimoni. */
export const TESTIMONI_URL_PREFIX = "/testimoni";

/** Batas ukuran berkas: 5 MB. Cukup untuk gambar testimoni dari ponsel. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * Ekstensi yang diizinkan → tipe MIME yang sah.
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
    // "RIFF" .... "WEBP"
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

export interface SavedImage {
  /** Nama berkas saja, disimpan di kolom `image_path`. */
  fileName: string;
  /** URL publik siap pakai, mis. `/testimoni/testimoni-....jpg`. */
  url: string;
  bytes: number;
}

/**
 * Simpan gambar unggahan ke `public/testimoni/`.
 *
 * Nama berkas dibuat sendiri (`<prefix>-<timestamp>-<uuid8>.<ext>`) sehingga
 * nama dari browser tidak pernah dipakai langsung — mencegah path traversal
 * (`../../`), tabrakan nama, dan nama berkas berisi karakter aneh.
 */
export async function saveTestimoniImage(
  file: File,
  prefix = "testimoni"
): Promise<SavedImage> {
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
  const fileName = `${prefix}-${stamp}-${rand}.${match.ext}`;

  await fs.mkdir(TESTIMONI_DIR, { recursive: true });
  await fs.writeFile(path.join(TESTIMONI_DIR, fileName), buffer);

  return { fileName, url: `${TESTIMONI_URL_PREFIX}/${fileName}`, bytes: buffer.length };
}

/**
 * Hapus gambar dari `public/testimoni/`.
 *
 * Hanya nama berkas yang diterima, dan hasil `path.basename` dipakai lagi
 * sebagai pengaman terakhir agar tidak ada yang bisa menghapus berkas di luar
 * folder testimoni (mis. gambar shop di `public/catalog/`).
 */
export async function deleteTestimoniImage(fileName: string): Promise<void> {
  const safe = path.basename(fileName.trim());
  if (!safe || safe === "." || safe === "..") return;

  try {
    await fs.unlink(path.join(TESTIMONI_DIR, safe));
  } catch {
    /* Berkas mungkin sudah tidak ada — anggap berhasil. */
  }
}

/** Ambil nama berkas dari `image_path` (mendukung nilai berupa URL penuh). */
export function fileNameOf(imagePath: string): string {
  const clean = imagePath.split("?")[0].split("/").pop() ?? "";
  return path.basename(clean);
}

/** Ubah `image_path` dari database menjadi URL publik. */
export function testimonialImageUrl(imagePath: string): string {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  if (imagePath.startsWith("/")) return imagePath;
  return `${TESTIMONI_URL_PREFIX}/${imagePath}`;
}
