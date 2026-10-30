/**
 * POST /api/ai/keychain
 *
 * Proxy generate gambar keychain. API key HANYA ada di server.
 * Model, ukuran, dan jumlah gambar dikunci (tidak bisa diubah client).
 *
 * Body: { description: string, presetId: string }
 * Respon: { ok: true, image: string /* data URI *\/, presetId, elapsedMs }
 */

import { buildKeychainPrompt } from "@/lib/ai/prompt-builder";
import { MAX_DESCRIPTION_LENGTH } from "@/lib/ai/prompt-builder";

// Dikunci di server sesuai permintaan: ukuran tertinggi, 1 gambar.
const MODEL = "ig";
const SIZE = "1024x1024";
const COUNT = 1;

/**
 * Total waktu maksimum untuk SATU permintaan user, termasuk retry saat
 * kena rate limit. Layanan membatasi 2 generate/menit, jadi request
 * ditahan & dicoba ulang sampai 5 menit sebelum menyerah.
 */
const TOTAL_BUDGET_MS = 5 * 60 * 1000;
/** Batas satu percobaan ke upstream (generate normal ±15–30 dtk). */
const ATTEMPT_TIMEOUT_MS = 240_000;
/** Jeda dasar saat kena 429; diambil dari pesan upstream bila ada. */
const DEFAULT_RETRY_MS = 30_000;
/** Jeda maksimum supaya tidak menunggu terlalu lama dalam satu putaran. */
const MAX_RETRY_WAIT_MS = 65_000;

const NO_STORE = { "Cache-Control": "no-store" };

type ErrorBody = {
  ok: false;
  code: string;
  message: string;
 };

