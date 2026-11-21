import { getStoredToken } from './client';
import type { DocumentResponse } from '../../types/documents';

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function uploadDocumentFile(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/documents/${id}/file`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to upload file');
  }

  return data as DocumentResponse;
}

export async function uploadDocumentSourceFile(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/documents/${id}/source`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to upload source file');
  }

  return data as DocumentResponse;
}

export async function fetchDocumentFileBlob(documentId: string): Promise<Blob> {
  const response = await fetch(`/api/documents/${documentId}/file`, {
    credentials: 'include',
    headers: authHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to load file');
  }

  return response.blob();
}

export async function fetchDocumentSourceBlob(documentId: string): Promise<Blob> {
  const response = await fetch(`/api/documents/${documentId}/source`, {
    credentials: 'include',
    headers: authHeaders(),
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