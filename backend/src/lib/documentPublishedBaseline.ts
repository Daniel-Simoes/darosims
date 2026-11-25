import { normalizeTeamEmail } from '@/lib/legacyEmails';
import { isAuthUserDesignatedApprover } from '@/lib/documentApproval';
import { isAuthUserDocumentOwner, isAuthUserInvolvedInDocument } from '@/lib/documentOwnership';
import type { DocumentPublishedBaseline, DocumentRecord } from '@/types';

export function capturePublishedBaseline(document: DocumentRecord): DocumentPublishedBaseline {
  return {
    version: document.version,
    title: document.title,
    type: document.type,
    process: document.process,
    owner: document.owner,
    approver: document.approver,
    approvedBy: document.approvedBy,
    department: document.department,
    effectiveDate: document.effectiveDate,
    nextReviewDate: document.nextReviewDate,
    fileName: document.fileName,
    fileFormat: document.fileFormat,
    sourceContent: document.sourceContent,
    reviewFrequency: document.reviewFrequency,
    repository: document.repository,
    location: document.location,
    distribution: document.distribution,
    distributionIndividuals: document.distributionIndividuals,
    retentionPeriod: document.retentionPeriod,
    retentionNotes: document.retentionNotes,
    disposition: document.disposition,
    comments: document.comments,
  };
}

function nameMatches(userName: string, value: string | undefined): boolean {
  if (!value?.trim()) return false;
  return userName.trim().toLowerCase() === value.trim().toLowerCase();
}

/** Viewer sees the in-progress draft, not the published baseline snapshot. */
export async function isAuthUserInvolvedInOpenRevision(
  auth: { email: string; name: string },
  document: DocumentRecord,
): Promise<boolean> {
  if (!document.publishedBaseline) {
    if (document.status === 'Active') return false;
    return isAuthUserInvolvedInDocument(auth, document);
  }

  const email = normalizeTeamEmail(auth.email) ?? auth.email.trim().toLowerCase();
  const revisionStarter = document.revisionStartedBy?.trim().toLowerCase() ?? '';
  if (revisionStarter && email === revisionStarter) return true;

  if (await isAuthUserInvolvedInDocument(auth, document)) return true;

  const baseline = document.publishedBaseline;
  if (await isAuthUserDocumentOwner(email, baseline.owner)) return true;
  if (await isAuthUserDesignatedApprover(email, { ...document, ...baseline })) return true;

  const approvedBy = baseline.approvedBy?.trim().toLowerCase();
  if (approvedBy && nameMatches(auth.name, baseline.approvedBy)) return true;

  return false;
}

export async function resolveDocumentForAuthUser(
  auth: { email: string; name: string },
  document: DocumentRecord,
): Promise<DocumentRecord> {
  if (!document.publishedBaseline) return document;
  if (await isAuthUserInvolvedInOpenRevision(auth, document)) return document;

  const baseline = document.publishedBaseline;
  return {
    ...document,
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
    distributionIndividuals: baseline.distributionIndividuals ?? document.distributionIndividuals,
    retentionPeriod: baseline.retentionPeriod ?? document.retentionPeriod,
    retentionNotes: baseline.retentionNotes ?? document.retentionNotes,
    disposition: baseline.disposition ?? document.disposition,
    comments: baseline.comments ?? document.comments,
    status: 'Active',
    submittedAt: undefined,
    reviewedAt: undefined,
    reviewedBy: undefined,
    rejectionReason: undefined,
    rejectedAt: undefined,
    rejectedBy: undefined,
    publishedBaseline: undefined,
    revisionStartedBy: undefined,
  };
}

export function resolveDocumentFileNameForAuthUser(
  auth: { email: string; name: string },
  document: DocumentRecord,
  involvedInOpenRevision: boolean,
): string | undefined {
  if (document.publishedBaseline && !involvedInOpenRevision) {
    return document.publishedBaseline.fileName ?? document.fileName;
  }
  return document.fileName;
}