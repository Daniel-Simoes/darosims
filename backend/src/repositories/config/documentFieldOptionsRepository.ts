import { getDatabaseProvider } from '@/database/provider';
import * as files from '@/repositories/config/documentFieldOptionsRepository.files';
import * as supabase from '@/repositories/config/documentFieldOptionsRepository.supabase';

function repo() {
  return getDatabaseProvider() === 'supabase' ? supabase : files;
}

export async function readAllFieldOptions() {
  return repo().readAllFieldOptions();
}

export async function appendFieldOptionRecord(
  record: Parameters<typeof files.appendFieldOptionRecord>[0],
) {
  return repo().appendFieldOptionRecord(record);
}