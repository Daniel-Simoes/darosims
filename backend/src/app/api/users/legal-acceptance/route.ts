import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { acceptLegalPolicies } from '@/services/users/profileService';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const record = body as Record<string, unknown>;
  if (record.acceptPrivacy !== true || record.acceptTerms !== true) {
    return jsonResponse(
      { error: 'You must accept the Privacy Policy and Terms of Service' },
      400,
    );
  }

  try {
    const profile = await acceptLegalPolicies(auth.email);
    return jsonResponse({ user: profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save acceptance';
    return jsonResponse({ error: message }, 400);
  }
}