import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { getDocumentById, submitDocumentForApproval } from '@/lib/documents';
import { createDocumentEvent, getLatestSubmissionType } from '@/lib/documentEvents';
import { createNotification } from '@/lib/notifications';
import { resolveDocumentOwnerEmail } from '@/lib/documentOwnership';
import { isDocumentOwnerSameAsEmail } from '@/lib/users';

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

    const document = await submitDocumentForApproval(id, auth.email);
    const submissionType = await getLatestSubmissionType(id);
    await createDocumentEvent({
      documentId: document.id,
      type: submissionType,
      actorEmail: auth.email,
      actorName: auth.name,
    });
    const approverEmail = await resolveDocumentOwnerEmail(document.owner);
    const isCreatorAlsoOwner = await isDocumentOwnerSameAsEmail(document.owner, auth.email);

    if (approverEmail) {
      await createNotification({
        recipientEmail: approverEmail,
        documentId: document.id,
        type: 'approval_request',
        title: 'Document pending approval',
        actorName: auth.name,
        message: isCreatorAlsoOwner
          ? `You submitted "${document.title}" for approval. It is pending your approval.`
          : `${auth.name} sent "${document.title}" for your approval.`,
      });
    }

    return jsonResponse({ document });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to submit document';
    const status = message.includes('not found') ? 404 : 400;
    return jsonResponse({ error: message }, status);
  }
}
