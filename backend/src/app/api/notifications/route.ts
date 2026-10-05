import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { listNotificationsForUser } from '@/lib/notifications';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const notifications = await listNotificationsForUser(auth.email);
    return jsonResponse({ notifications, total: notifications.length });
  } catch {
    return jsonResponse({ error: 'Failed to load notifications' }, 500);
  }
}
