import type { DocumentRecord } from '@/types';

function matchesApproverIdentity(
  auth: { email: string; name: string },
  approverLabel: string | undefined,
): boolean {
  if (!approverLabel?.trim()) return false;
  const ref = approverLabel.trim().toLowerCase();
  return (
    auth.name.trim().toLowerCase() === ref || auth.email.trim().toLowerCase() === ref
  );
}

export function canAuthUserDeleteDocument(
  auth: { email: string; name: string },
  document: Pick<DocumentRecord, 'status' | 'createdBy' | 'approvedBy' | 'publishedBaseline'>,
): boolean {
  const lockedInControl =
    document.status === 'Active' ||
    Boolean(document.publishedBaseline) ||
    Boolean(document.approvedBy?.trim());

  if (lockedInControl) return false;

  const creator = document.createdBy?.trim().toLowerCase() ?? '';
  return Boolean(creator && auth.email.trim().toLowerCase() === creator);
}

export function canAuthUserDeleteDocumentArchive(
  auth: { email: string; name: string },
  archive: { approvedBy?: string },
): boolean {
  return matchesApproverIdentity(auth, archive.approvedBy?.trim());
}

export function canAuthUserArchiveDocument(
  auth: { email: string; name: string },
  document: Pick<
    DocumentRecord,
    'status' | 'approvedBy' | 'publishedBaseline' | 'documentOrigin'
  >,
): boolean {
  if (document.status !== 'Active') return false;
  if (document.publishedBaseline) return false;
  if (document.documentOrigin === 'External') return false;
  return matchesApproverIdentity(auth, document.approvedBy?.trim());
}