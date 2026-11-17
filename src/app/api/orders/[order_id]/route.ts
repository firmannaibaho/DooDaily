import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { orderQueries } from "@/lib/db";

/**
 * GET: Ambil satu pesanan berdasarkan `order_id` pada path.
 *
 * KENAPA ADA:
 * Sebelumnya `/order-success` membaca nama, total, dan metode bayar dari query
 * string. Data itu bisa diubah siapa saja sehingga halaman sukses dapat dipalsukan.
 * Endpoint ini menjadikan server sebagai sumber kebenaran: halaman sukses cukup
 * mengirim `order_id`, sisanya diambil dari database.
 *
 * ATURAN AKSES:
 *   Admin   → boleh melihat semua pesanan.
 *   User    → hanya pesanan miliknya sendiri (user_id cocok).
 *   Lainnya → 404, bukan 403. Alasannya: 403 pada order_id yang ada akan
 *             membocorkan bahwa ID tersebut valid. 404 tidak membocorkan apa pun.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ order_id: string }> }
) {
  const { order_id } = await params;

  if (!order_id) {
    return NextResponse.json({ message: "order_id wajib diisi" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { message: "Silakan login untuk melihat pesanan." },
      { status: 401 }
    );
  }

  const sessionUser = session.user as { id?: string; role?: string | null };
  const isAdmin = sessionUser.role === "admin";
  const userId = Number(sessionUser.id);

  const order = await orderQueries.findByOrderId(order_id);
  if (!order) {
    return NextResponse.json({ message: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  // Selain admin, hanya pemilik pesanan yang boleh melihat.
  if (!isAdmin && Number(order.user_id) !== userId) {
    return NextResponse.json({ message: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(request: Request) {
  const session = await auth();
  const patchUser = session?.user as { role?: string | null } | undefined;
  if (!session?.user || patchUser?.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const data = await request.json();
  const { order_id, status, result_image, admin_notes } = data;

  if (!order_id) {
    return NextResponse.json({ message: "Missing order_id" }, { status: 400 });
  }

  // Update status jika dikirim
  if (status) {
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "done", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }
    await orderQueries.updateStatus(status, order_id);
  }

  // Update foto hasil custom / catatan admin jika ada
  if (result_image !== undefined || admin_notes !== undefined) {
    await orderQueries.updateResult(order_id, result_image || "", admin_notes || "");
  }

  return NextResponse.json({
    message: "Pesanan berhasil diperbarui",
    order_id,
    status,
    result_image,
    admin_notes,
  });
}
