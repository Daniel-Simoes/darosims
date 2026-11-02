import {
  readAllChatPresence,
  upsertChatPresence,
} from '@/repositories/presence/documentChatPresenceRepository';
import type { DocumentChatPresenceRecord, DocumentChatPresenceView } from '@/types';

export const ONLINE_WINDOW_MS = 60_000;
export const TYPING_WINDOW_MS = 5_000;

function presenceId(documentId: string, userEmail: string) {
  return `${documentId}::${userEmail.trim().toLowerCase()}`;
}

export async function updateDocumentChatPresence(
  documentId: string,
  userEmail: string,
  userName: string,
  isTyping: boolean,
): Promise<void> {
  const now = new Date().toISOString();
  const record: DocumentChatPresenceRecord = {
    id: presenceId(documentId, userEmail),
    documentId,
    userEmail: userEmail.trim().toLowerCase(),
    userName: userName.trim() || userEmail,
    lastSeenAt: now,
    isTyping,
    typingUpdatedAt: isTyping ? now : undefined,
  };
  await upsertChatPresence(record);
}

export async function listDocumentChatPresence(
  documentId: string,
  viewerEmail: string,
): Promise<DocumentChatPresenceView[]> {
  const now = Date.now();
  const viewer = viewerEmail.trim().toLowerCase();
  const records = await readAllChatPresence();
  const views: DocumentChatPresenceView[] = [];

  for (const record of records) {
    if (record.documentId !== documentId) continue;
    if (record.userEmail === viewer) continue;

    const lastSeen = new Date(record.lastSeenAt).getTime();
    const online = Number.isFinite(lastSeen) && now - lastSeen <= ONLINE_WINDOW_MS;

    let isTyping = false;
    if (record.isTyping && record.typingUpdatedAt) {
      const typingAt = new Date(record.typingUpdatedAt).getTime();
      isTyping = Number.isFinite(typingAt) && now - typingAt <= TYPING_WINDOW_MS;
    }

    views.push({
      userEmail: record.userEmail,
      userName: record.userName,
      online,
      isTyping,
    });
  }

  return views;
}
