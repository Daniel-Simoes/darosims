import { apiFetch, getStoredToken } from './client';
import type { DocumentArchivesResponse } from '../../types/documentArchive';

const apiBase = import.meta.env.VITE_API_URL ?? '';

export type DeleteDocumentArchiveResponse = { success: boolean };

export const documentArchivesApi = {
  getDocumentArchives() {
    return apiFetch<DocumentArchivesResponse>('/api/document-archives');
  },

  deleteDocumentArchive(id: string) {
    return apiFetch<DeleteDocumentArchiveResponse>(`/api/document-archives/${id}`, {
      method: 'DELETE',
    });
  },
};

export async function fetchArchiveFileBlob(archiveId: string): Promise<Blob> {
  const token = getStoredToken();
  const response = await fetch(`${apiBase}/api/document-archives/${archiveId}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error('Unable to load archived file');
  }
  return response.blob();
}