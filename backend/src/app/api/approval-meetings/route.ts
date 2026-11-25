import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import {
  canAuthUserAccessApprovalMeeting,
  createApprovalMeeting,
  listApprovalMeetingsForDocument,
} from '@/lib/approvalMeetings';
import { getDocumentById, updateDocument } from '@/lib/documents';
import { sendLiveMeetingInvitations } from '@/services/approvalMeetings/liveMeetingInvitationService';
import { createDocumentEvent } from '@/lib/documentEvents';
import { canAuthUserViewDocument } from '@/lib/documentVisibility';
import { requirePermission } from '@/lib/security/authz';
import type { CreateApprovalMeetingInput } from '@/types';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const viewAuth = await requirePermission(auth, 'view_documents');
  if (viewAuth instanceof Response) return viewAuth;

  const documentId = new URL(request.url).searchParams.get('documentId')?.trim();
  if (!documentId) {
    return jsonResponse({ error: 'documentId query parameter is required' }, 400);
  }

  try {
    const document = await getDocumentById(documentId);
    if (!document) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }
    if (!(await canAuthUserViewDocument(auth, document))) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }

    const meetings = await listApprovalMeetingsForDocument(documentId);
    const visible = [];
    for (const meeting of meetings) {
      if (await canAuthUserAccessApprovalMeeting(auth.email, meeting)) {
        visible.push(meeting);
      }
    }
    return jsonResponse({ meetings: visible });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list meetings';
    return jsonResponse({ error: message }, 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const createAuth = await requirePermission(auth, 'create_documents');
  if (createAuth instanceof Response) return createAuth;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const documentId = typeof body.documentId === 'string' ? body.documentId.trim() : '';
    const scheduledStartsAt =
      typeof body.scheduledStartsAt === 'string' ? body.scheduledStartsAt.trim() : '';
    const timezone = typeof body.timezone === 'string' ? body.timezone.trim() : 'UTC';
    const scheduledEndsAt =
      typeof body.scheduledEndsAt === 'string' ? body.scheduledEndsAt.trim() : undefined;
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description =
      typeof body.description === 'string' ? body.description.trim() : undefined;
    const clientSubmissionKey =
      typeof body.clientSubmissionKey === 'string' ? body.clientSubmissionKey.trim() : undefined;
    const sendInvitations = body.sendInvitations !== false;

    if (!documentId) {
      return jsonResponse({ error: 'documentId is required' }, 400);
    }
    if (!scheduledStartsAt) {
      return jsonResponse({ error: 'scheduledStartsAt is required' }, 400);
    }
    if (!title) {
      return jsonResponse({ error: 'title is required' }, 400);
    }

    const input: CreateApprovalMeetingInput = {
      documentId,
      scheduledStartsAt,
      scheduledEndsAt,
      timezone,
      title,
      description,
      clientSubmissionKey,
      sendInvitations,
    };

    const document = await getDocumentById(documentId);
    if (!document) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }
    if (!(await canAuthUserViewDocument(auth, document))) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }

    const { meeting, decision, created } = await createApprovalMeeting(input, auth);

    let savedMeeting = meeting;
    if (created) {
      await createDocumentEvent({
        documentId: meeting.documentId,
        type: 'approval_meeting_scheduled',
        actorEmail: auth.email,
        actorName: auth.name,
        metadata: {
          approvalMeetingId: meeting.id,
          meetingDecisionId: decision.id,
          version: String(meeting.documentVersion),
        },
      });

      await updateDocument(meeting.documentId, {
        approvalWorkflow: 'live',
        activeApprovalMeetingId: meeting.id,
      });

      if (sendInvitations) {
        savedMeeting = await sendLiveMeetingInvitations(meeting.id, document, auth);
      }
    }

    return jsonResponse({ meeting: savedMeeting, decision, created }, created ? 201 : 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create meeting';
    const status = message.includes('not found') ? 404 : 400;
    return jsonResponse({ error: message }, status);
  }
}