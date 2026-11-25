import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { canAuthUserAccessApprovalMeeting, getApprovalMeetingBundle } from '@/lib/approvalMeetings';
import {
  ensureLiveKitRoomForMeeting,
  isLiveKitConfigured,
  issueLiveKitParticipantToken,
  resolveMeetingLiveKitRoomName,
} from '@/lib/livekit';
import { getAuthUserMeetingRole } from '@/lib/approvalMeetings';
import { getDocumentById } from '@/lib/documents';
import { canAuthUserViewDocument } from '@/lib/documentVisibility';
import { requirePermission } from '@/lib/security/authz';
import { normalizeTeamEmail } from '@/lib/legacyEmails';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(_request);
  if (auth instanceof Response) return auth;

  const viewAuth = await requirePermission(auth, 'view_documents');
  if (viewAuth instanceof Response) return viewAuth;

  if (!isLiveKitConfigured()) {
    return jsonResponse(
      {
        error:
          'LiveKit is not configured. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL on the server.',
      },
      503,
    );
  }

  const { id } = await params;
  if (!id?.trim()) {
    return jsonResponse({ error: 'Meeting id is required' }, 400);
  }

  try {
    const { meeting } = await getApprovalMeetingBundle(id.trim());

    const document = await getDocumentById(meeting.documentId);
    if (!document || !(await canAuthUserViewDocument(auth, document))) {
      return jsonResponse({ error: 'Meeting not found' }, 404);
    }

    if (!(await canAuthUserAccessApprovalMeeting(auth.email, meeting))) {
      return jsonResponse({ error: 'You are not allowed to join this meeting' }, 403);
    }

    if (meeting.status === 'completed' || meeting.status === 'cancelled') {
      return jsonResponse({ error: `Meeting is ${meeting.status}` }, 400);
    }

    const role = await getAuthUserMeetingRole(auth.email, meeting);
    if (!role) {
      return jsonResponse({ error: 'You are not a participant in this meeting' }, 403);
    }

    const roomName = await ensureLiveKitRoomForMeeting(
      meeting.id,
      resolveMeetingLiveKitRoomName(meeting.id, meeting.livekitRoomName),
    );

    const identity = normalizeTeamEmail(auth.email) ?? auth.email.trim().toLowerCase();

    const issued = await issueLiveKitParticipantToken({
      roomName,
      identity,
      displayName: auth.name,
      role,
      meetingId: meeting.id,
      documentId: meeting.documentId,
    });

    return jsonResponse({
      token: issued.token,
      serverUrl: issued.serverUrl,
      roomName,
      role,
      meetingId: meeting.id,
      documentId: meeting.documentId,
      expiresAt: issued.expiresAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to issue LiveKit token';
    const status = message.includes('not found') ? 404 : 400;
    return jsonResponse({ error: message }, status);
  }
}