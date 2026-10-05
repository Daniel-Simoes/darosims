export const DOCUMENT_DETAIL_PREFIX = 'document-detail-';

export function getDocumentDetailViewId(id: string) {
  return `${DOCUMENT_DETAIL_PREFIX}${id}`;
}

export function parseDocumentDetailViewId(activeNav: string): string | null {
  if (!activeNav.startsWith(DOCUMENT_DETAIL_PREFIX)) return null;
  return activeNav.slice(DOCUMENT_DETAIL_PREFIX.length);
}
