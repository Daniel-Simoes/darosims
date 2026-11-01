import { fetchAllBodies, upsertBody } from '@/database/supabase/jsonTable';
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
