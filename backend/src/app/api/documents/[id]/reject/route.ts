import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { getDocumentById, rejectDocumentForApproval } from '@/lib/documents';
import { createDocumentEvent } from '@/lib/documentEvents';
import { createNotification } from '@/lib/notifications';
import { isDocumentApprover, isDocumentOwnerSameAsEmail } from '@/lib/users';

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

  if (!(await isDocumentApprover(auth.email))) {
    return jsonResponse({ error: 'You are not authorized to reject documents' }, 403);
  }

  try {
    const body = await request.json();
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
    if (!reason) {
      return jsonResponse({ error: 'Rejection reason is required' }, 400);
    }

    const existing = await getDocumentById(id);
    if (!existing) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }

    const document = await rejectDocumentForApproval(id, auth.name, reason);

    await createDocumentEvent({
      documentId: document.id,
      type: 'rejected',
      actorEmail: auth.email,
      actorName: auth.name,
      metadata: { reason },
    });

    if (existing.createdBy) {
      const isCreatorAlsoOwner = await isDocumentOwnerSameAsEmail(document.owner, existing.createdBy);

      await createNotification({
        recipientEmail: existing.createdBy,
        documentId: document.id,
        type: 'document_rejected',
        title: 'Document not approved',
        actorName: auth.name,
        message: isCreatorAlsoOwner
          ? `You did not approve "${document.title}". Reason: ${reason}`
          : `${auth.name} did not approve "${document.title}". Reason: ${reason}`,
      });
    }

    return jsonResponse({ document });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reject document';
    const status = message.includes('not found') ? 404 : 400;
    return jsonResponse({ error: message }, status);
  }
}
