import { getDatabaseProvider } from '@/database/provider';
import * as files from '@/repositories/documents/archiveRepository.files';
import type { DocumentArchiveRecord } from '@/types/documentArchive';

function repo() {
  if (getDatabaseProvider() === 'supabase') {
    return files;
  }
  return files;
}

export async function readAllArchives(): Promise<DocumentArchiveRecord[]> {
  return repo().readAllArchives();
}

export async function writeAllArchives(records: DocumentArchiveRecord[]): Promise<void> {
  return repo().writeAllArchives(records);
}

export async function findArchiveById(id: string): Promise<DocumentArchiveRecord | null> {
  return repo().findArchiveById(id);
}