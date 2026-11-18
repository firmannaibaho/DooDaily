import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { orderQueries } from "@/lib/db";
import {
  saveUpload,
  deleteUpload,
  fileNameOf,
  uploadUrl,
  MAX_IMAGE_BYTES,
} from "@/lib/upload-storage";

/**
 * POST: Unggah bukti pembayaran untuk satu pesanan (step 3 checkout).
 *
 * ATURAN AKSES: hanya PEMILIK pesanan (admin boleh juga, untuk koreksi).
 * Kenapa harus pemilik: bukti bayar adalah dokumen pribadi; kalau terbuka,
 * siapa pun yang menebak `order_id` bisa menimpa bukti milik orang lain.
 *
 * Body: multipart/form-data dengan field `image`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ order_id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Silakan login." }, { status: 401 });
  }

  const { order_id } = await params;
  if (!order_id) {
    return NextResponse.json({ message: "order_id wajib diisi." }, { status: 400 });
  }

  const order = await orderQueries.findByOrderId(order_id);
  if (!order) {
    return NextResponse.json({ message: "Pesanan tidak ditemukan." }, { status: 404 });
  }

  const sessionUser = session.user as { id?: string; role?: string | null };
  const isAdmin = sessionUser.role === "admin";
  const userId = Number(sessionUser.id);

  // Selain admin, hanya pemilik pesanan. 404 dipakai agar tidak membocorkan
  // bahwa order_id tersebut valid.
  if (!isAdmin && Number(order.user_id) !== userId) {
    return NextResponse.json({ message: "Pesanan tidak ditemukan." }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "Format formulir tidak valid." }, { status: 400 });
  }

  const image = form.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json(
      { message: "Pilih file bukti pembayaran terlebih dahulu." },
      { status: 400 }
    );
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ message: "Ukuran gambar maksimal 5 MB." }, { status: 400 });
  }

  let saved: { fileName: string; url: string };
  try {
    saved = await saveUpload(image, "bukti");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menyimpan gambar.";
    return NextResponse.json({ message }, { status: 400 });
  }

  try {
    const lama = order.payment_proof ?? "";
    await orderQueries.updatePaymentProof(order_id, saved.fileName);

    // Hapus bukti lama setelah baris database berhasil diperbarui, supaya
    // tidak ada berkas yatim bila update gagal.
    if (lama) await deleteUpload(fileNameOf(lama), "bukti");

    return NextResponse.json(
      {
        message: "Bukti pembayaran terunggah.",
        payment_proof: saved.fileName,
        payment_proof_url: uploadUrl(saved.fileName, "bukti"),
      },
      { status: 201 }
    );
  } catch (error) {
    // Jangan tinggalkan berkas tanpa pemilik bila database gagal.
    await deleteUpload(saved.fileName, "bukti");
    console.error("Upload bukti error:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan bukti pembayaran." },
      { status: 500 }
    );
  }
}
