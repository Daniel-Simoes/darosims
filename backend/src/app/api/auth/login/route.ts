import { signToken, corsHeaders, jsonResponse } from '@/lib/auth';
import { validateCredentials } from '@/lib/users';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim();
    const password = String(body.password ?? '');

    if (!email || !password) {
      return jsonResponse({ error: 'Email and password are required' }, 400);
    }

    const user = await validateCredentials(email, password);
    if (!user) {
      return jsonResponse({ error: 'Invalid email or password' }, 401);
    }

    const token = await signToken(user);
    return jsonResponse({ token, user });
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }
}
