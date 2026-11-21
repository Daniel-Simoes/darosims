import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { getDocumentById, submitDocumentForApproval } from '@/lib/documents';
import { createDocumentEvent, getLatestSubmissionType } from '@/lib/documentEvents';
import { createNotification } from '@/lib/notifications';
import { resolveDocumentOwnerEmail } from '@/lib/documentOwnership';
import { canAuthUserViewDocument } from '@/lib/documentVisibility';
import { normalizeTeamEmail } from '@/lib/legacyEmails';
import {
  isSelfServiceDocumentWorkflow,
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

    const document = await submitDocumentForApproval(id, auth.email);
    const submissionType = await getLatestSubmissionType(id);
    const reviewerEmail = normalizeTeamEmail(await resolveDocumentOwnerEmail(document.owner));

    await createDocumentEvent({
      documentId: document.id,
      type: submissionType,
      actorEmail: auth.email,
      actorName: auth.name,
      metadata: reviewerEmail ? { recipientEmail: reviewerEmail } : undefined,
    });
    const selfService = await isSelfServiceDocumentWorkflow(document);

    if (
      reviewerEmail &&
      !selfService &&
      shouldNotifyUser(reviewerEmail, auth.email)
    ) {
      const isResubmit = submissionType === 'resubmitted';
      await createNotification({
        recipientEmail: reviewerEmail,
        documentId: document.id,
        type: 'review_request',
        title: isResubmit ? 'Document resubmitted for review' : 'Document pending review',
        actorName: auth.name,
        message: isResubmit
          ? `${auth.name} resubmitted "${document.title}" for your review.`
          : `${auth.name} sent "${document.title}" for your review.`,
      });
    }

    return jsonResponse({ document });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to submit document';
    const status = message.includes('not found') ? 404 : 400;
    return jsonResponse({ error: message }, status);
  }
}
