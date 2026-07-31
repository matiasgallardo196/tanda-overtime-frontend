import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_COOKIE_NAME = 'tanda_session';
const PUBLIC_PATHS = ['/login'];

// Renamed from "middleware" to "proxy" per Next.js 16 convention - same
// mechanism, just a naming change. This is only an optimistic redirect check
// (fast JWT signature verification, no I/O); the backend's JwtAuthGuard is
// the actual authorization enforcement on every API call.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  let isAuthenticated = false;
  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] });
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route except Next's own static/internal assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
