export interface DocumentChatPresenceRecord {
  id: string;
  documentId: string;
  userEmail: string;
  userName: string;
  lastSeenAt: string;
  isTyping: boolean;
  typingUpdatedAt?: string;
}

export interface DocumentChatPresenceView {
  userEmail: string;
  userName: string;
  online: boolean;
  isTyping: boolean;
}
