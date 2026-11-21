import type { DocumentRecord } from '@/types/documents';

export const MAX_DOCUMENT_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export const MAX_PDF_SIZE_BYTES = MAX_DOCUMENT_FILE_SIZE_BYTES;

export type DocumentFileFormat = DocumentRecord['fileFormat'];

const BLOCKED_EXTENSIONS = new Set([
  'exe',
  'msi',
  'bat',
  'cmd',
  'com',
  'scr',
  'ps1',
  'sh',
  'dll',
  'app',
  'deb',
  'rpm',
  'jar',
  'vbs',
  'reg',
]);

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
  md: 'text/markdown',
  html: 'text/html',
  htm: 'text/html',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  zip: 'application/zip',
  rar: 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
};

export function getFileExtension(fileName: string): string {
  const match = fileName.match(/\.([a-zA-Z0-9]{1,12})$/);
  return match ? match[1].toLowerCase() : '';
}

export function isBlockedDocumentExtension(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return !ext || BLOCKED_EXTENSIONS.has(ext);
}

export function inferDocumentFileFormat(
  fileName: string,
  mimeType?: string,
): NonNullable<DocumentFileFormat> {
  const ext = getFileExtension(fileName);
  const mime = (mimeType ?? '').toLowerCase();

  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf';
  if (
    mime.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'heic'].includes(ext)
  ) {
    return 'image';
  }
  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
    return 'video';
  }
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
    return 'audio';
  }
  if (
    ['txt', 'csv', 'json', 'xml', 'md', 'log', 'yml', 'yaml'].includes(ext) ||
    mime.startsWith('text/')
  ) {
    return 'text';
  }
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'].includes(ext)) {
    return 'office';
  }
  return 'other';
}

export function getContentTypeForFile(fileName: string, mimeType?: string): string {
  const fallback = MIME_BY_EXTENSION[getFileExtension(fileName)];
  if (mimeType && mimeType !== 'application/octet-stream') {
    return mimeType;
  }
  return fallback ?? 'application/octet-stream';
}

export function validateUploadedDocumentFile(file: Pick<File, 'name' | 'size' | 'type'>): string | null {
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

export function storedDocumentObjectName(documentId: string, fileName: string): string {
  const ext = getFileExtension(fileName) || 'bin';
  return `${documentId}.${ext}`;
}

export function isMainDocumentStorageObject(name: string, documentId: string): boolean {
  return name.startsWith(`${documentId}.`) && !name.includes('.source.');
}