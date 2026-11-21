import type { DocumentRecord } from '../../../types/documents';
import { hasOpenDocumentRevision } from '../../../lib/documents/documentPublishedBaseline';
import { isPendingApprovalDocument } from '../../../lib/documentStatus';

type TeamUser = { name: string; email: string };

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
  if (byName) return byName.email;
  return raw.includes('@') ? raw : raw;
}

export function getDocumentRegisterOwnerDisplay(
  doc: DocumentRecord,
  teamUsers: TeamUser[],
): { primary: string; secondary?: string } {
  const openRevision = hasOpenDocumentRevision(doc);
  const reviewer = doc.owner?.trim() || '—';
  const designatedApprover = (doc.approver?.trim() || doc.owner?.trim()) || '';

  if (openRevision) {
    const secondaryParts: string[] = [];

    if (doc.submittedAt && doc.lastSubmittedBy) {
      const submitter = resolvePersonLabel(doc.lastSubmittedBy, teamUsers);
      secondaryParts.push(submitter.includes('@') ? `Submitted: ${submitter}` : `Submitted by: ${submitter}`);
    } else if (doc.revisionStartedBy) {
      const starter = resolvePersonLabel(doc.revisionStartedBy, teamUsers);
      secondaryParts.push(starter.includes('@') ? `Revision: ${starter}` : `Revision by: ${starter}`);
    }

    if (doc.submittedAt && doc.reviewedAt && designatedApprover) {
      secondaryParts.push(`Approver: ${designatedApprover}`);
    } else if (doc.submittedAt && !doc.reviewedAt && designatedApprover) {
      secondaryParts.push(`Then approve: ${designatedApprover}`);
    }

    return {
      primary: reviewer,
      secondary: secondaryParts.length > 0 ? secondaryParts.join(' · ') : undefined,
    };
  }

  if (doc.status === 'Draft' && doc.submittedAt) {
    const secondaryParts: string[] = [];
    if (doc.lastSubmittedBy) {
      const submitter = resolvePersonLabel(doc.lastSubmittedBy, teamUsers);
      secondaryParts.push(submitter.includes('@') ? `Submitted: ${submitter}` : `Submitted by: ${submitter}`);
    }
    if (isPendingApprovalDocument(doc) && designatedApprover) {
      secondaryParts.push(`Approver: ${designatedApprover}`);
    } else if (designatedApprover) {
      secondaryParts.push(`Review: ${designatedApprover}`);
    }
    return {
      primary: reviewer,
      secondary: secondaryParts.length > 0 ? secondaryParts.join(' · ') : undefined,
    };
  }

  if (doc.status === 'Active' && doc.approvedBy?.trim()) {
    return {
      primary: doc.owner?.trim() || '—',
      secondary: `Approved: ${doc.approvedBy.trim()}`,
    };
  }

  if (isPendingApprovalDocument(doc)) {
    const approver = designatedApprover;
    return {
      primary: reviewer,
      secondary: approver ? `Approver: ${approver}` : undefined,
    };
  }

  return {
    primary: doc.owner?.trim() || '—',
    secondary: undefined,
  };
}

export function isRegisterOwnerMetaPositive(_secondary: string | undefined): boolean {
  return false;
}