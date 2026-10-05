import { isSupabaseDatabase } from '@/database/provider';
import * as files from '@/repositories/audit/documentEventRepository.files';
import * as supabase from '@/repositories/audit/documentEventRepository.supabase';

const repo = isSupabaseDatabase() ? supabase : files;

export const readAllDocumentEvents = repo.readAllDocumentEvents;
export const writeAllDocumentEvents = repo.writeAllDocumentEvents;
export const appendDocumentEventRecord = repo.appendDocumentEventRecord;
export const backfillDocumentEventsIfNeeded = repo.backfillDocumentEventsIfNeeded;
