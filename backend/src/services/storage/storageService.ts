import {
  deleteAllDocumentFiles,
  deletePdfFile,
  deleteSourceFiles,
  readPdfFile,
  readSourceFile,
  savePdfFile,
  saveSourceFile,
} from '@/repositories/storage/fileStorageRepository';

export const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_SOURCE_SIZE_BYTES = 50 * 1024 * 1024;

export const storageService = {
  maxPdfSizeBytes: MAX_PDF_SIZE_BYTES,
  maxSourceSizeBytes: MAX_SOURCE_SIZE_BYTES,
  savePdfFile,
  saveSourceFile,
  readPdfFile,
  readSourceFile,
  deletePdfFile,
  deleteSourceFiles,
  deleteAllDocumentFiles,
};

export {
  deleteAllDocumentFiles as deleteDocumentFile,
  deleteSourceFiles as deleteDocumentSourceFile,
  readPdfFile as readDocumentFile,
  readSourceFile as readDocumentSourceFile,
  savePdfFile as saveDocumentFile,
  saveSourceFile as saveDocumentSourceFile,
};
