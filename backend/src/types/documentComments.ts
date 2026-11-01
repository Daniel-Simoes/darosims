export interface DocumentCommentMessage {
  id: string;
  documentId: string;
  senderEmail: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface DocumentChatSummary {
  documentId: string;
  documentTitle: string;
  documentCode: string;
  lastMessageText: string;
  lastMessageAt: string;
  lastSenderName: string;
}
