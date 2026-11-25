import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { recordLiveMeetingReview } from '@/lib/approvalMeetings';

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
    const result = await recordLiveMeetingReview(id.trim(), auth);
    return jsonResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to record review';
    const status = message.includes('not found') ? 404 : 400;
    return jsonResponse({ error: message }, status);
  }
}