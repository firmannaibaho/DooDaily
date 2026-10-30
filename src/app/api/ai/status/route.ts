/**
 * GET /api/ai/status
 * Menampilkan status layanan AI ke UI: cukup "online" atau "offline".
 * Tidak pernah mengirim API key / base URL ke client.
 */

const STATUS_TIMEOUT_MS = 8000;

function upstreamBaseUrl() {
  return (process.env.IMAGE_API_BASE_URL?.trim() || "https://je.jerouter.web.id/v1").replace(/\/+$/, "");
}

export async function GET() {
  const apiKey = process.env.IMAGE_API_KEY?.trim();

  if (!apiKey) {
    return Response.json(
      { status: "offline", reason: "not_configured" },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    // Cek ringan: endpoint /models harus membalas 2xx bila layanan hidup.
    const res = await fetch(`${upstreamBaseUrl()}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json(
        { status: "offline", reason: `upstream_${res.status}` },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    return Response.json(
      { status: "online" },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json(
      { status: "offline", reason: "unreachable" },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
