import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { recordLiveMeetingReject } from '@/lib/approvalMeetings';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  if (!id?.trim()) {
    return jsonResponse({ error: 'Meeting id is required' }, 400);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
    const result = await recordLiveMeetingReject(id.trim(), auth, reason);
    return jsonResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reject';
    const status = message.includes('not found') ? 404 : 400;
    return jsonResponse({ error: message }, status);
  }
}