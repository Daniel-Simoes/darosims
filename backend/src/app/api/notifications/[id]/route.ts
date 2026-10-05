import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { deleteNotification } from '@/lib/notifications';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  if (!id?.trim()) {
    return jsonResponse({ error: 'Notification id is required' }, 400);
  }

  const deleted = await deleteNotification(id, auth.email);
  if (!deleted) {
    return jsonResponse({ error: 'Notification not found' }, 404);
  }

  return jsonResponse({ success: true });
}
