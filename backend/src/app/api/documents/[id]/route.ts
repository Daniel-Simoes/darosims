import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { deleteDocument, getDocumentById, updateDocument } from '@/lib/documents';
import { createDocumentEvent } from '@/lib/documentEvents';
import { createNotification } from '@/lib/notifications';
import type { UpdateDocumentInput } from '@/lib/types';
import {
  isAuthUserDesignatedApprover,
  isPendingDocumentApproval,
  isPendingDocumentReview,
} from '@/lib/documentApproval';
import {
  canAuthUserEditDocument,
  isAuthUserInvolvedInDocument,
} from '@/lib/documentOwnership';
import {
  getNextDocumentVersion,
  isValidRevisionTargetVersion,
} from '@/lib/documentVersionRevision';
import { isDocumentApprover } from '@/lib/users';
import {
  isSelfServiceDocumentWorkflow,
  shouldNotifyUser,
} from '@/lib/documentWorkflowNotifications';
import { buildClientDocumentUpdate } from '@/lib/security/documentUpdate';
import { requirePermission } from '@/lib/security/authz';
import {
  capturePublishedBaseline,
  resolveDocumentForAuthUser,
} from '@/lib/documentPublishedBaseline';
import { normalizeTeamEmail } from '@/lib/legacyEmails';
import { canAuthUserViewDocument } from '@/lib/documentVisibility';
import {
  ensureSupersededVersionArchived,
  stagePublishedRevisionFile,
} from '@/services/documents/documentArchiveService';
import { canAuthUserDeleteDocument } from '@/lib/documentDelete';

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

  if (!(await canAuthUserViewDocument(auth, document))) {
    return jsonResponse({ error: 'Document not found' }, 404);
  }

  return jsonResponse({ document: await resolveDocumentForAuthUser(auth, document) });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const editAuth = await requirePermission(auth, 'edit_documents');
  if (editAuth instanceof Response) return editAuth;

  const { id } = await params;
  if (!id?.trim()) {
    return jsonResponse({ error: 'Document id is required' }, 400);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = await getDocumentById(id);
    if (!existing) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }
    if (!(await canAuthUserViewDocument(auth, existing))) {
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
    const isBeginningRevision =
      body.beginRevision === true &&
      existing.status === 'Active' &&
      nextStatus === 'Draft' &&
      !isExternal;

    if (existing.status === 'Active' && !isBeginningRevision) {
      return jsonResponse(
        {
          error:
            'This document is approved and in effect. Start a new version revision instead of editing it.',
        },
        403,
      );
    }

    if (isBeginningRevision) {
      const versionAuth = await requirePermission(auth, 'create_versions');
      if (versionAuth instanceof Response) return versionAuth;
      if (!(await isAuthUserInvolvedInDocument(auth, existing))) {
        return jsonResponse({ error: 'You are not allowed to revise this document' }, 403);
      }
      const nextVersion = getNextDocumentVersion(existing.version);
      if (!isValidRevisionTargetVersion(existing.version, nextVersion)) {
        return jsonResponse({ error: 'Invalid revision version number' }, 400);
      }
    } else {
      const approvalOnly =
        isApproving &&
        isPendingDocumentApproval(existing) &&
        (await isAuthUserDesignatedApprover(auth.email, existing));
      if (!approvalOnly && !(await canAuthUserEditDocument(auth, existing))) {
        return jsonResponse({ error: 'You are not allowed to edit this document' }, 403);
      }
    }

    if (isApproving && !(await isDocumentApprover(auth.email))) {
      return jsonResponse({ error: 'You are not authorized to approve documents' }, 403);
    }

    if (isApproving && isPendingDocumentReview(existing)) {
      return jsonResponse(
        { error: 'Complete the review step before approving this document' },
        403,
      );
    }

    if (isApproving && isPendingDocumentApproval(existing)) {
      if (!(await isAuthUserDesignatedApprover(auth.email, existing))) {
        return jsonResponse(
          { error: 'Only the designated approver can approve this document' },
          403,
        );
      }
    }

    let archivedOnApprove: Awaited<ReturnType<typeof ensureSupersededVersionArchived>> = null;

    let input = buildClientDocumentUpdate(body, existing, {
      isApproving,
      approverName: auth.name,
    });

    if (isBeginningRevision) {
      await stagePublishedRevisionFile(existing);
      const nextRevisionVersion = getNextDocumentVersion(existing.version);
      input = {
        ...input,
        status: 'Draft',
        version: existing.version,
        revisionTargetVersion: nextRevisionVersion,
        revisionFileUpdated: false,
        publishedBaseline: capturePublishedBaseline(existing),
        revisionStartedBy: normalizeTeamEmail(auth.email) ?? auth.email.trim().toLowerCase(),
        lastSubmittedBy: undefined,
        submittedAt: undefined,
        reviewedAt: undefined,
        reviewedBy: undefined,
        approvedBy: undefined,
        owner: '',
        approver: '',
        rejectedAt: undefined,
        rejectedBy: undefined,
        rejectionReason: undefined,
      };
    }

    if (isApproving && existing.publishedBaseline) {
      archivedOnApprove = await ensureSupersededVersionArchived(
        existing,
        auth,
        Number(existing.version),
      );
      input = {
        ...input,
        publishedBaseline: undefined,
        revisionStartedBy: undefined,
        revisionTargetVersion: undefined,
        revisionFileUpdated: undefined,
        lastSubmittedBy: undefined,
      };
    }

    input = {
      ...input,
      type: input.type !== undefined ? String(input.type).trim() : undefined,
      process: input.process !== undefined ? String(input.process).trim() : undefined,
      title: input.title !== undefined ? String(input.title).trim() : undefined,
      version: isExternal
        ? undefined
        : isApproving
          ? Math.max(
              Number(existing.revisionTargetVersion ?? existing.version) || 0,
              1,
            )
          : input.version !== undefined
            ? Number(input.version)
            : undefined,
      effectiveDate:
        input.effectiveDate ?? (isApproving ? new Date().toISOString().slice(0, 10) : undefined),
      fileFormat: input.fileFormat ?? existing.fileFormat,
      fileName: input.fileName ?? (isApproving ? existing.fileName : undefined),
      sourceModified: input.sourceModified ?? existing.sourceModified,
    };

    const document = await updateDocument(id, input);
    if (!document) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }

    if (isBeginningRevision) {
      await createDocumentEvent({
        documentId: document.id,
        type: 'revision_started',
        actorEmail: auth.email,
        actorName: auth.name,
        metadata: {
          version: String(document.revisionTargetVersion ?? document.version),
          previousVersion: String(existing.version),
        },
      });
    }

    if (isApproving) {
      await createDocumentEvent({
        documentId: document.id,
        type: 'approved',
        actorEmail: auth.email,
        actorName: auth.name,
        metadata: {
          version: String(document.version),
        },
      });

      if (archivedOnApprove) {
        await createDocumentEvent({
          documentId: document.id,
          type: 'version_archived',
          actorEmail: auth.email,
          actorName: auth.name,
          metadata: {
            version: String(archivedOnApprove.version),
            supersededByVersion: String(archivedOnApprove.supersededByVersion),
          },
        });
      }

      const selfService = await isSelfServiceDocumentWorkflow(document);
      if (
        existing.createdBy &&
        !selfService &&
        shouldNotifyUser(existing.createdBy, auth.email)
      ) {
        await createNotification({
          recipientEmail: existing.createdBy,
          documentId: document.id,
          type: 'document_approved',
          title: 'Document approved',
          actorName: auth.name,
          message: `${auth.name} approved your document "${document.title}".`,
        });
      }
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
            fileName:
              typeof body.fileName === 'string' ? body.fileName : (existing.fileName ?? undefined),
          },
        });
      }
    }

    return jsonResponse({ document: await resolveDocumentForAuthUser(auth, document) });
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

  if (!canAuthUserDeleteDocument(auth, document)) {
    const lockedInControl =
      document.status === 'Active' ||
      Boolean(document.publishedBaseline) ||
      Boolean(document.approvedBy?.trim());
    return jsonResponse(
      {
        error: lockedInControl
          ? 'Approved documents cannot be deleted here. Remove superseded versions from Document Archives.'
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
