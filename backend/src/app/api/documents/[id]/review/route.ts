import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { getDocumentById, markDocumentReviewed } from '@/lib/documents';
import { resolveDesignatedApproverEmail } from '@/lib/documentApproval';
import { createDocumentEvent } from '@/lib/documentEvents';
import { createNotification } from '@/lib/notifications';
import { isAuthUserDocumentOwner } from '@/lib/documentOwnership';
import { canAuthUserViewDocument } from '@/lib/documentVisibility';
import { normalizeTeamEmail } from '@/lib/legacyEmails';
import {
  isSelfServiceDocumentWorkflow,
  normalizedUserEmail,
  shouldNotifyUser,
} from '@/lib/documentWorkflowNotifications';

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
    return jsonResponse({ error: 'Document id is required' }, 400);
  }

  try {
    const existing = await getDocumentById(id);
    if (!existing) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }
    if (!(await canAuthUserViewDocument(auth, existing))) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }

    if (!(await isAuthUserDocumentOwner(auth.email, existing.owner))) {
      return jsonResponse({ error: 'Only the assigned document owner can review this submission' }, 403);
    }

    const document = await markDocumentReviewed(id, auth.email);
    const approverEmail = normalizeTeamEmail(await resolveDesignatedApproverEmail(document));

    await createDocumentEvent({
      documentId: document.id,
      type: 'reviewed',
      actorEmail: auth.email,
      actorName: auth.name,
      metadata: approverEmail ? { recipientEmail: approverEmail } : undefined,
    });

    const selfService = await isSelfServiceDocumentWorkflow(document);

    if (
      approverEmail &&
      !selfService &&
      shouldNotifyUser(approverEmail, auth.email)
    ) {
      await createNotification({
        recipientEmail: approverEmail,
        documentId: document.id,
        type: 'approval_request',
        title: 'Document ready for approval',
        actorName: auth.name,
        message: `${auth.name} reviewed "${document.title}" and sent it to you for final approval.`,
      });
    }

    const creatorEmail = normalizedUserEmail(document.createdBy);
    if (
      creatorEmail &&
      !selfService &&
      shouldNotifyUser(creatorEmail, auth.email)
    ) {
      await createNotification({
        recipientEmail: creatorEmail,
        documentId: document.id,
        type: 'document_reviewed',
        title: 'Document reviewed',
        actorName: auth.name,
        message: `${auth.name} reviewed your document "${document.title}" and sent it for final approval.`,
      });
    }

    return jsonResponse({ document });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to review document';
    const status = message.includes('not found') ? 404 : 400;
    return jsonResponse({ error: message }, status);
  }
}