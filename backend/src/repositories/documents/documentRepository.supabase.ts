import {
  deleteById,
  fetchAllBodies,
  fetchBodyById,
  replaceAllBodies,
  upsertBody,
} from '@/database/supabase/jsonTable';
import type { DocumentRecord } from '@/types';

export async function readAllDocuments(): Promise<DocumentRecord[]> {
  return fetchAllBodies<DocumentRecord>('documents');
}

export async function writeAllDocuments(documents: DocumentRecord[]): Promise<void> {
  await replaceAllBodies('documents', documents);
}

export async function findDocumentById(id: string): Promise<DocumentRecord | null> {
  return fetchBodyById<DocumentRecord>('documents', id);
}

export async function saveDocumentRecord(document: DocumentRecord): Promise<void> {
  await upsertBody('documents', document);
}

export async function removeDocumentRecord(id: string): Promise<boolean> {
  return deleteById('documents', id);
}
