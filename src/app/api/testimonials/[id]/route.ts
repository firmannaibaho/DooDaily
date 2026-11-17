import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { testimonialQueries } from "@/lib/db";
import {
  saveTestimoniImage,
  deleteTestimoniImage,
  fileNameOf,
  testimonialImageUrl,
  MAX_IMAGE_BYTES,
} from "@/lib/testimonial-storage";

/** Hanya admin. Mengembalikan userId atau null bila tidak berhak. */
async function requireAdminId(): Promise<number | null> {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user || user.role !== "admin") return null;
  return Number(user.id);
}

/**
 * PATCH: Ubah testimoni (admin saja).
 *
 * Mendukung dua bentuk body:
 *   - multipart/form-data → boleh menyertakan `image` baru; gambar lama dihapus.
 *   - application/json    → ubah teks saja (mis. toggle terbit / urutan).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await requireAdminId();
  if (adminId === null) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  }

  const existing = (await testimonialQueries.findAll()).find((t) => t.id === id);
  if (!existing) {
    return NextResponse.json({ message: "Testimoni tidak ditemukan." }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const updates: Record<string, unknown> = {};
  let newImageFile: File | null = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();

      for (const key of ["customer_name", "product_name", "message"]) {
        const value = form.get(key);
        if (value !== null) updates[key] = String(value).trim();
      }

      const ratingRaw = form.get("rating");
      if (ratingRaw !== null) {
        const r = Number(ratingRaw);
        updates.rating = Number.isFinite(r) ? Math.min(5, Math.max(1, Math.round(r))) : 5;
      }

      const sortRaw = form.get("sort_order");
      if (sortRaw !== null) {
        const s = Number(sortRaw);
        updates.sort_order = Number.isFinite(s) ? Math.round(s) : 0;
      }

      const publishedRaw = form.get("is_published");
      if (publishedRaw !== null) updates.is_published = String(publishedRaw) === "true";

      const image = form.get("image");
      if (image instanceof File && image.size > 0) {
        if (image.size > MAX_IMAGE_BYTES) {
          return NextResponse.json(
            { message: "Ukuran gambar maksimal 5 MB." },
            { status: 400 }
          );
        }
        newImageFile = image;
      }
    } else {
      const body = (await request.json()) as Record<string, unknown>;
      if (typeof body.customer_name === "string") updates.customer_name = body.customer_name.trim();
      if (typeof body.product_name === "string") updates.product_name = body.product_name.trim();
      if (typeof body.message === "string") updates.message = body.message.trim();
      if (typeof body.sort_order === "number") updates.sort_order = Math.round(body.sort_order);
      if (typeof body.is_published === "boolean") updates.is_published = body.is_published;
    }
  } catch {
    return NextResponse.json({ message: "Body tidak valid." }, { status: 400 });
  }

  if (updates.customer_name === "") {
    return NextResponse.json(
      { message: "Nama pembeli tidak boleh kosong." },
      { status: 400 }
    );
  }

  // Ganti gambar bila ada berkas baru.
  if (newImageFile) {
    try {
      const saved = await saveTestimoniImage(newImageFile, "testimoni");
      updates.image_path = saved.fileName;
      if (existing.image_path) await deleteTestimoniImage(fileNameOf(existing.image_path));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menyimpan gambar.";
      return NextResponse.json({ message }, { status: 400 });
    }
  }

  try {
    const updated = await testimonialQueries.update(id, updates);
    return NextResponse.json({
      message: "Testimoni diperbarui.",
      testimonial: updated
        ? { ...updated, image_url: testimonialImageUrl(updated.image_path) }
        : null,
    });
  } catch (error) {
    console.error("Update testimonial error:", error);
    return NextResponse.json({ message: "Gagal memperbarui testimoni." }, { status: 500 });
  }
}

/**
 * DELETE: Hapus testimoni beserta berkas gambarnya (admin saja).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await requireAdminId();
  if (adminId === null) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  }

  const existing = (await testimonialQueries.findAll()).find((t) => t.id === id);
  if (!existing) {
    return NextResponse.json({ message: "Testimoni tidak ditemukan." }, { status: 404 });
  }

  try {
    await testimonialQueries.remove(id);
    // Hapus berkas setelah baris database benar-benar terhapus.
    if (existing.image_path) await deleteTestimoniImage(fileNameOf(existing.image_path));
    return NextResponse.json({ message: "Testimoni dihapus." });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    return NextResponse.json({ message: "Gagal menghapus testimoni." }, { status: 500 });
  }
}
