/**
 * Helper validasi & kepemilikan untuk route chat.
 * Dipisah agar logika yang sama tidak ditulis berulang di 6 route.
 */

import { chatQueries, orderQueries } from "./db";
import { HttpError, forbidden, userIdOf, type SessionUser } from "./api-guard";
import type { ChatKind, ChatThread } from "./chat-types";

/** Validasi parameter `[threadId]` dari URL. */
export function parseThreadId(raw: string | undefined): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "ID percakapan tidak valid");
  }
  return id;
}

/** Validasi nilai `kind` dari body/query. */
export function parseChatKind(raw: unknown): ChatKind {
  if (raw === "general" || raw === "cart" || raw === "order") return raw;
  throw new HttpError(400, "Jenis percakapan tidak valid");
}

/**
 * Pastikan thread ada dan milik user yang sedang login.
 * Admin boleh membuka thread mana pun.
 */
export async function assertThreadAccess(
  threadId: number,
  user: SessionUser
): Promise<ChatThread> {
  const thread = await chatQueries.findThreadById(threadId);
  if (!thread) throw new HttpError(404, "Percakapan tidak ditemukan");

  const isAdmin = user.role === "admin";
  const isOwner = thread.user_id === userIdOf(user);

  if (!isAdmin && !isOwner) throw forbidden();
  return thread;
}

/**
 * Pastikan pesanan ada dan milik user (atau user adalah admin).
 * Mengembalikan thread pesanan (dibuat bila belum ada).
 */
export async function openOrderThread(user: SessionUser, orderId: string): Promise<ChatThread> {
  const order = await orderQueries.findByOrderId(orderId);
  if (!order) throw new HttpError(404, "Pesanan tidak ditemukan");

  const isAdmin = user.role === "admin";
  if (order.user_id === null || order.user_id === undefined) {
    throw new HttpError(
      400,
      "Pesanan ini dibuat tanpa akun. Silakan login dengan akun yang sama saat memesan."
    );
  }

  const ownerId = Number(order.user_id);
  if (!isAdmin && ownerId !== userIdOf(user)) throw forbidden();

  return chatQueries.getOrCreateOrderThread(ownerId, orderId);
}
