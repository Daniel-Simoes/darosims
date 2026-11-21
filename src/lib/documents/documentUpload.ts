import { inferDocumentFileFormat, isBlockedDocumentExtension } from './documentFileKind';

export const MAX_DOCUMENT_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/** @deprecated Use MAX_DOCUMENT_FILE_SIZE_BYTES */
export const MAX_PDF_SIZE_BYTES = MAX_DOCUMENT_FILE_SIZE_BYTES;

export function validateDocumentFile(file: File): string | null {
  if (!(file.name ?? '').trim()) {
    return 'A file is required.';
  }

  if (isBlockedDocumentExtension(file.name)) {
    return 'This file type is not allowed.';
  }

  if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    return 'File exceeds the 50 MB limit.';
  }

  if (file.size === 0) {
    return 'The file is empty.';
  }

  return null;
}

/** @deprecated Use validateDocumentFile */
export function validateDocumentPdfFile(file: File): string | null {
  return validateDocumentFile(file);
}

/** @deprecated Use validateDocumentFile */
export function validateExternalDocumentFile(file: File): string | null {
  return validateDocumentFile(file);
}

/** @deprecated Use validateDocumentFile */
export function validateInternalDocumentFile(file: File): string | null {
  return validateDocumentFile(file);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FILE_CHECK_MIN_MS = 600;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyPdfStructure(file: File): Promise<string | null> {
  const [headerBytes] = await Promise.all([file.slice(0, 5).text(), delay(FILE_CHECK_MIN_MS)]);

  if (!headerBytes.startsWith('%PDF-')) {
    return 'This file is not a valid PDF. Please check the file and try again.';
  }

  try {
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
    const pdfWorker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    GlobalWorkerOptions.workerSrc = pdfWorker;

    const data = await file.arrayBuffer();
    const task = getDocument({ data });
    const pdf = await task.promise;

    if (pdf.numPages < 1) {
      await task.destroy();
      return 'The PDF file appears to be empty.';
    }

    await task.destroy();
  } catch {
    return 'Unable to read this PDF. The file may be corrupted or password-protected.';
  }

  return null;
}

export async function verifyDocumentFile(file: File): Promise<string | null> {
  const basicError = validateDocumentFile(file);
  if (basicError) return basicError;

  const format = inferDocumentFileFormat(file.name, file.type);
  if (format !== 'pdf') {
    await delay(FILE_CHECK_MIN_MS);
    return null;
  }

  return verifyPdfStructure(file);
}

/** @deprecated Use verifyDocumentFile */
export async function verifyPdfFile(file: File): Promise<string | null> {
  return verifyDocumentFile(file);
}

/** @deprecated Use verifyDocumentFile */
export async function verifyInternalDocumentFile(file: File): Promise<string | null> {
  return verifyDocumentFile(file);
}

export function fileFormatFromUpload(file: File) {
  return inferDocumentFileFormat(file.name, file.type);
}