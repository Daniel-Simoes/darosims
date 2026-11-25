import type { DocumentRecord, UpdateDocumentInput } from '@/types';

/** Allowed client fields on PUT — workflow timestamps are server-only. */
const CLIENT_EDIT_KEYS = [
  'type',
  'hasIso',
  'process',
  'title',
  'version',
  'status',
  'documentOrigin',
  'externalRef',
  'externalVersion',
  'owner',
  'approver',
  'department',
  'effectiveDate',
  'reviewFrequency',
  'nextReviewDate',
  'repository',
  'location',
  'distribution',
  'retentionPeriod',
  'retentionNotes',
  'disposition',
  'comments',
  'sourceContent',
  'fileFormat',
  'fileName',
  'sourceModified',
  'rejectionReason',
] as const;

export function buildClientDocumentUpdate(
  body: Record<string, unknown>,
  existing: DocumentRecord,
  options: { isApproving: boolean; approverName: string },
): UpdateDocumentInput {
  const input: UpdateDocumentInput = {};

  for (const key of CLIENT_EDIT_KEYS) {
    if (body[key] === undefined) continue;
    (input as Record<string, unknown>)[key] = body[key];
  }

  if (options.isApproving) {
    input.approvedBy = options.approverName;
    input.submittedAt = undefined;
    input.reviewedAt = undefined;
    input.reviewedBy = undefined;
  }

  if (body.id !== undefined || body.createdBy !== undefined) {
    // Ignored — block mass assignment of identity fields
  }

  if (body.submittedAt !== undefined || body.reviewedAt !== undefined || body.reviewedBy !== undefined) {
    // Ignored on generic PUT
  }

  if (body.rejectedAt !== undefined || body.rejectedBy !== undefined) {
    // Ignored on generic PUT
  }

  if (input.status === undefined) {
    input.status = existing.status;
  }

  return input;
}