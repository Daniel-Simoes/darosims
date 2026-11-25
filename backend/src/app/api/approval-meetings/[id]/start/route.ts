import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { startApprovalMeeting } from '@/lib/approvalMeetings';
import { createDocumentEvent } from '@/lib/documentEvents';

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
    const meeting = await startApprovalMeeting(id.trim(), auth);

    await createDocumentEvent({
      documentId: meeting.documentId,
      type: 'approval_meeting_started',
      actorEmail: auth.email,
      actorName: auth.name,
      metadata: {
        approvalMeetingId: meeting.id,
        version: String(meeting.documentVersion),
      },
    });

    return jsonResponse({ meeting });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to start meeting';
    const status = message.includes('not found') ? 404 : 400;
    return jsonResponse({ error: message }, status);
  }
}