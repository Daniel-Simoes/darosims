import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/config/env';
import { ensureServerBootstrap } from '@/lib/ensureServerBootstrap';
import { securityHeaders } from '@/lib/security/headers';
import { readSessionToken, sessionCookieHeader, clearSessionCookieHeader } from '@/lib/security/session';
import type { AuthUser, JwtPayload } from '@/types';

const secret = new TextEncoder().encode(env.jwtSecret);

export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.email)
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'admin',
    };
  } catch {
    return null;
  }
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}

export async function resolveAuthToken(request: Request): Promise<string | null> {
  return readSessionToken(request) ?? getBearerToken(request);
}

export async function requireAuth(request: Request): Promise<JwtPayload | Response> {
  try {
    await ensureServerBootstrap();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server initialization failed';
    console.error('[requireAuth] bootstrap failed:', err);
    return jsonResponse({ error: message }, 503);
  }

  const token = await resolveAuthToken(request);
  if (!token) {
    return jsonResponse({ error: 'Authentication required' }, 401);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return jsonResponse({ error: 'Invalid or expired session' }, 401);
  }

  return payload;
}

export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.corsOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
    Vary: 'Origin, Authorization, Cookie',
    ...securityHeaders(),
  };
}

export function mergeResponseHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(corsHeaders());
  if (extra) {
    new Headers(extra).forEach((value, key) => headers.set(key, value));
  }
  return headers;
}

export function jsonResponse(data: unknown, status = 200, extraHeaders?: HeadersInit) {
  return Response.json(data, { status, headers: mergeResponseHeaders(extraHeaders) });
}

export function jsonResponseWithSession(data: unknown, token: string, status = 200) {
  return jsonResponse(data, status, {
    'Set-Cookie': sessionCookieHeader(token),
  });
}

export function jsonResponseClearSession(data: unknown, status = 200) {
  return jsonResponse(data, status, {
    'Set-Cookie': clearSessionCookieHeader(),
  });
}