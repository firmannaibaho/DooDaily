/**
 * /api/chat/admin/threads/[threadId]
 *
 * GET   → riwayat pesan (+ ?after=<id>)
 * POST  → balas sebagai admin { body }
 * PATCH → { read?: true } tandai dibaca · { status: "open"|"closed" } ubah status
 *
 * Semua wajib admin.
 */

import { NextResponse } from "next/server";
import { HttpError, requireAdmin, userIdOf, withErrorHandling } from "@/lib/api-guard";
import { parseThreadId } from "@/lib/chat-access";
import { checkChatRateLimit } from "@/lib/chat-rate-limit";
import { chatQueries } from "@/lib/db";
import { sanitizeChatBody } from "@/lib/chat-types";

type Context = { params: Promise<{ threadId: string }> };

export const GET = withErrorHandling(async (request: Request, context: Context) => {
  await requireAdmin();

  const { threadId: rawId } = await context.params;
  const threadId = parseThreadId(rawId);

  const thread = await chatQueries.findThreadById(threadId);
  if (!thread) throw new HttpError(404, "Percakapan tidak ditemukan");

  const afterRaw = new URL(request.url).searchParams.get("after");
  const afterId = afterRaw !== null ? Number(afterRaw) : undefined;

  const messages = await chatQueries.listMessages(threadId, {
    afterId: Number.isFinite(afterId) ? afterId : undefined,
  });

  return NextResponse.json({ thread, messages });
});

export const POST = withErrorHandling(async (request: Request, context: Context) => {
  const admin = await requireAdmin();

  const { threadId: rawId } = await context.params;
  const threadId = parseThreadId(rawId);

  const thread = await chatQueries.findThreadById(threadId);
  if (!thread) throw new HttpError(404, "Percakapan tidak ditemukan");
  if (thread.status === "closed") throw new HttpError(409, "Percakapan sudah ditutup.");

  const payload = (await request.json().catch(() => null)) as { body?: unknown } | null;
  const body = sanitizeChatBody(typeof payload?.body === "string" ? payload.body : "");

  if (!body) throw new HttpError(400, "Pesan tidak boleh kosong");
  if (body.length > 2000) throw new HttpError(400, "Pesan terlalu panjang (maks 2000 karakter)");

  const limit = checkChatRateLimit(`admin:${userIdOf(admin)}`);
  if (!limit.allowed) {
    throw new HttpError(429, `Terlalu cepat. Tunggu ${limit.retryAfterSeconds} detik lagi.`);
  }

  const message = await chatQueries.sendMessage(threadId, userIdOf(admin), "admin", body);

  return NextResponse.json({ message }, { status: 201 });
});

export const PATCH = withErrorHandling(async (request: Request, context: Context) => {
  await requireAdmin();

  const { threadId: rawId } = await context.params;
  const threadId = parseThreadId(rawId);

  const thread = await chatQueries.findThreadById(threadId);
  if (!thread) throw new HttpError(404, "Percakapan tidak ditemukan");

  const payload = (await request.json().catch(() => null)) as {
    read?: unknown;
    status?: unknown;
  } | null;

  if (payload?.read === true) {
    await chatQueries.markRead(threadId, "admin");
  }

  if (payload?.status === "open" || payload?.status === "closed") {
    await chatQueries.setThreadStatus(threadId, payload.status);
  }

  return NextResponse.json({ ok: true });
});
