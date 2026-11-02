import { readAllDocuments } from '@/repositories/documents/documentRepository';
import { readAllDocumentComments } from '@/repositories/comments/documentCommentRepository';
import type { DocumentChatSummary, DocumentCommentMessage, DocumentRecord } from '@/types';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isUserInvolvedInDocumentChat(
  document: DocumentRecord,
  messages: DocumentCommentMessage[],
  userEmail: string,
  userName: string,
): boolean {
  const email = normalizeEmail(userEmail);
  const name = userName.trim().toLowerCase();

  if (document.createdBy && normalizeEmail(document.createdBy) === email) return true;
  if (messages.some((item) => normalizeEmail(item.senderEmail) === email)) return true;
  if (document.owner?.trim().toLowerCase() === name) return true;
  if (document.approvedBy?.trim().toLowerCase() === name) return true;

  return false;
}

function documentCodeLabel(document: DocumentRecord): string {
  if (document.documentOrigin === 'External') {
    return document.externalRef?.trim() || 'External';
  }
  return document.code?.trim() || '—';
}

export async function listDocumentChatsForUser(
  userEmail: string,
  userName: string,
): Promise<DocumentChatSummary[]> {
  const comments = await readAllDocumentComments();
  const byDocument = new Map<string, DocumentCommentMessage[]>();

  for (const comment of comments) {
    const bucket = byDocument.get(comment.documentId) ?? [];
    bucket.push(comment);
    byDocument.set(comment.documentId, bucket);
  }

  if (byDocument.size === 0) return [];

  const documents = await readAllDocuments();
  const documentById = new Map(documents.map((document) => [document.id, document]));
  const summaries: DocumentChatSummary[] = [];

  for (const [documentId, messages] of byDocument) {
    if (messages.length === 0) continue;

    messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const document = documentById.get(documentId);
    if (!document) continue;
    if (!isUserInvolvedInDocumentChat(document, messages, userEmail, userName)) continue;

    const last = messages[messages.length - 1];
    summaries.push({
      documentId,
      documentTitle: document.title,
      documentCode: documentCodeLabel(document),
      lastMessageText: last.text,
      lastMessageAt: last.createdAt,
      lastSenderName: last.senderName,
    });
  }

  summaries.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  return summaries;
}
