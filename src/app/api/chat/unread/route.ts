/**
 * GET /api/chat/unread
 *
 * Jumlah pesan belum dibaca untuk user yang login.
 * Admin mendapat total seluruh percakapan.
 * Dipakai badge di Navbar (polling 15 detik).
 */

import { NextResponse } from "next/server";
import { requireUser, userIdOf, withErrorHandling } from "@/lib/api-guard";
import { chatQueries } from "@/lib/db";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const count =
    user.role === "admin"
      ? await chatQueries.getUnreadForAdmin()
      : await chatQueries.getUnreadForUser(userIdOf(user));

  return NextResponse.json({ count });
});
