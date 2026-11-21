import type { DocumentRecord } from '../../types/documents';

export type DocumentFileFormat = NonNullable<DocumentRecord['fileFormat']>;

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

export const DOCUMENT_UPLOAD_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.xml,.md,.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp,.mp4,.webm,.mov,.mp3,.wav,.zip,.rar,.7z';

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
): DocumentFileFormat {
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
    ['txt', 'csv', 'json', 'xml', 'md', 'log', 'yml', 'yaml', 'html', 'htm'].includes(ext) ||
    mime.startsWith('text/')
  ) {
    return 'text';
  }
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'].includes(ext)) {
    return 'office';
  }
  return 'other';
}

export function getDocumentFileFormatLabel(format?: DocumentFileFormat): string {
  switch (format) {
    case 'pdf':
      return 'PDF';
    case 'image':
      return 'Image';
    case 'text':
      return 'Text';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Audio';
    case 'office':
      return 'Office';
    case 'other':
      return 'File';
    default:
      return 'File';
  }
}