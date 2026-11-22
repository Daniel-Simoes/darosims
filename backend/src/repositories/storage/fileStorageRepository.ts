import { getDatabaseProvider } from '@/database/provider';
import * as files from '@/repositories/storage/fileStorageRepository.files';
import * as supabase from '@/repositories/storage/fileStorageRepository.supabase';

function repo() {
  return getDatabaseProvider() === 'supabase' ? supabase : files;
}

export const MAX_PDF_SIZE_BYTES = files.MAX_PDF_SIZE_BYTES;
export const MAX_SOURCE_SIZE_BYTES = files.MAX_SOURCE_SIZE_BYTES;

export async function ensureUploadDir() {
  return repo().ensureUploadDir();
}

export function getDocumentFilePath(documentId: string) {
  return repo().getDocumentFilePath(documentId);
}

export function getDocumentSourcePath(documentId: string, extension: string) {
  return repo().getDocumentSourcePath(documentId, extension);
}

export async function savePdfFile(documentId: string, data: Buffer, fileName: string) {
  return repo().savePdfFile(documentId, data, fileName);
}

export async function saveSourceFile(documentId: string, data: Buffer, extension: string) {
  return repo().saveSourceFile(documentId, data, extension);
}

export async function readPdfFile(documentId: string, fileName?: string) {
  return repo().readPdfFile(documentId, fileName);
}

export async function readSourceFile(documentId: string) {
  return repo().readSourceFile(documentId);
}

export async function deletePdfFile(documentId: string) {
  return repo().deletePdfFile(documentId);
}

export async function deleteSourceFiles(documentId: string) {
  return repo().deleteSourceFiles(documentId);
}

export async function deleteAllDocumentFiles(documentId: string) {
  return repo().deleteAllDocumentFiles(documentId);
}

export async function stageRevisionBaselineFile(
  documentId: string,
  version: number,
  data: Buffer,
  fileName: string,
) {
  return repo().stageRevisionBaselineFile(documentId, version, data, fileName);
}

export async function readRevisionBaselineFile(
  documentId: string,
  version: number,
  fileName?: string,
) {
  return repo().readRevisionBaselineFile(documentId, version, fileName);
}

export async function writeArchiveStoredFile(archiveId: string, fileName: string, data: Buffer) {
  return repo().writeArchiveStoredFile(archiveId, fileName, data);
}

export async function readArchiveStoredFile(archiveId: string, fileName: string) {
  return repo().readArchiveStoredFile(archiveId, fileName);
}

export async function deleteArchiveStoredFiles(archiveId: string) {
  return repo().deleteArchiveStoredFiles(archiveId);
}
