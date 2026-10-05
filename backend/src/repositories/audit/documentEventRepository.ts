import { getDatabaseProvider } from '@/database/provider';
import * as files from '@/repositories/audit/documentEventRepository.files';
import * as supabase from '@/repositories/audit/documentEventRepository.supabase';

function repo() {
  return getDatabaseProvider() === 'supabase' ? supabase : files;
}

export async function readAllDocumentEvents() {
  return repo().readAllDocumentEvents();
}

export async function writeAllDocumentEvents(events: Parameters<typeof files.writeAllDocumentEvents>[0]) {
  return repo().writeAllDocumentEvents(events);
}

export async function appendDocumentEventRecord(event: Parameters<typeof files.appendDocumentEventRecord>[0]) {
  return repo().appendDocumentEventRecord(event);
}

export async function backfillDocumentEventsIfNeeded() {
  return repo().backfillDocumentEventsIfNeeded();
}
