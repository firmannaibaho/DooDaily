/**
 * GET /api/chat/admin/threads
 * Daftar semua percakapan untuk panel admin.
 * Query opsional: ?kind=general|cart|order & ?status=open|closed
 */

import { NextResponse } from "next/server";
import { requireAdmin, withErrorHandling } from "@/lib/api-guard";
import { chatQueries } from "@/lib/db";
import type { ChatKind, ChatThreadStatus } from "@/lib/chat-types";

const KINDS: ChatKind[] = ["general", "cart", "order"];
const STATUSES: ChatThreadStatus[] = ["open", "closed"];

export const GET = withErrorHandling(async (request: Request) => {
  await requireAdmin();

  const params = new URL(request.url).searchParams;
  const rawKind = params.get("kind");
  const rawStatus = params.get("status");

  const kind = rawKind && KINDS.includes(rawKind as ChatKind) ? (rawKind as ChatKind) : undefined;
  const status =
    rawStatus && STATUSES.includes(rawStatus as ChatThreadStatus)
      ? (rawStatus as ChatThreadStatus)
      : undefined;

  const threads = await chatQueries.listThreadsForAdmin({ kind, status });

  return NextResponse.json({ threads });
});
