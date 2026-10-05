import { isSupabaseDatabase } from '@/database/provider';
import * as files from '@/repositories/storage/fileStorageRepository.files';
import * as supabase from '@/repositories/storage/fileStorageRepository.supabase';

const repo = isSupabaseDatabase() ? supabase : files;

export const MAX_PDF_SIZE_BYTES = repo.MAX_PDF_SIZE_BYTES;
export const MAX_SOURCE_SIZE_BYTES = repo.MAX_SOURCE_SIZE_BYTES;
export const ensureUploadDir = repo.ensureUploadDir;
export const getDocumentFilePath = repo.getDocumentFilePath;
export const getDocumentSourcePath = repo.getDocumentSourcePath;
export const savePdfFile = repo.savePdfFile;
export const saveSourceFile = repo.saveSourceFile;
export const readPdfFile = repo.readPdfFile;
export const readSourceFile = repo.readSourceFile;
export const deletePdfFile = repo.deletePdfFile;
export const deleteSourceFiles = repo.deleteSourceFiles;
export const deleteAllDocumentFiles = repo.deleteAllDocumentFiles;
