import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { listApprovalMeetingBundlesForDocument } from '@/lib/approvalMeetings';
import { getDocumentById } from '@/lib/documents';
import { canAuthUserViewDocument } from '@/lib/documentVisibility';
import { canAuthUserAccessApprovalMeeting, getMeetingAuthorizationSummary } from '@/lib/approvalMeetings';
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
    return jsonResponse({ error: 'Document id is required' }, 400);
  }

  const document = await getDocumentById(id.trim());
  if (!document || !(await canAuthUserViewDocument(auth, document))) {
    return jsonResponse({ error: 'Document not found' }, 404);
  }

  try {
    const bundles = await listApprovalMeetingBundlesForDocument(document.id);
    const visible = [];

    for (const bundle of bundles) {
      if (!(await canAuthUserAccessApprovalMeeting(auth.email, bundle.meeting))) {
        continue;
      }
      visible.push({
        ...bundle,
        authorization: getMeetingAuthorizationSummary(bundle.meeting, auth.email),
      });
    }

    return jsonResponse({ meetings: visible });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list meetings';
    return jsonResponse({ error: message }, 500);
  }
}