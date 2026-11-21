import { env } from '@/config/env';

export const SESSION_COOKIE_NAME = 'daros_session';

const MAX_AGE_SEC = 60 * 60 * 24;

export function sessionCookieOptions(): string {
  const secure = env.nodeEnv === 'production';
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${MAX_AGE_SEC}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function sessionCookieHeader(token: string): string {
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SEC}${env.nodeEnv === 'production' ? '; Secure' : ''}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${env.nodeEnv === 'production' ? '; Secure' : ''}`;
}

export function readSessionToken(request: Request): string | null {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;

  for (const part of cookie.split(';')) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${SESSION_COOKIE_NAME}=`)) continue;
    const value = trimmed.slice(SESSION_COOKIE_NAME.length + 1);
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return null;
}