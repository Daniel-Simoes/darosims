import { promises as fs } from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '@/config/paths';

export const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_SOURCE_SIZE_BYTES = 50 * 1024 * 1024;

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export function getDocumentFilePath(documentId: string) {
  return path.join(UPLOAD_DIR, `${documentId}.pdf`);
}

export function getDocumentSourcePath(documentId: string, extension: string) {
  const safeExt = extension.replace(/^\./, '').toLowerCase();
  return path.join(UPLOAD_DIR, `${documentId}.source.${safeExt}`);
}

export async function savePdfFile(documentId: string, data: Buffer) {
  await ensureUploadDir();
  await fs.writeFile(getDocumentFilePath(documentId), data);
}

export async function saveSourceFile(documentId: string, data: Buffer, extension: string) {
  await ensureUploadDir();
  await deleteSourceFiles(documentId);
  await fs.writeFile(getDocumentSourcePath(documentId, extension), data);
}

export async function readPdfFile(documentId: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(getDocumentFilePath(documentId));
  } catch {
    return null;
  }
}

export async function readSourceFile(
  documentId: string,
): Promise<{ buffer: Buffer; extension: string } | null> {
  await ensureUploadDir();
  try {
    const entries = await fs.readdir(UPLOAD_DIR);
    const match = entries.find((name) => name.startsWith(`${documentId}.source.`));
    if (!match) return null;
    const extension = match.slice(`${documentId}.source.`.length);
    const buffer = await fs.readFile(path.join(UPLOAD_DIR, match));
    return { buffer, extension };
  } catch {
    return null;
  }
}

export async function deletePdfFile(documentId: string) {
  try {
    await fs.unlink(getDocumentFilePath(documentId));
  } catch {
    // File may not exist
  }
}

export async function deleteSourceFiles(documentId: string) {
  await ensureUploadDir();
  try {
    const entries = await fs.readdir(UPLOAD_DIR);
    await Promise.all(
      entries
        .filter((name) => name.startsWith(`${documentId}.source.`))
        .map((name) => fs.unlink(path.join(UPLOAD_DIR, name)).catch(() => undefined)),
    );
  } catch {
    // Directory may not exist
  }
}

export async function deleteAllDocumentFiles(documentId: string) {
  await deletePdfFile(documentId);
  await deleteSourceFiles(documentId);
}
