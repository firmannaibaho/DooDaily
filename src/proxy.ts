import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware berjalan di Edge runtime, sehingga TIDAK boleh mengimpor
 * `@/lib/auth` (modul itu memuat bcrypt & Supabase yang khusus Node).
 * Secret dibaca langsung dari env — nilainya harus sama dengan yang dipakai
 * Auth.js. AUTH_SECRET diutamakan (konvensi Auth.js v5).
 */
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

/**
 * Nama cookie sesi Auth.js v5 berbeda antara HTTP dan HTTPS:
 *   HTTPS → `__Secure-authjs.session-token`
 *   HTTP  → `authjs.session-token`
 *
 * `getToken()` harus diberi nama yang tepat; jika tidak, token tidak ditemukan
 * dan seluruh halaman /admin ikut ter-redirect ke /login.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const isHttps = request.nextUrl.protocol === "https:";
    const secureCookie = isHttps
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

    const token = await getToken({
      req: request,
      secret: AUTH_SECRET,
      cookieName: secureCookie,
      secureCookie: isHttps,
      salt: secureCookie,
    });
    if (!token || token.role !== 'admin') {
      // Redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  // Continue to next handler
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
