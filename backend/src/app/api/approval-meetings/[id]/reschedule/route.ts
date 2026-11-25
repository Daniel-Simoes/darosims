import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { rescheduleApprovalMeeting } from '@/lib/approvalMeetings';
import { getDocumentById } from '@/lib/documents';
import { createDocumentEvent } from '@/lib/documentEvents';
import { sendLiveMeetingRescheduledNotifications } from '@/services/approvalMeetings/liveMeetingParticipantNotifications';
import type { RescheduleApprovalMeetingInput } from '@/types';

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
    const input: RescheduleApprovalMeetingInput = {
      scheduledStartsAt:
        typeof body.scheduledStartsAt === 'string' ? body.scheduledStartsAt.trim() : '',
      scheduledEndsAt:
        typeof body.scheduledEndsAt === 'string' ? body.scheduledEndsAt.trim() : undefined,
      timezone: typeof body.timezone === 'string' ? body.timezone.trim() : undefined,
      title: typeof body.title === 'string' ? body.title.trim() : undefined,
      description: typeof body.description === 'string' ? body.description.trim() : undefined,
      notifyParticipants: body.notifyParticipants !== false,
    };

    if (!input.scheduledStartsAt) {
      return jsonResponse({ error: 'scheduledStartsAt is required' }, 400);
    }

    const meeting = await rescheduleApprovalMeeting(id.trim(), input, auth);
    const document = await getDocumentById(meeting.documentId);
    if (!document) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }

    await createDocumentEvent({
      documentId: meeting.documentId,
      type: 'approval_meeting_rescheduled',
      actorEmail: auth.email,
      actorName: auth.name,
      metadata: {
        approvalMeetingId: meeting.id,
        version: String(meeting.documentVersion),
      },
    });

    if (input.notifyParticipants !== false) {
      await sendLiveMeetingRescheduledNotifications(meeting, document, auth);
    }

    return jsonResponse({ meeting });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reschedule meeting';
    const status = message.includes('not found') ? 404 : 400;
    return jsonResponse({ error: message }, status);
  }
}