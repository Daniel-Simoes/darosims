import { readDocumentFile } from '@/lib/documentFiles';
import { deleteArchiveStoredFiles } from '@/repositories/storage/fileStorageRepository';
import { readAllArchives, writeAllArchives } from '@/repositories/documents/archiveRepository';
import {
  readArchiveStoredFile,
  readRevisionBaselineFile,
  stageRevisionBaselineFile,
  writeArchiveStoredFile,
} from '@/repositories/storage/fileStorageRepository';
import type { DocumentArchiveRecord } from '@/types/documentArchive';
import type { DocumentPublishedBaseline, DocumentRecord } from '@/types';

/** Preserves the approved file when a new revision draft may replace it. */
export async function stagePublishedRevisionFile(document: DocumentRecord): Promise<void> {
  if (document.status !== 'Active' || !document.fileName?.trim()) return;
  const source = await readDocumentFile(document.id, document.fileName);
  if (!source) return;
  await stageRevisionBaselineFile(document.id, document.version, source, document.fileName);
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

function documentRecordFromPublishedBaseline(
  document: DocumentRecord,
  baseline: DocumentPublishedBaseline,
): DocumentRecord {
  return {
    ...document,
    status: 'Active',
    version: baseline.version,
    title: baseline.title,
    type: baseline.type,
    process: baseline.process,
    owner: baseline.owner,
    approver: baseline.approver ?? baseline.owner,
    approvedBy: baseline.approvedBy,
    department: baseline.department ?? document.department,
    effectiveDate: baseline.effectiveDate,
    nextReviewDate: baseline.nextReviewDate,
    fileName: baseline.fileName,
    fileFormat: baseline.fileFormat,
    sourceContent: baseline.sourceContent,
    reviewFrequency: baseline.reviewFrequency ?? document.reviewFrequency,
    repository: baseline.repository ?? document.repository,
    location: baseline.location ?? document.location,
    distribution: baseline.distribution ?? document.distribution,
    retentionPeriod: baseline.retentionPeriod ?? document.retentionPeriod,
    retentionNotes: baseline.retentionNotes ?? document.retentionNotes,
    disposition: baseline.disposition ?? document.disposition,
    comments: baseline.comments ?? document.comments,
    publishedBaseline: undefined,
    revisionStartedBy: undefined,
    submittedAt: undefined,
    reviewedAt: undefined,
    reviewedBy: undefined,
    rejectedAt: undefined,
    rejectedBy: undefined,
    rejectionReason: undefined,
  };
}

/** Archives the superseded published version when a new revision is approved. */
export async function ensureSupersededVersionArchived(
  document: DocumentRecord,
  auth: { email: string; name: string },
  supersededByVersion: number,
): Promise<DocumentArchiveRecord | null> {
  const baseline = document.publishedBaseline;
  if (!baseline) return null;
  const snapshot = documentRecordFromPublishedBaseline(document, baseline);
  return archiveSupersededDocumentVersion(snapshot, auth, supersededByVersion);
}

async function resolveSupersededFileBuffer(
  documentId: string,
  version: number,
  fileName?: string,
): Promise<Buffer | null> {
  const staged = await readRevisionBaselineFile(documentId, version, fileName);
  if (staged) return staged;
  if (fileName?.trim()) return readDocumentFile(documentId, fileName);
  return readDocumentFile(documentId);
}

async function copySupersededFileToArchive(
  documentId: string,
  version: number,
  archiveId: string,
  fileName: string | undefined,
): Promise<string | undefined> {
  if (!fileName?.trim()) return undefined;
  const source = await resolveSupersededFileBuffer(documentId, version, fileName);
  if (!source) return undefined;
  await writeArchiveStoredFile(archiveId, fileName, source);
  return fileName;
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

  const copiedFile = await copySupersededFileToArchive(
    document.id,
    document.version,
    archiveId,
    document.fileName,
  );
  archive.fileName = copiedFile;

  all.push(archive);
  await writeAllArchives(all);
  return archive;
}

export async function readArchiveFile(archiveId: string, fileName: string): Promise<Buffer | null> {
  return readArchiveStoredFile(archiveId, fileName);
}

/** Moves the current approved record into Archives and removes it from Document Control. */
export async function archiveRetiredActiveDocument(
  document: DocumentRecord,
  auth: { email: string; name: string },
): Promise<DocumentArchiveRecord> {
  if (document.status !== 'Active') {
    throw new Error('Only active documents can be archived');
  }
  if (document.publishedBaseline) {
    throw new Error('Finish or cancel the open revision before archiving this document');
  }
  if (document.documentOrigin === 'External') {
    throw new Error('External documents cannot be archived this way');
  }

  const archive = await archiveSupersededDocumentVersion(document, auth, 0);
  if (!archive) {
    throw new Error('This version is already archived');
  }
  return archive;
}

export async function deleteDocumentArchive(id: string): Promise<boolean> {
  const all = await readAllArchives();
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) return false;
  const archive = all[index];
  await deleteArchiveStoredFiles(archive.id);
  all.splice(index, 1);
  await writeAllArchives(all);
  return true;
}