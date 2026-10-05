export function getDocumentDisplayCode(doc: {
  code?: string;
  externalRef?: string;
  documentOrigin?: string;
}): string {
  if (doc.documentOrigin === 'External') {
    return doc.externalRef?.trim() ?? '';
  }
  return doc.code?.trim() ?? '';
}

export function matchesTitleOrCode(
  query: string,
  item: { title?: string; code?: string; externalRef?: string; documentOrigin?: string },
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  if (item.title?.toLowerCase().includes(q)) return true;

  const code = getDocumentDisplayCode(item);
  if (code.toLowerCase().includes(q)) return true;

  return false;
}
