/** @deprecated Import from `@/services/storage/storageService` instead */
export {
  MAX_PDF_SIZE_BYTES,
  MAX_SOURCE_SIZE_BYTES,
  deleteDocumentFile,
  deleteDocumentSourceFile,
  readDocumentFile,
  readDocumentSourceFile,
  saveDocumentFile,
  saveDocumentSourceFile,
} from '@/services/storage/storageService';

export { ensureUploadDir, getDocumentFilePath, getDocumentSourcePath } from '@/repositories/storage/fileStorageRepository';
