import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { deleteDocument, getDocumentById, updateDocument } from '@/lib/documents';
import { deleteDocumentSourceFile } from '@/lib/documentFiles';
import { createDocumentEvent } from '@/lib/documentEvents';
import { createNotification } from '@/lib/notifications';
import type { UpdateDocumentInput } from '@/lib/types';
import { isDocumentApprover, isDocumentOwnerSameAsEmail } from '@/lib/users';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  if (!id?.trim()) {
    return jsonResponse({ error: 'Document id is required' }, 400);
  }

  const document = await getDocumentById(id);
  if (!document) {
    return jsonResponse({ error: 'Document not found' }, 404);
  }

  return jsonResponse({ document });
}

export async function PUT(
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
    const body = await request.json();
    const existing = await getDocumentById(id);
    if (!existing) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }

    if (body.type !== undefined && !String(body.type).trim()) {
      return jsonResponse({ error: 'Document type is required' }, 400);
    }

    const isExternal = (body.documentOrigin ?? existing.documentOrigin) === 'External';
    if (isExternal && body.externalVersion !== undefined && !String(body.externalVersion).trim()) {
      return jsonResponse({ error: 'Version / Edition is required for external documents' }, 400);
    }

    const nextStatus = body.status ?? existing.status;
    const isApproving = existing.status === 'Draft' && nextStatus === 'Active';

    if (isApproving && !(await isDocumentApprover(auth.email))) {
      return jsonResponse({ error: 'You are not authorized to approve documents' }, 403);
    }

    const input: UpdateDocumentInput = {
      type: body.type,
      process: body.process ? String(body.process).trim() : undefined,
      title: body.title ? String(body.title).trim() : undefined,
      version: isExternal
        ? undefined
        : isApproving
          ? Math.max(Number(existing.version) || 0, 1)
          : body.version !== undefined
            ? Number(body.version)
            : undefined,
      status: body.status,
      documentOrigin: body.documentOrigin,
      externalRef: body.externalRef,
      externalVersion: body.externalVersion,
      owner: body.owner,
      approvedBy: isApproving ? auth.name : body.approvedBy,
      department: body.department,
      effectiveDate: body.effectiveDate ?? (isApproving ? new Date().toISOString().slice(0, 10) : undefined),
      reviewFrequency: body.reviewFrequency,
      nextReviewDate: body.nextReviewDate,
      repository: body.repository,
      distribution: body.distribution,
      retentionPeriod: body.retentionPeriod,
      retentionNotes: body.retentionNotes,
      disposition: body.disposition,
      comments: body.comments,
      sourceContent: body.sourceContent,
      fileFormat: isApproving ? 'pdf' : body.fileFormat,
      fileName: isApproving
        ? body.fileName ?? `${existing.title}.pdf`
        : body.fileName,
      sourceModified: isApproving ? false : body.sourceModified,
      ...(body.submittedAt !== undefined ? { submittedAt: body.submittedAt } : {}),
      ...(body.rejectionReason !== undefined ? { rejectionReason: body.rejectionReason } : {}),
      ...(body.rejectedAt !== undefined ? { rejectedAt: body.rejectedAt } : {}),
      ...(body.rejectedBy !== undefined ? { rejectedBy: body.rejectedBy } : {}),
    };

    const document = await updateDocument(id, input);
    if (!document) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }

    if (isApproving && existing.createdBy) {
      await deleteDocumentSourceFile(id);
      const isCreatorAlsoOwner = await isDocumentOwnerSameAsEmail(document.owner, existing.createdBy);

      await createDocumentEvent({
        documentId: document.id,
        type: 'approved',
        actorEmail: auth.email,
        actorName: auth.name,
      });

      await createNotification({
        recipientEmail: existing.createdBy,
        documentId: document.id,
        type: 'document_approved',
        title: isCreatorAlsoOwner ? 'Document created and approved' : 'Document approved',
        actorName: auth.name,
        message: isCreatorAlsoOwner
          ? `You created and approved "${document.title}" and published it as PDF.`
          : `${auth.name} approved "${document.title}" and published it as PDF.`,
      });
    } else {
      const contentChanged =
        body.sourceContent !== undefined && body.sourceContent !== existing.sourceContent;
      const fileChanged = body.fileName !== undefined && body.fileName !== existing.fileName;
      const clearingRejection = body.rejectionReason === '';

      if (contentChanged || fileChanged || clearingRejection) {
        await createDocumentEvent({
          documentId: document.id,
          type: 'edited',
          actorEmail: auth.email,
          actorName: auth.name,
          metadata: {
            action: fileChanged || clearingRejection ? 'file_replaced' : 'content_updated',
            fileName: body.fileName ?? existing.fileName,
          },
        });
      }
    }

    return jsonResponse({ document });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request body';
    return jsonResponse({ error: message }, 400);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  if (!id?.trim()) {
    return jsonResponse({ error: 'Document id is required' }, 400);
  }

  const document = await getDocumentById(id);
  if (!document) {
    return jsonResponse({ error: 'Document not found' }, 404);
  }

  const isApprover =
    !!document.approvedBy?.trim() &&
    auth.name.trim().toLowerCase() === document.approvedBy.trim().toLowerCase();
  const isCreator =
    auth.email.trim().toLowerCase() === (document.createdBy?.trim().toLowerCase() ?? '');
  const canDelete = document.approvedBy?.trim() ? isApprover : isCreator;

  if (!canDelete) {
    return jsonResponse(
      {
        error: document.approvedBy?.trim()
          ? 'Only the person who approved this document can delete it.'
          : 'You are not authorized to delete this document.',
      },
      403,
    );
  }

  const deleted = await deleteDocument(id);
  if (!deleted) {
    return jsonResponse({ error: 'Document not found' }, 404);
  }

  return jsonResponse({ success: true });
}
