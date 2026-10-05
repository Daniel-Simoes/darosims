import { requireAuth, jsonResponse, corsHeaders, signToken } from '@/lib/auth';
import { getUserProfile, updateUserProfile } from '@/services/users/profileService';
import type { UpdateProfilePayload } from '@/types';

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

  return jsonResponse({ profile });
}

export async function PATCH(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  let payload: UpdateProfilePayload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  try {
    const { profile } = await updateUserProfile(auth.email, payload);
    const token = await signToken(profile);
    return jsonResponse({ profile, token });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return jsonResponse({ error: message }, 400);
  }
}
