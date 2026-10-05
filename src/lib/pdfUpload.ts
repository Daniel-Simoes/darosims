export const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024;

export function validatePdfFile(file: File): string | null {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    return 'Only PDF files are allowed.';
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return 'File exceeds the 50 MB limit.';
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
