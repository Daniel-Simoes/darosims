import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Serve the Vite SPA for client routes; API and static assets pass through. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL('/index.html', request.url));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image).*)'],
};
