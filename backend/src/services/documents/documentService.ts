import { generateDocumentCode } from '@/lib/documentCode';
import {
  findDocumentById,
  readAllDocuments,
  removeDocumentRecord,
  writeAllDocuments,
} from '@/repositories/documents/documentRepository';
import { deleteAllDocumentFiles } from '@/repositories/storage/fileStorageRepository';
import type { CreateDocumentInput, DocumentRecord, UpdateDocumentInput } from '@/types';

function normalizeExternalDocument(doc: DocumentRecord): DocumentRecord {
  return doc.documentOrigin === 'External' ? { ...doc, code: '' } : doc;
}

export async function listDocuments(): Promise<DocumentRecord[]> {
  const documents = await readAllDocuments();
  return documents
    .map(normalizeExternalDocument)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function listUserDrafts(createdBy: string): Promise<DocumentRecord[]> {
  const documents = await readAllDocuments();
  return documents
    .filter(
      (doc) =>
        doc.status === 'Draft' &&
        !doc.submittedAt &&
        (doc.createdBy?.toLowerCase() ?? '') === createdBy.trim().toLowerCase(),
    )
    .map(normalizeExternalDocument)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getDocumentById(id: string): Promise<DocumentRecord | null> {
  const doc = await findDocumentById(id);
  if (!doc) return null;
  return normalizeExternalDocument(doc);
}

export async function updateDocument(
  id: string,
  input: UpdateDocumentInput,
): Promise<DocumentRecord | null> {
  const documents = await readAllDocuments();
  const index = documents.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const existing = documents[index];
  const isExternal = (input.documentOrigin ?? existing.documentOrigin) === 'External';

  const updated: DocumentRecord = {
    ...existing,
    title: input.title ?? existing.title,
    type: input.type ?? existing.type,
    hasIso: input.hasIso ?? existing.hasIso,
    process: input.process ?? existing.process,
    owner: input.owner ?? existing.owner,
    effectiveDate: input.effectiveDate ?? existing.effectiveDate,
    nextReviewDate: input.nextReviewDate ?? existing.nextReviewDate,
    status: input.status ?? existing.status,
    documentOrigin: input.documentOrigin ?? existing.documentOrigin,
    externalRef: input.externalRef ?? existing.externalRef,
    externalVersion: input.externalVersion ?? existing.externalVersion,
    sourceContent: input.sourceContent ?? existing.sourceContent,
    sourceModified: input.sourceModified ?? existing.sourceModified,
    fileFormat: input.fileFormat ?? existing.fileFormat,
    fileName: input.fileName ?? existing.fileName,
    approvedBy: input.approvedBy ?? existing.approvedBy,
    department: input.department ?? existing.department,
    reviewFrequency: input.reviewFrequency ?? existing.reviewFrequency,
    repository: input.repository ?? existing.repository,
    distribution: input.distribution ?? existing.distribution,
    retentionPeriod: input.retentionPeriod ?? existing.retentionPeriod,
    retentionNotes: input.retentionNotes ?? existing.retentionNotes,
    disposition: input.disposition ?? existing.disposition,
    comments: input.comments ?? existing.comments,
    submittedAt: 'submittedAt' in input ? input.submittedAt || undefined : existing.submittedAt,
    rejectionReason:
      'rejectionReason' in input ? input.rejectionReason || undefined : existing.rejectionReason,
    rejectedAt: 'rejectedAt' in input ? input.rejectedAt || undefined : existing.rejectedAt,
    rejectedBy: 'rejectedBy' in input ? input.rejectedBy || undefined : existing.rejectedBy,
    code: isExternal ? '' : existing.code,
    version: isExternal ? 0 : (input.version ?? existing.version),
  };

  documents[index] = updated;
  await writeAllDocuments(documents);
  return normalizeExternalDocument(updated);
}

export async function setDocumentFileName(
  documentId: string,
  fileName: string,
): Promise<DocumentRecord | null> {
  const documents = await readAllDocuments();
  const index = documents.findIndex((item) => item.id === documentId);
  if (index === -1) return null;

  documents[index] = { ...documents[index], fileName };
  await writeAllDocuments(documents);
  return documents[index];
}

export async function createDocument(
  input: CreateDocumentInput,
  createdBy: string,
): Promise<DocumentRecord> {
  const documents = await readAllDocuments();
  const isExternal = input.documentOrigin === 'External';
  const internalCodes = documents
    .filter((doc) => doc.documentOrigin !== 'External')
    .map((doc) => doc.code)
    .filter(Boolean);
  let code = '';
  if (!isExternal) {
    if (input.hasIso) {
      const manualCode = input.code?.trim() ?? '';
      if (!manualCode) {
        throw new Error('Document code is required for ISO-related documents');
      }
      const duplicate = internalCodes.some(
        (existing) => existing.toLowerCase() === manualCode.toLowerCase(),
      );
      if (duplicate) {
        throw new Error('Document code already exists');
      }
      code = manualCode;
    } else {
      code = generateDocumentCode(input.type, input.process, internalCodes);
    }
  }

  const document: DocumentRecord = {
    id: crypto.randomUUID(),
    code,
    title: input.title,
    version: isExternal ? 0 : (input.version ?? 1),
    type: input.type,
    hasIso: input.hasIso,
    process: input.process,
    owner: input.owner ?? createdBy,
    effectiveDate: input.effectiveDate ?? new Date().toISOString().slice(0, 10),
    nextReviewDate: input.nextReviewDate ?? '',
    status: input.status ?? (isExternal ? 'Active' : 'Draft'),
    documentOrigin: input.documentOrigin,
    externalRef: input.externalRef,
    externalVersion: input.externalVersion,
    approvedBy: input.approvedBy,
    department: input.department,
    reviewFrequency: input.reviewFrequency,
    repository: input.repository,
    distribution: input.distribution,
    retentionPeriod: input.retentionPeriod,
    retentionNotes: input.retentionNotes,
    disposition: input.disposition,
    comments: input.comments,
    createdAt: new Date().toISOString(),
    createdBy,
  };

  documents.push(document);
  await writeAllDocuments(documents);
  return document;
}

export async function submitDocumentForApproval(
  id: string,
  submittedByEmail: string,
): Promise<DocumentRecord> {
  const documents = await readAllDocuments();
  const index = documents.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error('Document not found');
  }

  const existing = documents[index];
  if (existing.documentOrigin === 'External') {
    throw new Error('External documents cannot be submitted for approval');
  }
  if (existing.status !== 'Draft') {
    throw new Error('Only draft documents can be submitted for approval');
  }
  if (existing.submittedAt) {
    throw new Error('Document is already submitted for approval');
  }
  if ((existing.createdBy?.toLowerCase() ?? '') !== submittedByEmail.trim().toLowerCase()) {
    throw new Error('You can only submit documents you created');
  }

  const updated: DocumentRecord = {
    ...existing,
    submittedAt: new Date().toISOString(),
    rejectionReason: undefined,
    rejectedAt: undefined,
    rejectedBy: undefined,
  };
  documents[index] = updated;
  await writeAllDocuments(documents);
  return updated;
}

export async function rejectDocumentForApproval(
  id: string,
  rejectedBy: string,
  reason: string,
): Promise<DocumentRecord> {
  const documents = await readAllDocuments();
  const index = documents.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error('Document not found');
  }

  const existing = documents[index];
  if (existing.documentOrigin === 'External') {
    throw new Error('External documents cannot be rejected for approval');
  }
  if (existing.status !== 'Draft') {
    throw new Error('Only draft documents can be rejected');
  }
  if (!existing.submittedAt) {
    throw new Error('Document is not pending approval');
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    throw new Error('Rejection reason is required');
  }

  const updated: DocumentRecord = {
    ...existing,
    submittedAt: undefined,
    rejectionReason: trimmedReason,
    rejectedAt: new Date().toISOString(),
    rejectedBy,
  };
  documents[index] = updated;
  await writeAllDocuments(documents);
  return updated;
}

export async function deleteDocument(id: string): Promise<boolean> {
  const removed = await removeDocumentRecord(id);
  if (!removed) return false;
  await deleteAllDocumentFiles(id);
  return true;
}
