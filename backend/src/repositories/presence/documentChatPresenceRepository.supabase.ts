import { fetchAllBodies, upsertBody } from '@/database/supabase/jsonTable';
import type { DocumentChatPresenceRecord } from '@/types';

export async function readAllChatPresence(): Promise<DocumentChatPresenceRecord[]> {
  return fetchAllBodies<DocumentChatPresenceRecord>('document_chat_presence');
}

export async function upsertChatPresence(record: DocumentChatPresenceRecord): Promise<void> {
  await upsertBody('document_chat_presence', record);
}
