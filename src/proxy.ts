import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AUTH_SECRET } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request, secret: AUTH_SECRET });
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
