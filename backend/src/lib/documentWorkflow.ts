import type { DocumentRecord } from '@/types';

export function isRejectedDocument(
  document: Pick<DocumentRecord, 'status' | 'submittedAt' | 'rejectionReason'>,
): boolean {
  return (
    document.status === 'Draft' &&
    !document.submittedAt &&
    Boolean(document.rejectionReason?.trim())
  );
}