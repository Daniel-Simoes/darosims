import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/config/env';
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

export async function requireAuth(request: Request): Promise<JwtPayload | Response> {
  const token = getBearerToken(request);
  if (!token) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  return payload;
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': env.corsOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders() });
}
