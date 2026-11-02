import { fetchAllBodies, replaceAllBodies, upsertBody } from '@/database/supabase/jsonTable';
import type { DocumentChatPresenceRecord } from '@/types';

export async function readAllChatPresence(): Promise<DocumentChatPresenceRecord[]> {
  return fetchAllBodies<DocumentChatPresenceRecord>('document_chat_presence');
}

export async function upsertChatPresence(record: DocumentChatPresenceRecord): Promise<void> {
  await upsertBody('document_chat_presence', record);
}

export async function deletePresenceByDocumentId(documentId: string): Promise<void> {
  const all = await readAllChatPresence();
  const remaining = all.filter((item) => item.documentId !== documentId);
  if (remaining.length === all.length) return;
  await replaceAllBodies('document_chat_presence', remaining);
}
