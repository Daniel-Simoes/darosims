import { signToken, corsHeaders, jsonResponse, jsonResponseWithSession } from '@/lib/auth';
import { ensureServerBootstrap } from '@/lib/ensureServerBootstrap';
import { validateCredentials } from '@/lib/users';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit';
import { parseEmail } from '@/lib/security/input';
import { safeApiError } from '@/lib/security/errors';
import { assertHoneypotEmpty } from '@/lib/security/input';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    await ensureServerBootstrap();

    const rate = checkRateLimit(`login:${getClientIp(request)}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!rate.allowed) {
      return jsonResponse(
        { error: 'Too many login attempts. Try again later.' },
        429,
        rate.retryAfterSec ? { 'Retry-After': String(rate.retryAfterSec) } : undefined,
      );
    }

    const body = await request.json();
    assertHoneypotEmpty(body.website);

    const email = parseEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return jsonResponse({ error: 'Email and password are required' }, 400);
    }
    if (password.length > 256) {
      return jsonResponse({ error: 'Invalid credentials' }, 400);
    }

    const user = await validateCredentials(email, password);
    if (!user) {
      return jsonResponse({ error: 'Invalid email or password' }, 401);
    }

    const token = await signToken(user);
    return jsonResponseWithSession({ user }, token);
  } catch (error) {
    return jsonResponse({ error: safeApiError('Login failed', error, '[auth/login]') }, 500);
  }
}