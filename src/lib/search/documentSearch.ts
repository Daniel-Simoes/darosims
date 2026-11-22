import { formatDocumentCodeForRecord } from '../documents/documentCode';

export function getDocumentDisplayCode(doc: {
  code?: string;
  externalRef?: string;
  documentOrigin?: string;
  version?: number;
  revisionTargetVersion?: number;
  publishedBaseline?: unknown;
  submittedAt?: string;
}): string {
  return formatDocumentCodeForRecord(doc);
}

export function matchesTitleOrCode(
  query: string,
  item: {
    title?: string;
    code?: string;
    externalRef?: string;
    documentOrigin?: string;
    version?: number;
  },
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  if (item.title?.toLowerCase().includes(q)) return true;

  const code = getDocumentDisplayCode(item);
  if (code.toLowerCase().includes(q)) return true;

  return false;
}
