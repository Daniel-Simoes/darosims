import type { DocumentRecord } from '../../types/documents';

type DocumentStatusInput = Pick<DocumentRecord, 'status'> &
  Partial<Pick<DocumentRecord, 'submittedAt' | 'rejectionReason' | 'documentOrigin'>>;

export function isInternalDraftDocument(document: DocumentStatusInput): boolean {
  return document.documentOrigin !== 'External' && document.status === 'Draft';
}

export function isPendingApprovalDocument(document: DocumentStatusInput): boolean {
  return document.status === 'Draft' && Boolean(document.submittedAt);
}

export function isRejectedDocument(document: DocumentStatusInput): boolean {
  return (
    document.status === 'Draft' &&
    !document.submittedAt &&
    Boolean(document.rejectionReason?.trim())
  );
}

export function getDocumentStatusLabel(document: DocumentStatusInput): string {
  if (isPendingApprovalDocument(document)) {
    return 'Pending Approval';
  }
  if (isRejectedDocument(document)) {
    return 'Not Approved';
  }
  return document.status;
}

export function getDocumentStatusBadgeClass(document: DocumentStatusInput): string {
  if (isPendingApprovalDocument(document)) {
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

export function isPdfDocument(document: Pick<DocumentRecord, 'fileFormat' | 'status' | 'documentOrigin'>): boolean {
  if (document.documentOrigin === 'External') return true;
  return document.status === 'Active' || document.fileFormat === 'pdf';
}

export function getDocumentFileLabel(document: Pick<DocumentRecord, 'fileName' | 'fileFormat' | 'status' | 'documentOrigin'>): string {
  if (isInternalDraftDocument(document)) {
    return document.fileName || 'Word document (draft)';
  }
  return document.fileName || 'PDF document';
}
