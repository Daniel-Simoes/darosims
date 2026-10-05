import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { getUserProfile } from '@/services/users/profileService';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const profile = await getUserProfile(auth.email);
  if (!profile) {
    return jsonResponse({ error: 'User not found' }, 404);
  }

  return jsonResponse({ user: profile });
}
