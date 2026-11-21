import type { DocumentRecord } from '../../types/documents';

type DocumentStatusInput = Pick<DocumentRecord, 'status'> &
  Partial<Pick<DocumentRecord, 'submittedAt' | 'rejectionReason' | 'documentOrigin' | 'reviewedAt'>>;

export function isInternalDraftDocument(document: DocumentStatusInput): boolean {
  return document.documentOrigin !== 'External' && document.status === 'Draft';
}

/** Draft submitted and waiting for document owner (reviewer) action. */
export function isPendingApprovalDocument(document: DocumentStatusInput): boolean {
  return document.status === 'Draft' && Boolean(document.submittedAt) && !document.reviewedAt;
}

/** Reviewed and waiting for designated approver. */
export function isPendingFinalApprovalDocument(
  document: Pick<DocumentRecord, 'status' | 'reviewedAt'>,
): boolean {
  return document.status === 'Draft' && Boolean(document.reviewedAt);
}

export const isPendingReviewDocument = isPendingApprovalDocument;

export function isRejectedDocument(document: DocumentStatusInput): boolean {
  return (
    document.status === 'Draft' &&
    !document.submittedAt &&
    Boolean(document.rejectionReason?.trim())
  );
}

export function getDocumentStatusLabel(
  document: DocumentStatusInput & Pick<DocumentRecord, 'reviewedAt'>,
): string {
  if (isPendingFinalApprovalDocument(document)) {
    return 'Pending Approval';
  }
  if (isPendingApprovalDocument(document)) {
    return 'Pending Review';
  }
  if (isRejectedDocument(document)) {
    return 'Not Approved';
  }
  return document.status;
}

export function getDocumentStatusBadgeClass(
  document: DocumentStatusInput & Pick<DocumentRecord, 'reviewedAt'>,
): string {
  if (isPendingFinalApprovalDocument(document) || isPendingApprovalDocument(document)) {
    return 'badge-pending';
  }
  if (isRejectedDocument(document)) {
    return 'badge-rejected';
  }

  switch (document.status) {
    case 'Active':
      return 'badge-active';
    case 'Draft':
      return 'badge-draft';
    case 'Obsolete':
      return 'badge-obsolete';
    default:
      return 'badge-default';
  }
}

export function isPdfDocument(
  document: Pick<DocumentRecord, 'fileFormat' | 'fileName' | 'status' | 'documentOrigin'>,
): boolean {
  if (document.fileFormat === 'pdf') return true;
  if (document.fileName?.toLowerCase().endsWith('.pdf')) return true;
  return false;
}

export function getDocumentFileLabel(
  document: Pick<DocumentRecord, 'fileName' | 'fileFormat' | 'status' | 'documentOrigin'>,
): string {
  return document.fileName || 'Attached file';
}
