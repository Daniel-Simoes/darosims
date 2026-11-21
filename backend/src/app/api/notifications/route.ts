import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { listNotificationsForUser } from '@/lib/notifications';
import { parseListLimit, slicePage } from '@/lib/security/pagination';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const searchParams = new URL(request.url).searchParams;
    const limit = parseListLimit(searchParams);
    const offset = Math.max(0, Number.parseInt(searchParams.get('offset') ?? '0', 10) || 0);
    const all = await listNotificationsForUser(auth.email);
    const notifications = slicePage(all, limit, offset);
    return jsonResponse({ notifications, total: all.length, limit, offset });
  } catch {
    return jsonResponse({ error: 'Failed to load notifications' }, 500);
  }
}
