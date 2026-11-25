import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { cancelApprovalMeeting } from '@/lib/approvalMeetings';
import { getDocumentById, updateDocument } from '@/lib/documents';
import { createDocumentEvent } from '@/lib/documentEvents';
import { sendLiveMeetingCancelledNotifications } from '@/services/approvalMeetings/liveMeetingParticipantNotifications';

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
    let reason: string | undefined;
    try {
      const body = await request.json();
      reason = typeof body.reason === 'string' ? body.reason.trim() : undefined;
    } catch {
      reason = undefined;
    }

    const meeting = await cancelApprovalMeeting(id.trim(), auth, reason);

    await createDocumentEvent({
      documentId: meeting.documentId,
      type: 'approval_meeting_cancelled',
      actorEmail: auth.email,
      actorName: auth.name,
      metadata: {
        approvalMeetingId: meeting.id,
        version: String(meeting.documentVersion),
        ...(reason ? { reason } : {}),
      },
    });

    const document = await getDocumentById(meeting.documentId);
    if (document) {
      await sendLiveMeetingCancelledNotifications(meeting, document, auth, reason);
      if (document.activeApprovalMeetingId === meeting.id) {
        await updateDocument(document.id, { activeApprovalMeetingId: undefined });
      }
    }

    return jsonResponse({ meeting });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to cancel meeting';
    const status = message.includes('not found') ? 404 : 400;
    return jsonResponse({ error: message }, status);
  }
}