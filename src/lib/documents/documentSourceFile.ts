import { api, type DocumentRecord } from '../api';
import { verifyPdfFile } from './documentUpload';

export async function replaceDocumentSourceFile(
  documentId: string,
  file: File,
): Promise<DocumentRecord> {
  const verifyError = await verifyPdfFile(file);
  if (verifyError) {
    throw new Error(verifyError);
  }

  await api.uploadDocumentFile(documentId, file);

  const { document } = await api.updateDocument(documentId, {
    fileFormat: 'pdf',
    fileName: file.name,
    sourceModified: false,
    rejectionReason: '',
    rejectedAt: '',
    rejectedBy: '',
  });

  return document;
}
