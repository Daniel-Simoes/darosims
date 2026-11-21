import { getDatabaseProvider } from '@/database/provider';
import * as files from '@/repositories/documents/archiveRepository.files';
import * as supabase from '@/repositories/documents/archiveRepository.supabase';
import type { DocumentArchiveRecord } from '@/types/documentArchive';

function repo() {
  return getDatabaseProvider() === 'supabase' ? supabase : files;
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