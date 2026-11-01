export const MAX_DOCUMENT_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export function validateDocumentPdfFile(file: File): string | null {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    return 'Only PDF files are allowed.';
  }

  if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    return 'File exceeds the 50 MB limit.';
  }

  return null;
}

/** @deprecated Use validateDocumentPdfFile */
export function validateExternalDocumentFile(file: File): string | null {
  return validateDocumentPdfFile(file);
}

/** @deprecated Use validateDocumentPdfFile */
export function validateInternalDocumentFile(file: File): string | null {
  return validateDocumentPdfFile(file);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FILE_CHECK_MIN_MS = 1200;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function verifyPdfFile(file: File): Promise<string | null> {
  const basicError = validateDocumentPdfFile(file);
  if (basicError) return basicError;

  const [headerBytes] = await Promise.all([
    file.slice(0, 5).text(),
    delay(FILE_CHECK_MIN_MS),
  ]);

  if (!headerBytes.startsWith('%PDF-')) {
    return 'This file is not a valid PDF. Please upload a PDF document.';
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

/** @deprecated Use verifyPdfFile */
export async function verifyInternalDocumentFile(file: File): Promise<string | null> {
  return verifyPdfFile(file);
}
