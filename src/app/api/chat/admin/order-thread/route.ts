/**
 * POST /api/chat/admin/order-thread
 *
 * Membuka (atau MEMBUAT) percakapan pesanan dari sisi admin.
 *
 * KENAPA ADA:
 * Tombol "Chat" pada halaman pesanan admin tidak boleh sekadar membuka
 * /admin/chat. Bila pembeli belum pernah mengirim pesan, thread untuk pesanan
 * itu belum ada sehingga halaman chat tampak kosong dan admin buntu. Endpoint
 * ini memastikan thread-nya ada lebih dulu, lalu mengembalikan `thread_id`
 * agar halaman chat bisa langsung membukanya.
 *
 * Body: { order_id: "DDL-..." }
 */
import { NextResponse } from "next/server";
import { HttpError, requireAdmin, userIdOf, withErrorHandling } from "@/lib/api-guard";
import { chatQueries, orderQueries } from "@/lib/db";

export const POST = withErrorHandling(async (request: Request) => {
  const admin = await requireAdmin();

  const payload = (await request.json().catch(() => null)) as { order_id?: unknown } | null;
  const orderId = typeof payload?.order_id === "string" ? payload.order_id.trim() : "";
  if (!orderId) throw new HttpError(400, "order_id wajib diisi");

  const order = await orderQueries.findByOrderId(orderId);
  if (!order) throw new HttpError(404, "Pesanan tidak ditemukan");

  // Pesanan tanpa akun tidak punya jaminan "siapa pembelinya" di sistem chat.
  if (order.user_id === null || order.user_id === undefined) {
    throw new HttpError(
      400,
      "Pesanan ini dibuat tanpa akun, jadi tidak punya chat in-app. Hubungi pembeli lewat WhatsApp."
    );
  }

  const thread = await chatQueries.getOrCreateOrderThread(Number(order.user_id), orderId);

  // Pesan pembuka dari admin supaya pembeli tahu percakapan sudah dimulai.
  const messages = await chatQueries.listMessages(thread.id);
  if (messages.length === 0) {
    await chatQueries.sendMessage(
      thread.id,
      userIdOf(admin),
      "admin",
      `Halo kak ${order.customer_name}! Admin Doodaily Art di sini. Ada yang bisa kami bantu soal pesanan ${orderId}? 😊`
    );
  }

  return NextResponse.json({ thread_id: thread.id, order_id: orderId }, { status: 200 });
});
