import { api, type DocumentRecord } from '../api';
import { fileFormatFromUpload, verifyDocumentFile } from './documentUpload';

export async function replaceDocumentSourceFile(
  documentId: string,
  file: File,
  options?: { clearRejectionMetadata?: boolean },
): Promise<DocumentRecord> {
  const clearRejection = options?.clearRejectionMetadata !== false;
  const verifyError = await verifyDocumentFile(file);
  if (verifyError) {
    throw new Error(verifyError);
  }

  await api.uploadDocumentFile(documentId, file);

  const { document } = await api.updateDocument(documentId, {
    fileFormat: fileFormatFromUpload(file),
    fileName: file.name,
    sourceModified: false,
    ...(clearRejection
      ? { rejectionReason: '', rejectedAt: '', rejectedBy: '' }
      : {}),
  });

  return document;
}