import { corsHeaders, jsonResponse } from '@/lib/auth';
import { appendLgpdRequest } from '@/lib/lgpdRequests';
import { ensureServerBootstrap } from '@/lib/ensureServerBootstrap';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit';
import { assertHoneypotEmpty, parseBoundedString, parseEmail } from '@/lib/security/input';
import { safeApiError } from '@/lib/security/errors';

const LGPD_TYPES = new Set([
  'access',
  'correction',
  'deletion',
  'portability',
  'revoke_consent',
  'anonymization',
  'information',
  'other',
]);

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    await ensureServerBootstrap();

    const rate = checkRateLimit(`lgpd:${getClientIp(request)}`, {
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!rate.allowed) {
      return jsonResponse({ error: 'Too many requests. Please try again later.' }, 429);
    }

    const body = await request.json();
    assertHoneypotEmpty(body.website);

    const name = parseBoundedString(body.name, 120) ?? '';
    const email = parseEmail(body.email) ?? '';
    const requestType = typeof body.requestType === 'string' ? body.requestType.trim() : '';
    const message = parseBoundedString(body.message, 4000) ?? '';

    if (!name || name.length < 2) {
      return jsonResponse({ error: 'Name is required' }, 400);
    }
    if (!email) {
      return jsonResponse({ error: 'A valid email is required' }, 400);
    }
    if (!LGPD_TYPES.has(requestType)) {
      return jsonResponse({ error: 'Invalid request type' }, 400);
    }
    if (message.length > 4000) {
      return jsonResponse({ error: 'Message is too long' }, 400);
    }

    await appendLgpdRequest({
      name,
      email,
      requestType,
      message: message || undefined,
    });

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: safeApiError('Could not submit request', err, '[lgpd/requests]') }, 500);
  }
}