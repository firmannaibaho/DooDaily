import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUpload, MAX_IMAGE_BYTES } from "@/lib/upload-storage";

/**
 * POST: Unggah gambar referensi untuk request custom keychain.
 *
 * WAJIB LOGIN. Kenapa: berkas yang tersimpan menempati disk server, jadi
 * membiarkannya terbuka untuk anonim berarti siapa pun bisa memenuhi disk.
 * Halaman /customize boleh dibuka tanpa login, tapi menekan tombol
 * "Masukkan Keranjang" akan meminta login lebih dulu.
 *
 * Body: multipart/form-data dengan field `image`.
 * Balasan: { url, fileName, bytes } — `url` yang disimpan di keranjang.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { message: "Silakan login dulu untuk mengunggah gambar referensi." },
      { status: 401 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Format formulir tidak valid." },
      { status: 400 }
    );
  }

  const image = form.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json(
      { message: "Pilih gambar referensi terlebih dahulu." },
      { status: 400 }
    );
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { message: "Ukuran gambar maksimal 5 MB." },
      { status: 400 }
    );
  }

  try {
    const saved = await saveUpload(image, "referensi");
    return NextResponse.json(
      { message: "Gambar referensi terunggah.", ...saved },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menyimpan gambar.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
