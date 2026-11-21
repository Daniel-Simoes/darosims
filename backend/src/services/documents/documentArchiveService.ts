import { ARCHIVE_UPLOAD_DIR } from '@/config/paths';
import { readDocumentFile } from '@/lib/documentFiles';
import { readAllArchives, writeAllArchives } from '@/repositories/documents/archiveRepository';
import type { DocumentArchiveRecord } from '@/types/documentArchive';
import type { DocumentRecord } from '@/types';
import { promises as fs } from 'fs';
import { joinPath } from '@/lib/joinPath';

async function ensureArchiveDir(archiveId: string) {
  const dir = joinPath(ARCHIVE_UPLOAD_DIR, archiveId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function copyDocumentFileToArchive(
  sourceDocumentId: string,
  archiveId: string,
  fileName: string | undefined,
): Promise<string | undefined> {
  if (!fileName?.trim()) return undefined;
  const source = await readDocumentFile(sourceDocumentId, fileName);
  if (!source) return undefined;
  const dir = await ensureArchiveDir(archiveId);
  const targetPath = joinPath(dir, fileName);
  await fs.writeFile(targetPath, source);
  return fileName;
}

export async function listDocumentArchives(): Promise<DocumentArchiveRecord[]> {
  const all = await readAllArchives();
  return all.sort(
    (a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime(),
  );
}

export async function getDocumentArchiveById(id: string): Promise<DocumentArchiveRecord | null> {
  const all = await readAllArchives();
  return all.find((item) => item.id === id) ?? null;
}

export async function archiveSupersededDocumentVersion(
  document: DocumentRecord,
  auth: { email: string; name: string },
  supersededByVersion: number,
): Promise<DocumentArchiveRecord | null> {
  if (document.status !== 'Active') return null;

  const all = await readAllArchives();
  const duplicate = all.find(
    (item) =>
      item.sourceDocumentId === document.id &&
      Math.abs(item.version - document.version) < 0.0001,
  );
  if (duplicate) return duplicate;

  const archiveId = crypto.randomUUID();
  const archive: DocumentArchiveRecord = {
    id: archiveId,
    sourceDocumentId: document.id,
    code: document.code,
    title: document.title,
    version: document.version,
    type: document.type,
    process: document.process,
    owner: document.owner,
    approver: document.approver,
    approvedBy: document.approvedBy,
    department: document.department,
    effectiveDate: document.effectiveDate,
    nextReviewDate: document.nextReviewDate,
    documentOrigin: document.documentOrigin,
    fileFormat: document.fileFormat,
    supersededByVersion,
    archivedAt: new Date().toISOString(),
    archivedBy: auth.email.trim().toLowerCase(),
    archivedByName: auth.name,
  };

  const copiedFile = await copyDocumentFileToArchive(document.id, archiveId, document.fileName);
  archive.fileName = copiedFile;

  all.push(archive);
  await writeAllArchives(all);
  return archive;
}

export async function readArchiveFile(archiveId: string, fileName: string): Promise<Buffer | null> {
  const path = joinPath(ARCHIVE_UPLOAD_DIR, archiveId, fileName);
  try {
    return await fs.readFile(path);
  } catch {
    return null;
  }
}