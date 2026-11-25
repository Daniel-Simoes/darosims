import { fetchAllBodies, upsertBody } from '@/database/supabase/jsonTable';
import type { DocumentFieldOptionRecord } from '@/types/documentFieldOptions';

export async function readAllFieldOptions(): Promise<DocumentFieldOptionRecord[]> {
  return fetchAllBodies<DocumentFieldOptionRecord>('document_field_options');
}

export async function writeAllFieldOptions(options: DocumentFieldOptionRecord[]): Promise<void> {
  for (const record of options) {
    await upsertBody('document_field_options', record);
  }
}

export async function appendFieldOptionRecord(
  record: DocumentFieldOptionRecord,
): Promise<DocumentFieldOptionRecord> {
  await upsertBody('document_field_options', record);
  return record;
}