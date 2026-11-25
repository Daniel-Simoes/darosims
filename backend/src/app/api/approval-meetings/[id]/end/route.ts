import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { completeApprovalMeeting, getApprovalMeetingBundle } from '@/lib/approvalMeetings';
import { getDocumentById } from '@/lib/documents';
import { createDocumentEvent } from '@/lib/documentEvents';
import { sendLiveMeetingIncompleteNotifications } from '@/services/approvalMeetings/liveMeetingParticipantNotifications';

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
    const before = await getApprovalMeetingBundle(id.trim());
    const meeting = await completeApprovalMeeting(id.trim(), auth);
    const decisionStatus = before.decision?.status ?? 'pending';
    const terminal = decisionStatus === 'approved' || decisionStatus === 'rejected';

    await createDocumentEvent({
      documentId: meeting.documentId,
      type: 'approval_meeting_ended',
      actorEmail: auth.email,
      actorName: auth.name,
      metadata: {
        approvalMeetingId: meeting.id,
        version: String(meeting.documentVersion),
        action: terminal ? 'completed' : 'incomplete',
        meetingDecisionId: before.decision?.id,
      },
    });

    if (!terminal) {
      const document = await getDocumentById(meeting.documentId);
      if (document) {
        await sendLiveMeetingIncompleteNotifications(meeting, document, auth, decisionStatus);
      }
    }

    return jsonResponse({ meeting });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to end meeting';
    const status = message.includes('not found') ? 404 : 400;
    return jsonResponse({ error: message }, status);
  }
}