import {
  fetchAllBodies,
  fetchBodyById,
  replaceAllBodies,
} from '@/database/supabase/jsonTable';
import type { DocumentArchiveRecord } from '@/types/documentArchive';

export async function readAllArchives(): Promise<DocumentArchiveRecord[]> {
  return fetchAllBodies<DocumentArchiveRecord>('document_archives');
}

export async function writeAllArchives(records: DocumentArchiveRecord[]): Promise<void> {
  await replaceAllBodies('document_archives', records);
}

export async function findArchiveById(id: string): Promise<DocumentArchiveRecord | null> {
  return fetchBodyById<DocumentArchiveRecord>('document_archives', id);
}