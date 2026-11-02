import { fetchAllBodies, replaceAllBodies, upsertBody } from '@/database/supabase/jsonTable';
import type { DocumentCommentMessage } from '@/types';

export async function readAllDocumentComments(): Promise<DocumentCommentMessage[]> {
  return fetchAllBodies<DocumentCommentMessage>('document_comments');
}

export async function appendDocumentComment(
  message: DocumentCommentMessage,
): Promise<DocumentCommentMessage> {
  await upsertBody('document_comments', message);
  return message;
}

export async function deleteCommentsByDocumentId(documentId: string): Promise<number> {
  const comments = await readAllDocumentComments();
  const remaining = comments.filter((item) => item.documentId !== documentId);
  const removed = comments.length - remaining.length;
  if (removed === 0) return 0;
  await replaceAllBodies('document_comments', remaining);
  return removed;
}
