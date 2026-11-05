/**
 * GET /api/chat/threads
 * Daftar percakapan milik user yang sedang login.
 */

import { NextResponse } from "next/server";
import { requireUser, userIdOf, withErrorHandling } from "@/lib/api-guard";
import { chatQueries } from "@/lib/db";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const threads = await chatQueries.listThreadsForUser(userIdOf(user));

  return NextResponse.json({ threads });
});
