import { apiFetch } from './client';
import type { DocumentChatsResponse } from '../../types/documentComments';

export const chatsApi = {
  getDocumentChats() {
    return apiFetch<DocumentChatsResponse>('/api/document-chats');
  },
};
