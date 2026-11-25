import type { DocumentRecord } from '../../../types/documents';
import { hasOpenDocumentRevision } from '../../../lib/documents/documentPublishedBaseline';
import { formatDistributionAccessOwnerPrimary } from '../../../lib/documents/distributionAccess';
import {
  isPendingApprovalDocument,
  isPendingFinalApprovalDocument,
} from '../../../lib/documentStatus';

type TeamUser = { name: string; email: string };

export type DocumentRegisterOwnerDisplay = {
  primary: string;
  /** Hover title when primary is truncated (register table). */
  primaryTitle?: string;
  /** Workflow context lines under the primary name (register table). */
  metaLines: string[];
  /** Flattened for CSV export. */
  secondary?: string;
};

function resolvePersonLabel(value: string | undefined, teamUsers: TeamUser[]): string {
  const raw = value?.trim();
  if (!raw) return '';
  const byEmail = teamUsers.find(
    (entry) => entry.email.trim().toLowerCase() === raw.toLowerCase(),
  );
  if (byEmail) return byEmail.name;
  const byName = teamUsers.find(
    (entry) => entry.name.trim().toLowerCase() === raw.toLowerCase(),
  );
  if (byName) return byName.name;
  return raw.includes('@') ? raw : raw;
}

function joinMetaLines(lines: string[]): string | undefined {
  return lines.length > 0 ? lines.join(' · ') : undefined;
}

/** Who originated this version (new revision → revision starter; otherwise document creator). */
function originatorLine(doc: DocumentRecord, teamUsers: TeamUser[]): string | undefined {
  const who = hasOpenDocumentRevision(doc)
    ? doc.revisionStartedBy?.trim() || doc.lastSubmittedBy?.trim() || doc.createdBy?.trim()
    : doc.createdBy?.trim();
  const label = resolvePersonLabel(who, teamUsers);
  if (!label) return undefined;
  return `Created by ${label}`;
}

function reviewedByLine(doc: DocumentRecord, teamUsers: TeamUser[]): string | undefined {
  const reviewer = resolvePersonLabel(doc.reviewedBy, teamUsers);
  if (!reviewer) return undefined;
  return `Reviewed by ${reviewer}`;
}

function toBeApprovedByLine(doc: DocumentRecord, teamUsers: TeamUser[]): string | undefined {
  const approver = resolvePersonLabel(doc.approver?.trim(), teamUsers);
  if (!approver) return undefined;
  return `To be approved by ${approver}`;
}

/** Full approval trail as separate lines (created → reviewed → approved). */
function approvedDocumentMetaLines(doc: DocumentRecord, teamUsers: TeamUser[]): string[] {
  const lines: string[] = [];

  const created = originatorLine(doc, teamUsers);
  if (created) lines.push(created);

  const reviewerRef =
    doc.reviewedBy?.trim() ||
    (doc.reviewedAt || doc.status === 'Active' ? doc.owner?.trim() : '');
  if (reviewerRef) {
    const reviewer = resolvePersonLabel(reviewerRef, teamUsers);
    if (reviewer) lines.push(`Reviewed by ${reviewer}`);
  }

  const approverRef =
    doc.approvedBy?.trim() ||
    doc.approver?.trim() ||
    (doc.status === 'Active' ? doc.owner?.trim() : '');
  if (approverRef) {
    const approver = resolvePersonLabel(approverRef, teamUsers);
    if (approver) lines.push(`Approved by ${approver}`);
  }

  return lines;
}

const DISTRIBUTION_OWNER_MAX_VISIBLE = 2;

/** Approved documents: owner column shows distribution / access recipients. */
function distributionAccessPrimary(doc: DocumentRecord): Pick<
  DocumentRegisterOwnerDisplay,
  'primary' | 'primaryTitle'
> {
  const full = formatDistributionAccessOwnerPrimary(doc.distribution, doc.distributionIndividuals);
  if (full) {
    const primary = formatDistributionAccessOwnerPrimary(doc.distribution, doc.distributionIndividuals, {
      maxVisible: DISTRIBUTION_OWNER_MAX_VISIBLE,
    });
    return {
      primary,
      primaryTitle: primary !== full ? full : undefined,
    };
  }
  return { primary: doc.distribution?.trim() || '—' };
}

function reviewerPrimary(doc: DocumentRecord, teamUsers: TeamUser[]): string {
  const label = resolvePersonLabel(doc.owner?.trim(), teamUsers);
  return label || '—';
}

function approverPrimary(doc: DocumentRecord, teamUsers: TeamUser[]): string {
  const label = resolvePersonLabel(doc.approver?.trim(), teamUsers);
  return label || '—';
}

function revisionStarterPrimary(doc: DocumentRecord, teamUsers: TeamUser[]): string {
  const label = resolvePersonLabel(
    doc.revisionStartedBy?.trim() || doc.lastSubmittedBy?.trim(),
    teamUsers,
  );
  return label || '—';
}

function buildDisplay(
  primary: string,
  metaLines: string[],
  extras?: Pick<DocumentRegisterOwnerDisplay, 'primaryTitle'>,
): DocumentRegisterOwnerDisplay {
  const lines = metaLines.filter(Boolean);
  return { primary, metaLines: lines, secondary: joinMetaLines(lines), ...extras };
}

function primaryWithRole(name: string, role: string): string {
  const label = name?.trim();
  if (!label || label === '—') return label || '—';
  return `${label} (${role})`;
}


/** Pending review / approval: reflect the in-flight version workflow, not the prior approved snapshot. */
export function getDocumentRegisterOwnerDisplay(
  doc: DocumentRecord,
  teamUsers: TeamUser[],
): DocumentRegisterOwnerDisplay {
  const openRevision = hasOpenDocumentRevision(doc);
  const originator = originatorLine(doc, teamUsers);

  if (openRevision && !doc.submittedAt) {
    return buildDisplay(revisionStarterPrimary(doc, teamUsers), originator ? [originator] : []);
  }

  if (isPendingFinalApprovalDocument(doc)) {
    return buildDisplay(
      primaryWithRole(approverPrimary(doc, teamUsers), 'Approver'),
      [originator, reviewedByLine(doc, teamUsers)].filter((line): line is string => Boolean(line)),
    );
  }

  if (isPendingApprovalDocument(doc)) {
    return buildDisplay(
      primaryWithRole(reviewerPrimary(doc, teamUsers), 'Reviewer'),
      [originator, toBeApprovedByLine(doc, teamUsers)].filter((line): line is string => Boolean(line)),
    );
  }

  if (doc.status === 'Active' && !openRevision) {
    const distribution = distributionAccessPrimary(doc);
    return buildDisplay(distribution.primary, approvedDocumentMetaLines(doc, teamUsers), {
      primaryTitle: distribution.primaryTitle,
    });
  }

  if (doc.status === 'Draft' && doc.submittedAt && !doc.reviewedAt) {
    return buildDisplay(
      primaryWithRole(reviewerPrimary(doc, teamUsers), 'Reviewer'),
      [originator, toBeApprovedByLine(doc, teamUsers)].filter((line): line is string => Boolean(line)),
    );
  }

  const meta: string[] = originator ? [originator] : [];
  if (toBeApprovedByLine(doc, teamUsers) && doc.approver?.trim() && doc.approver.trim() !== doc.owner?.trim()) {
    meta.push(toBeApprovedByLine(doc, teamUsers)!);
  }

  return buildDisplay(reviewerPrimary(doc, teamUsers) || revisionStarterPrimary(doc, teamUsers), meta);
}

export function isRegisterOwnerMetaPositive(_secondary: string | undefined): boolean {
  return false;
}