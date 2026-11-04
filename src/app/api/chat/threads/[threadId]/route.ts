/**
 * /api/chat/threads/[threadId]
 *
 * GET   → riwayat pesan (+ ?after=<id> untuk polling pesan baru)
 * POST  → kirim pesan { body }
 * PATCH → tandai pesan admin sudah dibaca
 *
 * Semua akses divalidasi kepemilikannya lewat assertThreadAccess().
 */

import { NextResponse } from "next/server";
import {
  HttpError,
  requireUser,
  userIdOf,
  withErrorHandling,
} from "@/lib/api-guard";
import { assertThreadAccess, parseThreadId } from "@/lib/chat-access";
import { checkChatRateLimit } from "@/lib/chat-rate-limit";
import { chatQueries } from "@/lib/db";
import { sanitizeChatBody } from "@/lib/chat-types";

type Context = { params: Promise<{ threadId: string }> };

export const GET = withErrorHandling(async (request: Request, context: Context) => {
  const user = await requireUser();
  const { threadId: rawId } = await context.params;

  const thread = await assertThreadAccess(parseThreadId(rawId), user);

  const afterRaw = new URL(request.url).searchParams.get("after");
  const afterId = afterRaw !== null ? Number(afterRaw) : undefined;

  const messages = await chatQueries.listMessages(thread.id, {
    afterId: Number.isFinite(afterId) ? afterId : undefined,
  });

  return NextResponse.json({ thread, messages });
});

export const POST = withErrorHandling(async (request: Request, context: Context) => {
  const user = await requireUser();
  const { threadId: rawId } = await context.params;

  const thread = await assertThreadAccess(parseThreadId(rawId), user);

  if (thread.status === "closed") {
    throw new HttpError(409, "Percakapan ini sudah ditutup admin.");
  }

  const payload = (await request.json().catch(() => null)) as { body?: unknown } | null;
  const body = sanitizeChatBody(typeof payload?.body === "string" ? payload.body : "");

  if (!body) throw new HttpError(400, "Pesan tidak boleh kosong");
  if (body.length > 2000) throw new HttpError(400, "Pesan terlalu panjang (maks 2000 karakter)");

  const limit = checkChatRateLimit(`user:${userIdOf(user)}`);
  if (!limit.allowed) {
    throw new HttpError(429, `Terlalu cepat. Tunggu ${limit.retryAfterSeconds} detik lagi.`);
  }

  const message = await chatQueries.sendMessage(thread.id, userIdOf(user), "user", body);

  return NextResponse.json({ message }, { status: 201 });
});

export const PATCH = withErrorHandling(async (_request: Request, context: Context) => {
  const user = await requireUser();
  const { threadId: rawId } = await context.params;

  const thread = await assertThreadAccess(parseThreadId(rawId), user);
  await chatQueries.markRead(thread.id, "user");

  return NextResponse.json({ ok: true });
});
