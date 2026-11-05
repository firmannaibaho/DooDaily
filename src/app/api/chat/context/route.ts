/**
 * POST /api/chat/context
 *
 * Membuka (atau membuat) percakapan sesuai konteks.
 * Body:
 *   { kind: "general" }
 *   { kind: "cart" }
 *   { kind: "order", order_id: "DDL-..." }
 *
 * Respons: { thread, messages }
 */

import { NextResponse } from "next/server";
import { HttpError, requireUser, userIdOf, withErrorHandling } from "@/lib/api-guard";
import { openOrderThread, parseChatKind } from "@/lib/chat-access";
import { chatQueries } from "@/lib/db";

export const POST = withErrorHandling(async (request: Request) => {
  const user = await requireUser();

  const payload = (await request.json().catch(() => null)) as {
    kind?: unknown;
    order_id?: unknown;
  } | null;

  const kind = parseChatKind(payload?.kind);

  let thread;
  if (kind === "order") {
    const orderId = typeof payload?.order_id === "string" ? payload.order_id.trim() : "";
    if (!orderId) throw new HttpError(400, "order_id wajib diisi untuk chat pesanan");
    thread = await openOrderThread(user, orderId);
  } else {
    thread = await chatQueries.getOrCreateThread(userIdOf(user), kind);
  }

  const messages = await chatQueries.listMessages(thread.id);

  return NextResponse.json({ thread, messages }, { status: 200 });
});
