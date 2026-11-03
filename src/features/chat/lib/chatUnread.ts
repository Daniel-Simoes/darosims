import type { DocumentCommentMessage } from '../../../types/documentComments';
import { CHAT_ACTIVITY_EVENT, getChatLastRead } from './chatReadState';

export { CHAT_ACTIVITY_EVENT, CHAT_READ_EVENT } from './chatReadState';

export function countUnreadChatMessages(
  messages: DocumentCommentMessage[],
  documentId: string,
  currentUserEmail: string,
): number {
  const me = currentUserEmail.trim().toLowerCase();
  const lastRead = getChatLastRead(documentId);

  return messages.filter((message) => {
    if (message.senderEmail.trim().toLowerCase() === me) return false;
    if (!lastRead) return true;
    return message.createdAt > lastRead;
  }).length;
}

export function notifyChatActivity() {
  window.dispatchEvent(new CustomEvent(CHAT_ACTIVITY_EVENT));
}
