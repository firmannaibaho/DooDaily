import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { testimonialQueries } from "@/lib/db";
import {
  saveUpload,
  deleteUpload,
  uploadUrl,
  MAX_IMAGE_BYTES,
} from "@/lib/upload-storage";

/**
 * Validasi & normalisasi input teks dari form admin.
 *
 * Catatan: testimoni TIDAK memakai rating — cukup gambar dan cerita pembeli.
 */
function parseFields(form: FormData) {
  const rawSort = Number(form.get("sort_order") ?? 0);

  return {
    customer_name: String(form.get("customer_name") ?? "").trim(),
    product_name: String(form.get("product_name") ?? "").trim(),
    message: String(form.get("message") ?? "").trim(),
    sort_order: Number.isFinite(rawSort) ? Math.round(rawSort) : 0,
    is_published: String(form.get("is_published") ?? "true") === "true",
  };
}

/**
 * GET: Daftar testimoni.
 *   Admin    → semua (termasuk draft), dipakai panel admin.
 *   Publik   → hanya yang sudah terbit.
 */
export async function GET() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const testimonialList = isAdmin
    ? await testimonialQueries.findAll()
    : await testimonialQueries.findPublished();

  return NextResponse.json({
    testimonials: testimonialList.map((t) => ({
      ...t,
      image_path: t.image_path ?? "",
      image_url: uploadUrl(t.image_path ?? "", "testimoni"),
    })),
  });
}

/**
 * POST: Tambah testimoni (admin saja).
 *
 * Body berupa multipart/form-data berisi data teks + berkas gambar WAJIB.
 * Gambar diunggah admin (bebas: foto produk, keychain, atau lain-lain) dan
 * disimpan ke `public/testimoni/`.
 */
export async function POST(request: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    return NextResponse.json({ message: "Silakan login." }, { status: 401 });
  }
  if (role !== "admin") {
    return NextResponse.json(
      { message: "Hanya admin yang dapat menambah testimoni." },
      { status: 403 }
    );
  }

  const userId = Number((session.user as { id?: string }).id);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Format formulir tidak valid." },
      { status: 400 }
    );
  }

  const fields = parseFields(form);
  if (!fields.customer_name) {
    return NextResponse.json({ message: "Nama pembeli wajib diisi." }, { status: 400 });
  }
  // `message` sengaja TIDAK diwajibkan: screenshot/foto biasanya sudah memuat
  // isi percakapan, jadi admin boleh membiarkannya kosong.

  // Gambar testimoni WAJIB diunggah.
  const image = form.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json(
      { message: "Gambar testimoni wajib diunggah." },
      { status: 400 }
    );
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { message: "Ukuran gambar maksimal 5 MB." },
      { status: 400 }
    );
  }

  let imagePath = "";
  try {
    const saved = await saveUpload(image, "testimoni");
    imagePath = saved.path;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menyimpan gambar.";
    return NextResponse.json({ message }, { status: 400 });
  }

  try {
    const created = await testimonialQueries.create(
      { ...fields, image_path: imagePath },
      userId
    );
    return NextResponse.json(
      {
        message: "Testimoni ditambahkan.",
        testimonial: { ...created, image_url: uploadUrl(created.image_path, "testimoni") },
      },
      { status: 201 }
    );
  } catch (error) {
    // Jangan tinggalkan berkas yatim bila penyimpanan ke database gagal.
    if (imagePath) await deleteUpload(imagePath, "testimoni");
    console.error("Create testimonial error:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan testimoni." },
      { status: 500 }
    );
  }
}
