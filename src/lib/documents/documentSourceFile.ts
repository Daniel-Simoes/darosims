import { api, type DocumentRecord } from '../api';
import { parseDocxFile, parseTextFile } from './documentContent';
import { getInternalFileKind, verifyInternalDocumentFile } from './documentUpload';

export async function replaceDocumentSourceFile(
  documentId: string,
  file: File,
): Promise<DocumentRecord> {
  const verifyError = await verifyInternalDocumentFile(file);
  if (verifyError) {
    throw new Error(verifyError);
  }

  const kind = getInternalFileKind(file);
  if (!kind || kind === 'pdf') {
    throw new Error('Accepted formats: Word (.docx) or text (.txt).');
  }

  const sourceContent =
    kind === 'docx' ? await parseDocxFile(file) : await parseTextFile(file);

  await api.uploadDocumentSourceFile(documentId, file);

  const { document } = await api.updateDocument(documentId, {
    sourceContent,
    fileFormat: 'word',
    fileName: file.name,
    sourceModified: false,
    rejectionReason: '',
    rejectedAt: '',
    rejectedBy: '',
  });

  return document;
}
