import { createHash } from 'crypto';
import type { DocumentRecord } from '@/types';

/** Stable snapshot for binding a live meeting to a specific document revision. */
export function buildDocumentContentFingerprint(
  document: Pick<DocumentRecord, 'version' | 'fileName' | 'title' | 'revisionFileUpdated'>,
): string {
  const parts = [
    String(document.version),
    document.fileName?.trim() ?? '',
    document.title?.trim() ?? '',
    document.revisionFileUpdated ? '1' : '0',
  ];
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 32);
}