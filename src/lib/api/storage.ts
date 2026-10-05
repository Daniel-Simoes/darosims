import { getStoredToken } from './client';
import type { DocumentResponse } from '../../types/documents';

export async function uploadDocumentFile(id: string, file: File) {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api/documents/${id}/file`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to upload PDF');
  }

  return data as DocumentResponse;
}

export async function uploadDocumentSourceFile(id: string, file: File) {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api/documents/${id}/source`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to upload source file');
  }

  return data as DocumentResponse;
}

export async function fetchDocumentFileBlob(documentId: string): Promise<Blob> {
  const token = getStoredToken();
  const response = await fetch(`/api/documents/${documentId}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to load PDF');
  }

  return response.blob();
}

export async function fetchDocumentSourceBlob(documentId: string): Promise<Blob> {
  const token = getStoredToken();
  const response = await fetch(`/api/documents/${documentId}/source`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to load source file');
  }

  return response.blob();
}

export const storageApi = {
  uploadDocumentFile,
  uploadDocumentSourceFile,
  fetchDocumentFileBlob,
  fetchDocumentSourceBlob,
};
