import type { DocumentRecord, UpdateDocumentInput } from '@/types';
import { getDocumentById, updateDocument } from '@/lib/documents';
import {
  isAuthUserDesignatedApprover,
  isPendingDocumentApproval,
  isPendingDocumentReview,
} from '@/lib/documentApproval';
import { isDocumentApprover } from '@/lib/users';
import { ensureSupersededVersionArchived } from '@/services/documents/documentArchiveService';

/**
 * Applies final approval using the same document state transition as PUT /api/documents/:id (status → Active).
 * Server-only — not exposed to arbitrary client payloads.
 */
export async function finalizeDocumentApproval(
  documentId: string,
  auth: { email: string; name: string },
): Promise<{ document: DocumentRecord; archivedOnApprove: Awaited<ReturnType<typeof ensureSupersededVersionArchived>> }> {
  const existing = await getDocumentById(documentId);
  if (!existing) {
    throw new Error('Document not found');
  }
  if (existing.documentOrigin === 'External') {
    throw new Error('External documents cannot be approved through this workflow');
  }
  if (existing.status !== 'Draft') {
    throw new Error('Only draft documents can be approved');
  }
  if (isPendingDocumentReview(existing)) {
    throw new Error('Complete the review step before approving this document');
  }
  if (!isPendingDocumentApproval(existing)) {
    throw new Error('Document is not awaiting final approval');
  }
  if (!(await isDocumentApprover(auth.email))) {
    throw new Error('You are not authorized to approve documents');
  }
  if (!(await isAuthUserDesignatedApprover(auth.email, existing))) {
    throw new Error('Only the designated approver can approve this document');
  }

  let archivedOnApprove: Awaited<ReturnType<typeof ensureSupersededVersionArchived>> = null;

  let input: UpdateDocumentInput = {
    status: 'Active',
    approvedBy: auth.name,
    submittedAt: undefined,
    reviewedAt: undefined,
    reviewedBy: undefined,
    effectiveDate: new Date().toISOString().slice(0, 10),
    version: Math.max(Number(existing.revisionTargetVersion ?? existing.version) || 0, 1),
    fileFormat: existing.fileFormat,
    fileName: existing.fileName,
  };

  if (existing.publishedBaseline) {
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

  const document = await updateDocument(documentId, input);
  if (!document) {
    throw new Error('Document not found');
  }

  return { document, archivedOnApprove };
}