import { isSupabaseDatabase } from '@/database/provider';
import * as files from '@/repositories/documents/documentRepository.files';
import * as supabase from '@/repositories/documents/documentRepository.supabase';

const repo = isSupabaseDatabase() ? supabase : files;

export const readAllDocuments = repo.readAllDocuments;
export const writeAllDocuments = repo.writeAllDocuments;
export const findDocumentById = repo.findDocumentById;
export const saveDocumentRecord = repo.saveDocumentRecord;
export const removeDocumentRecord = repo.removeDocumentRecord;
