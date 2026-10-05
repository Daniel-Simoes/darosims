import { apiFetch } from './client';
import type { DocumentEventsResponse } from '../../types/audit';

export const auditApi = {
  getDocumentEvents(documentId?: string) {
    const query = documentId ? `?documentId=${encodeURIComponent(documentId)}` : '';
    return apiFetch<DocumentEventsResponse>(`/api/document-events${query}`);
  },
};
