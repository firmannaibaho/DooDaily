import { NextResponse } from "next/server";
import { HttpError, withErrorHandling } from "@/lib/api-guard";
import { checkChatRateLimit } from "@/lib/chat-rate-limit";
import { keychainQueries } from "@/lib/db";
import { cleanText } from "@/lib/keychain-types";

/**
 * POST /api/keychains/public
 * Form publik "Saya Menemukan Keychain Ini" setelah scan QR (tanpa login).
 */
export const POST = withErrorHandling(async (request: Request) => {
  const payload = (await request.json().catch(() => null)) as {
    token?: unknown;
    finder_name?: unknown;
    finder_contact?: unknown;
    found_location?: unknown;
    notes?: unknown;
    website?: unknown; // honeypot anti-bot
  } | null;

  // Bot mengisi field tersembunyi → balas sukses palsu tanpa menyimpan spam.
  if (typeof payload?.website === "string" && payload.website.trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const token = cleanText(payload?.token, 40);
  if (!token) throw new HttpError(400, "Kode QR tidak valid.");

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anon";
  const limit = checkChatRateLimit(`finder:${ip}:${token}`);
  if (!limit.allowed) {
    throw new HttpError(429, `Terlalu banyak percobaan. Tunggu ${limit.retryAfterSeconds} detik.`);
  }

  const tag = await keychainQueries.findByToken(token);
  if (!tag) throw new HttpError(404, "Keychain tidak ditemukan.");

  const finder_name = cleanText(payload?.finder_name, 80);
  const finder_contact = cleanText(payload?.finder_contact, 100);
  const found_location = cleanText(payload?.found_location, 200);
  const notes = cleanText(payload?.notes, 500);

  if (!finder_name || !finder_contact || !found_location) {
    throw new HttpError(400, "Nama, kontak, dan lokasi temuan wajib diisi.");
  }

  await keychainQueries.createReport(tag.id, {
    finder_name,
    finder_contact,
    found_location,
    notes,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
});
