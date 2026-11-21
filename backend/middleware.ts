import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SECURITY_HEADER_ENTRIES: [string, string][] = [
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
];

function applySecurityHeaders(response: NextResponse) {
  for (const [key, value] of SECURITY_HEADER_ENTRIES) {
    response.headers.set(key, value);
  }
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  return response;
}

/** Serve the Vite SPA for client routes; API and static assets pass through. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return applySecurityHeaders(NextResponse.next());
  }

  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return applySecurityHeaders(NextResponse.next());
  }

  return applySecurityHeaders(NextResponse.rewrite(new URL('/index.html', request.url)));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image).*)'],
};