function fail(code: string, message: string, status: number) {
  return Response.json({ ok: false, code, message } satisfies ErrorBody, { status, headers: NO_STORE });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Ambil saran waktu tunggu dari pesan upstream (mis. "tunggu 23 detik lagi"). */
function parseRetryAfterMs(text: string): number | null {
  const seconds = /tunggu\s+(\d+)\s*detik/i.exec(text) ?? /wait\s+(\d+)\s*sec/i.exec(text);
  if (seconds) return Math.min(MAX_RETRY_WAIT_MS, (Number(seconds[1]) + 2) * 1000);

  const header = /"retry_after"\s*:\s*(\d+)/i.exec(text);
  if (header) return Math.min(MAX_RETRY_WAIT_MS, (Number(header[1]) + 2) * 1000);

  return null;
}

function dataUriOf(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: unknown }).data;
  const first = Array.isArray(data) ? data[0] : data;
  if (!first || typeof first !== "object") return null;

  const record = first as { b64_json?: unknown; url?: unknown };

  if (typeof record.b64_json === "string" && record.b64_json) {
    const b64 = record.b64_json;
    // Deteksi MIME dari magic bytes agar data URI valid.
    const mime = b64.startsWith("/9j/")
      ? "image/jpeg"
      : b64.startsWith("iVBORw0KGgo")
        ? "image/png"
        : b64.startsWith("UklGR")
          ? "image/webp"
          : "image/png";
    return `data:${mime};base64,${b64}`;
  }

  if (typeof record.url === "string" && record.url) return record.url;
  return null;
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  const apiKey = process.env.IMAGE_API_KEY?.trim();
  const baseUrl = (process.env.IMAGE_API_BASE_URL?.trim() || "https://je.jerouter.web.id/v1").replace(
    /\/+$/,
    ""
  );

  if (!apiKey) {
    return fail(
      "NOT_CONFIGURED",
      "Layanan AI belum dikonfigurasi. Hubungi admin untuk mengatur IMAGE_API_KEY.",
      503
    );
  }

  let body: { description?: unknown; presetId?: unknown };
  try {
    body = (await request.json()) as { description?: unknown; presetId?: unknown };
  } catch {
    return fail("INVALID_BODY", "Permintaan tidak valid.", 400);
  }

  const description = typeof body.description === "string" ? body.description.trim() : "";
  const presetId = typeof body.presetId === "string" ? body.presetId : "";

  if (description.length < 3) {
    return fail("EMPTY_DESCRIPTION", "Tuliskan deskripsi objek minimal 3 karakter.", 400);
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return fail(
      "DESCRIPTION_TOO_LONG",
      `Deskripsi maksimal ${MAX_DESCRIPTION_LENGTH} karakter.`,
      400
    );
  }

  const { prompt, preset } = buildKeychainPrompt({ description, presetId });

  // ── Retry loop: tahan permintaan sampai 5 menit ────────────────────
  let attempt = 0;
  let lastRetryText = "";

  while (Date.now() - startedAt < TOTAL_BUDGET_MS) {
    attempt += 1;
    const remaining = TOTAL_BUDGET_MS - (Date.now() - startedAt);

    try {
      const upstream = await fetch(`${baseUrl}/images/generations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: MODEL, prompt, n: COUNT, size: SIZE }),
        signal: AbortSignal.timeout(Math.min(ATTEMPT_TIMEOUT_MS, remaining)),
        cache: "no-store",
      });

      const text = await upstream.text();
      let payload: unknown = text;
      try {
        payload = JSON.parse(text);
      } catch {
        /* biarkan teks */
      }

      // Kena rate limit → tunggu sesuai saran, lalu ulangi (bukan error).
      if (upstream.status === 429) {
        lastRetryText = text;
        const waitMs = parseRetryAfterMs(text) ?? DEFAULT_RETRY_MS;
        const left = TOTAL_BUDGET_MS - (Date.now() - startedAt);

        if (left <= waitMs) break; // tidak mungkin selesai dalam 5 menit

        await sleep(waitMs);
        continue;
      }

      if (!upstream.ok) {
        const elapsedMs = Date.now() - startedAt;
        return Response.json(
          {
            ok: false,
            code: "UPSTREAM_ERROR",
            message: "Gagal membuat gambar. Silakan coba lagi beberapa saat lagi.",
            status: upstream.status,
            elapsedMs,
          } satisfies ErrorBody & { status: number; elapsedMs: number },
          { status: 502, headers: NO_STORE }
        );
      }

      const image = dataUriOf(payload);
      if (!image) {
        return Response.json(
          {
            ok: false,
            code: "NO_IMAGE",
            message: "Layanan tidak mengembalikan gambar. Coba lagi.",
            elapsedMs: Date.now() - startedAt,
          } satisfies ErrorBody & { elapsedMs: number },
          { status: 502, headers: NO_STORE }
        );
      }

      return Response.json(
        { ok: true, image, presetId: preset.id, elapsedMs: Date.now() - startedAt, attempts: attempt },
        { headers: NO_STORE }
      );
    } catch (error) {
      const aborted = error instanceof Error && error.name === "AbortError";
      const left = TOTAL_BUDGET_MS - (Date.now() - startedAt);

      // Timeout/jaringan: masih ada waktu → ulangi.
      if (left > DEFAULT_RETRY_MS) {
        await sleep(Math.min(DEFAULT_RETRY_MS, left));
        continue;
      }

      return Response.json(
        {
          ok: false,
          code: aborted ? "TIMEOUT" : "NETWORK_ERROR",
          message: aborted
            ? "Pembuatan gambar memakan waktu terlalu lama. Coba lagi."
            : "Tidak dapat menghubungi layanan AI. Coba lagi.",
          elapsedMs: Date.now() - startedAt,
        } satisfies ErrorBody & { elapsedMs: number },
        { status: aborted ? 504 : 502, headers: NO_STORE }
      );
    }
  }

  // Habis 5 menit masih kena rate limit.
  return Response.json(
    {
      ok: false,
      code: "RATE_LIMIT_TIMEOUT",
      message:
        "Layanan masih membatasi permintaan setelah 5 menit. Coba lagi beberapa saat lagi.",
      attempts: attempt,
      elapsedMs: Date.now() - startedAt,
      detail: lastRetryText.slice(0, 300),
    } satisfies ErrorBody & { attempts: number; elapsedMs: number; detail: string },
    { status: 429, headers: NO_STORE }
  );
}
