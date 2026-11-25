import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import {
  canAuthUserAccessApprovalMeeting,
  getApprovalMeetingBundle,
  getMeetingAuthorizationSummary,
} from '@/lib/approvalMeetings';
import { canAuthUserViewDocument } from '@/lib/documentVisibility';
import { getDocumentById } from '@/lib/documents';
import { requirePermission } from '@/lib/security/authz';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const viewAuth = await requirePermission(auth, 'view_documents');
  if (viewAuth instanceof Response) return viewAuth;

  const { id } = await params;
  if (!id?.trim()) {
    return jsonResponse({ error: 'Meeting id is required' }, 400);
  }

  try {
    const { meeting, decision } = await getApprovalMeetingBundle(id.trim());
    const document = await getDocumentById(meeting.documentId);
    if (!document || !(await canAuthUserViewDocument(auth, document))) {
      return jsonResponse({ error: 'Meeting not found' }, 404);
    }
    if (!(await canAuthUserAccessApprovalMeeting(auth.email, meeting))) {
      return jsonResponse({ error: 'Meeting not found' }, 404);
    }

    const authorization = getMeetingAuthorizationSummary(meeting, auth.email);
    return jsonResponse({ meeting, decision, authorization });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load meeting';
    const status = message.includes('not found') ? 404 : 500;
    return jsonResponse({ error: message }, status);
  }
}