export interface DocumentChatPresenceView {
  userEmail: string;
  userName: string;
  online: boolean;
  isTyping: boolean;
}

export interface DocumentChatPresenceResponse {
  presence: DocumentChatPresenceView[];
}
