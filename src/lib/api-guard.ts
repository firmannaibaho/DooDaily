/**
 * Guard otorisasi untuk API route.
 *
 * KENAPA INI ADA:
 * RLS di Supabase DISABLED dan `src/proxy.ts` hanya mencakup `/admin/:path*`
 * (tidak `/api/*`). Artinya setiap route API bertanggung jawab penuh atas
 * otorisasinya sendiri. Helper ini memusatkan logika tersebut agar tidak ada
 * route yang lupa mengecek.
 *
 * Pola pakai:
 *   const session = await requireUser();   // 401 bila belum login
 *   const session = await requireAdmin();  // 403 bila bukan admin
 */

import { NextResponse } from "next/server";
import { auth } from "./auth";

/** Field tambahan yang disuntikkan `lib/auth.ts` ke session.user. */
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

/** Error yang membawa respons HTTP siap-pakai. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const unauthorized = () => new HttpError(401, "Unauthenticated");
export const forbidden = (message = "Forbidden") => new HttpError(403, message);

/** Ambil user dari session, atau lempar 401. */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  const id = user?.id;
  if (!user || !id) throw unauthorized();

  return {
    id: String(id),
    name: user.name ?? null,
    email: user.email ?? null,
    role: user.role ?? "user",
  };
}

/** Wajib admin, atau lempar 403. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw forbidden();
  return user;
}

/** ID numerik user (dipakai untuk kolom BIGINT). */
export function userIdOf(user: SessionUser): number {
  const id = Number(user.id);
  if (!Number.isFinite(id) || id <= 0) throw unauthorized();
  return id;
}

/** Ubah HttpError / error tak terduga menjadi NextResponse. */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  console.error("Unhandled API error:", error);
  return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
}

/**
 * Bungkus handler agar error otomatis jadi respons JSON yang rapi.
 * Menghindari try/catch berulang di setiap route.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
