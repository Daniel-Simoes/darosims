import { randomUUID } from 'crypto';
import { getDocumentById } from '@/lib/documents';
import {
  appendDocumentComment,
  deleteCommentsByDocumentId,
  readAllDocumentComments,
} from '@/repositories/comments/documentCommentRepository';
import { deletePresenceByDocumentId } from '@/repositories/presence/documentChatPresenceRepository';
import { isUserInvolvedInDocumentChat } from '@/services/comments/documentChatListService';
import { notifyDocumentCommentRecipients } from '@/services/comments/documentCommentNotifications';
import type { DocumentCommentMessage } from '@/types';

const MAX_MESSAGE_LENGTH = 2000;

export async function listDocumentComments(documentId: string): Promise<DocumentCommentMessage[]> {
  const comments = await readAllDocumentComments();
  return comments
    .filter((item) => item.documentId === documentId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function postDocumentComment(
  documentId: string,
  senderEmail: string,
  senderName: string,
  text: string,
): Promise<DocumentCommentMessage> {
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Message is required');
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new Error('Message is too long');
  }

  const existingMessages = await listDocumentComments(documentId);

  const message: DocumentCommentMessage = {
    id: randomUUID(),
    documentId,
    senderEmail: senderEmail.trim().toLowerCase(),
    senderName: senderName.trim() || senderEmail,
    text: trimmed,
    createdAt: new Date().toISOString(),
  };

  const saved = await appendDocumentComment(message);

  await notifyDocumentCommentRecipients(
    document,
    existingMessages,
    senderEmail,
    senderName,
  );

  return saved;
}

export async function deleteDocumentConversation(
  documentId: string,
  userEmail: string,
  userName: string,
): Promise<void> {
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  const messages = await listDocumentComments(documentId);
  if (messages.length === 0) {
    throw new Error('Conversation is already empty');
  }

  if (!isUserInvolvedInDocumentChat(document, messages, userEmail, userName)) {
    throw new Error('You do not have access to this conversation');
  }

  await deleteCommentsByDocumentId(documentId);
  try {
    await deletePresenceByDocumentId(documentId);
  } catch {
    /* presence table optional */
  }
}
