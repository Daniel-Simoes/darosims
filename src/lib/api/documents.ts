import { apiFetch } from './client';
import type {
  CreateDocumentPayload,
  CreateDocumentResponse,
  DeleteDocumentResponse,
  DocumentResponse,
  DocumentsResponse,
  UpdateDocumentPayload,
} from '../../types/documents';

export const documentsApi = {
  getDocuments() {
    return apiFetch<DocumentsResponse>('/api/documents');
  },

  getMyDrafts() {
    return apiFetch<DocumentsResponse>('/api/documents?scope=drafts');
  },

  getDocument(id: string) {
    return apiFetch<DocumentResponse>(`/api/documents/${id}`);
  },

  createDocument(payload: CreateDocumentPayload) {
    return apiFetch<CreateDocumentResponse>('/api/documents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteDocument(id: string) {
    return apiFetch<DeleteDocumentResponse>(`/api/documents/${id}`, {
      method: 'DELETE',
    });
  },

  updateDocument(id: string, payload: UpdateDocumentPayload) {
    return apiFetch<DocumentResponse>(`/api/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  submitDocumentForApproval(id: string) {
    return apiFetch<DocumentResponse>(`/api/documents/${id}/submit`, {
      method: 'POST',
    });
  },

  rejectDocumentForApproval(id: string, reason: string) {
    return apiFetch<DocumentResponse>(`/api/documents/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};
