import { getDatabaseProvider } from '@/database/provider';
import * as files from '@/repositories/documents/documentRepository.files';
import * as supabase from '@/repositories/documents/documentRepository.supabase';

function repo() {
  return getDatabaseProvider() === 'supabase' ? supabase : files;
}

export async function readAllDocuments() {
  return repo().readAllDocuments();
}

export async function writeAllDocuments(documents: Parameters<typeof files.writeAllDocuments>[0]) {
  return repo().writeAllDocuments(documents);
}

export async function findDocumentById(id: string) {
  return repo().findDocumentById(id);
}

export async function saveDocumentRecord(document: Parameters<typeof files.saveDocumentRecord>[0]) {
  return repo().saveDocumentRecord(document);
}

export async function removeDocumentRecord(id: string) {
  return repo().removeDocumentRecord(id);
}
