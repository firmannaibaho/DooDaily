import { NextResponse } from "next/server";
import { HttpError, requireUser, userIdOf, withErrorHandling } from "@/lib/api-guard";
import { keychainQueries } from "@/lib/db";
import { cleanText } from "@/lib/keychain-types";

type Context = { params: Promise<{ token: string }> };

/**
 * PATCH /api/keychains/[token]
 * Pemilik tag QR mengedit informasi keychain atau menandai laporan penemuan sudah dibaca.
 */
export const PATCH = withErrorHandling(async (request: Request, context: Context) => {
  const user = await requireUser();
  const { token } = await context.params;

  const tag = await keychainQueries.findByToken(token);
  if (!tag) throw new HttpError(404, "Tag QR tidak ditemukan.");
  if (Number(tag.user_id) !== userIdOf(user)) {
    throw new HttpError(403, "Anda tidak berhak mengubah tag QR ini.");
  }

  const payload = (await request.json().catch(() => null)) as {
    display_title?: unknown;
    owner_message?: unknown;
    contact_info?: unknown;
    show_contact?: unknown;
    is_lost?: unknown;
    mark_read?: unknown;
  } | null;

  if (payload?.mark_read === true) {
    await keychainQueries.markReportsRead(tag.id);
  }

  const hasEdit =
    payload &&
    ("display_title" in payload ||
      "owner_message" in payload ||
      "contact_info" in payload ||
      "show_contact" in payload ||
      "is_lost" in payload);

  if (!hasEdit) {
    return NextResponse.json({ tag });
  }

  const updated = await keychainQueries.updateInfo(token, {
    display_title: cleanText(payload?.display_title ?? tag.display_title, 100),
    owner_message: cleanText(payload?.owner_message ?? tag.owner_message, 500),
    contact_info: cleanText(payload?.contact_info ?? tag.contact_info, 100),
    show_contact:
      typeof payload?.show_contact === "boolean" ? payload.show_contact : tag.show_contact,
    is_lost: typeof payload?.is_lost === "boolean" ? payload.is_lost : tag.is_lost,
  });

  return NextResponse.json({ tag: updated });
});
