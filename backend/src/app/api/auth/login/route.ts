import { signToken, corsHeaders, jsonResponse, jsonResponseWithSession } from '@/lib/auth';
import { ensureServerBootstrap } from '@/lib/ensureServerBootstrap';
import { validateCredentials } from '@/lib/users';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit';
import { parseEmail, assertHoneypotEmpty } from '@/lib/security/input';
import { safeApiError } from '@/lib/security/errors';
import { isMissingTableError } from '@/lib/supabaseSchemaCheck';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function configurationErrorResponse(err: unknown): Response | null {
  const message = err instanceof Error ? err.message : '';
  if (message.includes('JWT_SECRET')) {
    return jsonResponse(
      {
        error:
          'Login is unavailable: JWT_SECRET is not configured on the server. Set it in Vercel environment variables.',
      },
      503,
    );
  }
  if (message.includes('SUPABASE_URL') || message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    return jsonResponse(
      {
        error:
          'Login is unavailable: Supabase is not configured correctly on the server (URL and service role key).',
      },
      503,
    );
  }
  if (isMissingTableError(message) || message.includes('users table')) {
    return jsonResponse(
      {
        error:
          'Login is unavailable: the users table is missing in Supabase. Run backend/supabase/schema.sql in the SQL Editor.',
      },
      503,
    );
  }
  return null;
}

export async function POST(request: Request) {
  try {
    try {
      await ensureServerBootstrap();
    } catch (bootstrapErr) {
      console.error('[auth/login] bootstrap failed', bootstrapErr);
      const configured = configurationErrorResponse(bootstrapErr);
      if (configured) return configured;
      return jsonResponse(
        { error: safeApiError('Login unavailable', bootstrapErr, '[auth/login] bootstrap') },
        503,
      );
    }

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

    let user;
    try {
      user = await validateCredentials(email, password);
    } catch (dbErr) {
      console.error('[auth/login] credentials lookup failed', dbErr);
      const configured = configurationErrorResponse(dbErr);
      if (configured) return configured;
      return jsonResponse(
        { error: safeApiError('Login failed', dbErr, '[auth/login] credentials') },
        500,
      );
    }

    if (!user) {
      return jsonResponse({ error: 'Invalid email or password' }, 401);
    }

    const token = await signToken(user);
    return jsonResponseWithSession({ user }, token);
  } catch (error) {
    return jsonResponse({ error: safeApiError('Login failed', error, '[auth/login]') }, 500);
  }
}