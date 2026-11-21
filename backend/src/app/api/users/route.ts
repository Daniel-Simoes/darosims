import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { listUsers } from '@/lib/users';
import { requirePermission } from '@/lib/security/authz';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const allowed = await requirePermission(auth, 'view_documents');
  if (allowed instanceof Response) return allowed;

  const users = await listUsers();
  return jsonResponse({ users });
}
