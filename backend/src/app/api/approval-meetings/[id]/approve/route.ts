import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { recordLiveMeetingApprove } from '@/lib/approvalMeetings';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(_request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  if (!id?.trim()) {
    return jsonResponse({ error: 'Meeting id is required' }, 400);
  }

  try {
    const result = await recordLiveMeetingApprove(id.trim(), auth);
    return jsonResponse(result, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to approve';
    const status =
      message.includes('not found')
        ? 404
        : message.includes('not authorized') || message.includes('Only the')
          ? 403
          : 409;
    return jsonResponse({ error: message }, status);
  }
}