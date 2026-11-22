import { promises as fs } from 'fs';
import path from 'path';
import { ARCHIVE_UPLOAD_DIR, REVISION_BASELINE_DIR, UPLOAD_DIR } from '@/config/paths';
import {
  getFileExtension,
  isMainDocumentStorageObject,
  MAX_DOCUMENT_FILE_SIZE_BYTES,
  storedDocumentObjectName,
} from '@/lib/documentFileMeta';

export const MAX_PDF_SIZE_BYTES = MAX_DOCUMENT_FILE_SIZE_BYTES;
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

async function deleteStoredMainDocumentObjects(documentId: string) {
  await ensureUploadDir();
  try {
    await fs.unlink(getDocumentFilePath(documentId));
  } catch {
    // Legacy PDF object may not exist
  }

  try {
    const entries = await fs.readdir(UPLOAD_DIR);
    await Promise.all(
      entries
        .filter((name) => isMainDocumentStorageObject(name, documentId))
        .map((name) => fs.unlink(path.join(UPLOAD_DIR, name)).catch(() => undefined)),
    );
  } catch {
    // Upload directory may not exist
  }
}

export async function savePdfFile(documentId: string, data: Buffer, fileName: string) {
  await ensureUploadDir();
  await deleteStoredMainDocumentObjects(documentId);
  const targetPath = path.join(UPLOAD_DIR, storedDocumentObjectName(documentId, fileName));
  await fs.writeFile(targetPath, data);
}

export async function saveSourceFile(documentId: string, data: Buffer, extension: string) {
  await ensureUploadDir();
  await deleteSourceFiles(documentId);
  await fs.writeFile(getDocumentSourcePath(documentId, extension), data);
}

export async function readPdfFile(
  documentId: string,
  fileName?: string,
): Promise<Buffer | null> {
  await ensureUploadDir();

  const candidates: string[] = [getDocumentFilePath(documentId)];
  if (fileName) {
    candidates.push(path.join(UPLOAD_DIR, storedDocumentObjectName(documentId, fileName)));
  }

  for (const candidate of candidates) {
    try {
      return await fs.readFile(candidate);
    } catch {
      // Try next candidate
    }
  }

  try {
    const entries = await fs.readdir(UPLOAD_DIR);
    const match = entries.find((name) => isMainDocumentStorageObject(name, documentId));
    if (!match) return null;
    return await fs.readFile(path.join(UPLOAD_DIR, match));
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
  await deleteStoredMainDocumentObjects(documentId);
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

function revisionBaselineKey(version: number): string {
  return String(version).replace('.', '_');
}

function revisionBaselinePath(documentId: string, version: number, fileName: string) {
  const safeName = fileName.replace(/[/\\]/g, '_');
  return path.join(
    REVISION_BASELINE_DIR,
    documentId,
    `v${revisionBaselineKey(version)}-${safeName}`,
  );
}

export async function stageRevisionBaselineFile(
  documentId: string,
  version: number,
  data: Buffer,
  fileName: string,
) {
  const targetPath = revisionBaselinePath(documentId, version, fileName);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, data);
}

export async function readRevisionBaselineFile(
  documentId: string,
  version: number,
  fileName?: string,
): Promise<Buffer | null> {
  if (fileName?.trim()) {
    try {
      return await fs.readFile(revisionBaselinePath(documentId, version, fileName));
    } catch {
      // fall through
    }
  }
  try {
    const dir = path.join(REVISION_BASELINE_DIR, documentId);
    const prefix = `v${revisionBaselineKey(version)}-`;
    const entries = await fs.readdir(dir);
    const match = entries.find((name) => name.startsWith(prefix));
    if (!match) return null;
    return await fs.readFile(path.join(dir, match));
  } catch {
    return null;
  }
}

async function ensureArchiveUploadDir(archiveId: string) {
  const dir = path.join(ARCHIVE_UPLOAD_DIR, archiveId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function writeArchiveStoredFile(
  archiveId: string,
  fileName: string,
  data: Buffer,
) {
  const dir = await ensureArchiveUploadDir(archiveId);
  const safeName = fileName.replace(/[/\\]/g, '_');
  await fs.writeFile(path.join(dir, safeName), data);
}

export async function readArchiveStoredFile(
  archiveId: string,
  fileName: string,
): Promise<Buffer | null> {
  const safeName = fileName.replace(/[/\\]/g, '_');
  const targetPath = path.join(ARCHIVE_UPLOAD_DIR, archiveId, safeName);
  try {
    return await fs.readFile(targetPath);
  } catch {
    return null;
  }
}

export async function deleteArchiveStoredFiles(archiveId: string): Promise<void> {
  const dir = path.join(ARCHIVE_UPLOAD_DIR, archiveId);
  await fs.rm(dir, { recursive: true, force: true });
}