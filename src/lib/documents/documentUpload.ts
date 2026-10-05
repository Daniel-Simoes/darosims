export const MAX_DOCUMENT_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export type InternalDocumentFileKind = 'pdf' | 'docx' | 'txt';

export function getInternalFileKind(file: File): InternalDocumentFileKind | null {
  const name = file.name.toLowerCase();
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return 'docx';
  }
  if (file.type === 'text/plain' || name.endsWith('.txt')) return 'txt';
  return null;
}

export function validateExternalDocumentFile(file: File): string | null {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    return 'Only PDF files are allowed for external documents.';
  }

  if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    return 'File exceeds the 50 MB limit.';
  }

  return null;
}

export function validateInternalDocumentFile(file: File): string | null {
  const kind = getInternalFileKind(file);
  if (!kind) {
    return 'Accepted formats: Word (.docx), text (.txt), or PDF (.pdf).';
  }

  if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    return 'File exceeds the 50 MB limit.';
  }

  return null;
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

export async function verifyInternalDocumentFile(file: File): Promise<string | null> {
  const basicError = validateInternalDocumentFile(file);
  if (basicError) return basicError;

  const kind = getInternalFileKind(file);
  if (kind === 'pdf') {
    return 'Internal documents are saved as Word until approved. PDF is generated when the document is approved.';
  }

  await delay(FILE_CHECK_MIN_MS);

  try {
    if (kind === 'txt') {
      const text = await file.text();
      if (!text.trim()) {
        return 'The text file appears to be empty.';
      }
    } else if (kind === 'docx') {
      const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
      if (header[0] !== 0x50 || header[1] !== 0x4b) {
        return 'This file is not a valid Word document.';
      }

      const mammoth = (await import('mammoth')).default;
      await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    }
  } catch {
    return kind === 'txt'
      ? 'Unable to read this text file.'
      : 'Unable to read this Word document. The file may be corrupted.';
  }

  return null;
}

export async function verifyPdfFile(file: File): Promise<string | null> {
  const basicError = validateExternalDocumentFile(file);
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
