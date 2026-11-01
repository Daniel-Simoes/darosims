export interface DocumentCommentMessage {
  id: string;
  documentId: string;
  senderEmail: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface DocumentCommentsResponse {
  messages: DocumentCommentMessage[];
}

export interface PostDocumentCommentResponse {
  message: DocumentCommentMessage;
}

export interface DocumentChatSummary {
  documentId: string;
  documentTitle: string;
  documentCode: string;
  lastMessageText: string;
  lastMessageAt: string;
  lastSenderName: string;
}

export interface DocumentChatsResponse {
  chats: DocumentChatSummary[];
}

export type DocumentChatParticipantRole = 'chat_starter' | 'creator' | 'approver';

export interface DocumentChatParticipant {
  id: string;
  name: string;
  email: string;
  role: DocumentChatParticipantRole;
  roleLabel: string;
}
