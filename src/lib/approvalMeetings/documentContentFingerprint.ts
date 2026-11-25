import type { DocumentRecord } from '../../types/documents';

/** Matches backend `buildDocumentContentFingerprint` for live meeting binding checks. */
export async function buildDocumentContentFingerprint(
  document: Pick<DocumentRecord, 'version' | 'fileName' | 'title' | 'revisionFileUpdated'>,
): Promise<string> {
  const parts = [
    String(document.version),
    document.fileName?.trim() ?? '',
    document.title?.trim() ?? '',
    document.revisionFileUpdated ? '1' : '0',
  ];
  const data = new TextEncoder().encode(parts.join('|'));
  const digest = await crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(0, 32);
}