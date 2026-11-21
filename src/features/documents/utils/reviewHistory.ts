import type { DocumentEventRecord } from '../../../types/audit';
import type { DocumentRecord } from '../../../types/documents';
import { getDocumentEventDescription } from '../../../lib/documentEvents';

export interface DocumentReviewHistoryRow {
  versionNumber: number;
  date: string;
  section: string;
  descriptionOfChange: string;
  justificationForChange: string;
  approvedBy: string;
}

export interface DocumentReviewTimelineStep {
  id: string;
  title: string;
  description: string;
  date: string;
  version?: number;
  /** Email of the user who performed the action */
  byEmail?: string;
  /** Reviewer / recipient email (e.g. on submit) */
  toEmail?: string;
  /** Rejection reason or reviewer notes */
  reviewMessage?: string;
  rejectionStage?: 'review' | 'approval';
  reasonLabel?: string;
}

export type ReviewHistoryTeamUser = { name: string; email: string };

function formatReviewDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatReviewDateTime(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function daysBetween(fromIso: string, toIso: string): number | null {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  const diffMs = to.getTime() - from.getTime();
  if (diffMs < 0) return 0;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function dayLabel(days: number | null): string {
  if (days === null) return '';
  if (days === 0) return 'same day';
  if (days === 1) return '1 day later';
  return `${days} days later`;
}

function resolveEmail(
  value: string | undefined,
  teamUsers: ReviewHistoryTeamUser[],
): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  if (raw.includes('@')) return raw.toLowerCase();
  const match = teamUsers.find(
    (user) =>
      user.name.trim().toLowerCase() === raw.toLowerCase() ||
      user.email.trim().toLowerCase() === raw.toLowerCase(),
  );
  return match?.email.toLowerCase();
}

function pickEmail(...candidates: (string | undefined)[]): string | undefined {
  for (const candidate of candidates) {
    if (candidate?.includes('@')) return candidate.trim().toLowerCase();
  }
  return undefined;
}

function reviewerEmailForDoc(
  doc: DocumentRecord,
  teamUsers: ReviewHistoryTeamUser[],
  eventRecipient?: string,
): string | undefined {
  return (
    pickEmail(eventRecipient) ||
    resolveEmail(doc.owner, teamUsers) ||
    pickEmail(doc.owner)
  );
}

function approverEmailForDoc(doc: DocumentRecord, teamUsers: ReviewHistoryTeamUser[]): string | undefined {
  const designated = doc.approver?.trim() || doc.owner?.trim();
  return resolveEmail(designated, teamUsers) || pickEmail(designated);
}

type RejectionStage = 'review' | 'approval';

function resolveRejectionStage(
  event: DocumentEventRecord,
  sortedEvents: DocumentEventRecord[],
): RejectionStage {
  const meta = event.metadata?.rejectionStage;
  if (meta === 'approval' || meta === 'review') return meta;

  const eventTime = new Date(event.createdAt).getTime();
  const reviewedBefore = sortedEvents.some(
    (entry) =>
      entry.type === 'reviewed' &&
      new Date(entry.createdAt).getTime() <= eventTime &&
      entry.id !== event.id,
  );
  return reviewedBefore ? 'approval' : 'review';
}

function rejectionTimelineCopy(stage: RejectionStage) {
  if (stage === 'approval') {
    return {
      title: 'Approval rejected',
      description:
        'Final approval was rejected. The document was returned to the creator for revision.',
      reasonLabel: 'Reason approval was rejected',
    };
  }
  return {
    title: 'Review rejected',
    description: 'Review was rejected. The document was returned to the creator for revision.',
    reasonLabel: 'Reason review was rejected',
  };
}

function eventSection(event: DocumentEventRecord): string {
  switch (event.type) {
    case 'created':
      return 'Document register';
    case 'submitted':
    case 'resubmitted':
    case 'reviewed':
      return 'Approval workflow';
    case 'approved':
      return 'Header / Document Review History';
    case 'rejected':
      return 'Approval review';
    case 'edited':
      return event.metadata?.action === 'file_replaced' ? 'Document file' : 'Document content';
    default:
      return '';
  }
}

function eventDescription(event: DocumentEventRecord, doc: DocumentRecord): string {
  switch (event.type) {
    case 'created':
      return doc.version <= 1 ? 'Initial Draft' : `Version ${doc.version} registered`;
    case 'approved':
      return 'Document approved and published for controlled use.';
    case 'submitted':
      return 'Submitted for approval.';
    case 'resubmitted':
      return 'Updated document submitted for approval again.';
    case 'reviewed':
      return 'Review completed and sent for final approval.';
    case 'rejected':
      return event.metadata?.rejectionStage === 'approval'
        ? 'Final approval rejected — returned to creator for revision.'
        : event.metadata?.rejectionStage === 'review'
          ? 'Review rejected — returned to creator for revision.'
          : 'Document not approved — returned to creator for revision.';
    case 'edited':
      if (event.metadata?.action === 'file_replaced' && event.metadata.fileName) {
        return `Replaced document file (${event.metadata.fileName}).`;
      }
      return 'Document content or metadata updated.';
    default:
      return getDocumentEventDescription(event);
  }
}

function eventJustification(event: DocumentEventRecord, doc: DocumentRecord): string {
  if (event.type === 'rejected' && event.metadata?.reason?.trim()) {
    return event.metadata.reason.trim();
  }
  if (event.type === 'approved') {
    return doc.hasIso
      ? 'To be compliance with the ISO 9001 requirements'
      : 'To maintain version control traceability and document integrity';
  }
  if (event.type === 'created') {
    return doc.hasIso
      ? 'To align with the Integrated Management System (IMS) structure'
      : '';
  }
  if (event.type === 'edited' || event.type === 'resubmitted') {
    return 'To align with the Integrated Management System (IMS) structure and maintain version control traceability';
  }
  return '';
}

function eventApprovedBy(event: DocumentEventRecord, doc: DocumentRecord): string {
  if (event.type === 'approved') {
    return doc.approvedBy?.trim() || event.actorName || '—';
  }
  if (
    event.type === 'created' ||
    event.type === 'submitted' ||
    event.type === 'resubmitted' ||
    event.type === 'reviewed'
  ) {
    return event.actorName || doc.owner?.trim() || '—';
  }
  if (event.type === 'rejected') {
    return event.actorName || doc.approvedBy?.trim() || '—';
  }
  return event.actorName || doc.owner?.trim() || '—';
}

function fallbackRow(doc: DocumentRecord): DocumentReviewHistoryRow {
  return {
    versionNumber: Math.max(doc.version, 1),
    date: formatReviewDate(doc.createdAt ?? doc.effectiveDate),
    section: 'Document register',
    descriptionOfChange: doc.status === 'Draft' ? 'Initial Draft' : 'Document record',
    justificationForChange: doc.hasIso
      ? 'To align with the Integrated Management System (IMS) structure'
      : '',
    approvedBy: doc.approvedBy?.trim() || doc.owner?.trim() || '—',
  };
}

export function buildDocumentReviewHistoryRows(
  doc: DocumentRecord,
  events: DocumentEventRecord[],
): DocumentReviewHistoryRow[] {
  const sorted = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (sorted.length === 0) {
    return [fallbackRow(doc)];
  }

  return sorted.map((event, index) => ({
    versionNumber: index + 1,
    date: formatReviewDate(event.createdAt),
    section: eventSection(event),
    descriptionOfChange: eventDescription(event, doc),
    justificationForChange: eventJustification(event, doc),
    approvedBy: eventApprovedBy(event, doc),
  }));
}

const TIMELINE_EVENT_TYPES = new Set<DocumentEventRecord['type']>([
  'created',
  'submitted',
  'resubmitted',
  'reviewed',
  'approved',
  'rejected',
]);

export function buildDocumentReviewTimeline(
  doc: DocumentRecord,
  events: DocumentEventRecord[],
  teamUsers: ReviewHistoryTeamUser[] = [],
): DocumentReviewTimelineStep[] {
  const sorted = [...events]
    .filter((event) => TIMELINE_EVENT_TYPES.has(event.type))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const createdAtIso =
    sorted.find((event) => event.type === 'created')?.createdAt ?? doc.createdAt ?? doc.effectiveDate;
  const createdAtLabel = formatReviewDate(createdAtIso);
  const steps: DocumentReviewTimelineStep[] = [];

  const pushCreatedStep = (createdEvent?: DocumentEventRecord) => {
    const version = Math.max(doc.version, 1);
    const creatorEmail =
      pickEmail(doc.createdBy, createdEvent?.actorEmail) ||
      resolveEmail(createdEvent?.actorName, teamUsers);

    steps.push({
      id: 'created',
      title: 'Document created',
      description: `Version ${version} · Created on ${createdAtLabel}`,
      date: formatReviewDateTime(createdEvent?.createdAt ?? createdAtIso),
      version,
      byEmail: creatorEmail,
    });
  };

  if (sorted.length === 0) {
    pushCreatedStep();

    if (doc.submittedAt) {
      const reviewerEmail = reviewerEmailForDoc(doc, teamUsers);
      const creatorEmail = pickEmail(doc.createdBy);
      steps.push({
        id: 'submitted-fallback',
        title: 'Submitted for review',
        description: 'Submitted for approval.',
        date: formatReviewDateTime(doc.submittedAt),
        byEmail: creatorEmail,
        toEmail: reviewerEmail,
      });
    }

    if (doc.rejectionReason?.trim() && doc.rejectedAt) {
      const rejectorEmail =
        pickEmail(doc.rejectedBy) || resolveEmail(doc.rejectedBy, teamUsers);
      const stage: RejectionStage = 'review';
      const copy = rejectionTimelineCopy(stage);
      steps.push({
        id: 'rejected-fallback',
        title: copy.title,
        description: copy.description,
        date: formatReviewDateTime(doc.rejectedAt),
        byEmail: rejectorEmail,
        reviewMessage: doc.rejectionReason.trim(),
        rejectionStage: stage,
        reasonLabel: copy.reasonLabel,
      });
    }

    const pushReviewFallback = (reviewDate: string, extraDescription = '') => {
      const reviewerEmail =
        pickEmail(doc.reviewedBy) ||
        resolveEmail(doc.reviewedBy, teamUsers) ||
        reviewerEmailForDoc(doc, teamUsers);
      const approverEmail = approverEmailForDoc(doc, teamUsers);
      steps.push({
        id: `reviewed-fallback-${steps.length}`,
        title: 'Document reviewed',
        description: extraDescription || 'Review completed.',
        date: formatReviewDateTime(reviewDate),
        byEmail: reviewerEmail,
        toEmail: approverEmail,
      });
    };

    if (doc.approvedBy?.trim() && doc.status === 'Active') {
      const approverEmail =
        resolveEmail(doc.approvedBy, teamUsers) || pickEmail(doc.approvedBy);
      const approvalDate = doc.effectiveDate || doc.reviewedAt || createdAtIso;
      const days = createdAtIso ? daysBetween(createdAtIso, approvalDate || createdAtIso) : null;
      const reviewAlready = steps.some((step) => step.id.startsWith('reviewed-'));

      if (!reviewAlready) {
        pushReviewFallback(
          doc.reviewedAt || approvalDate,
          `Review completed${dayLabel(days) ? ` · ${dayLabel(days)} after creation` : ''}`,
        );
      }

      steps.push({
        id: 'approved-fallback',
        title: 'Document approved',
        description: 'Approved for controlled use.',
        date: formatReviewDateTime(approvalDate),
        byEmail: approverEmail,
      });
    } else if (doc.reviewedAt && !steps.some((step) => step.id.startsWith('reviewed-'))) {
      pushReviewFallback(doc.reviewedAt);
    }

    return steps;
  }

  pushCreatedStep(sorted.find((event) => event.type === 'created'));

  let lastSubmitAt: string | undefined;

  for (const event of sorted) {
    if (event.type === 'created') continue;

    if (event.type === 'submitted' || event.type === 'resubmitted') {
      lastSubmitAt = event.createdAt;
      const reviewerEmail = reviewerEmailForDoc(doc, teamUsers, event.metadata?.recipientEmail);
      const submitterEmail =
        pickEmail(event.actorEmail, doc.createdBy) ||
        resolveEmail(event.actorName, teamUsers);

      steps.push({
        id: `${event.type}-${event.id}`,
        title: event.type === 'resubmitted' ? 'Resubmitted for review' : 'Submitted for review',
        description: 'Submitted for approval.',
        date: formatReviewDateTime(event.createdAt),
        byEmail: submitterEmail,
        toEmail: reviewerEmail,
      });
      continue;
    }

    if (event.type === 'reviewed') {
      const reviewerEmail =
        pickEmail(event.actorEmail) || resolveEmail(event.actorName, teamUsers);
      const toEmail = pickEmail(event.metadata?.recipientEmail);

      steps.push({
        id: `reviewed-${event.id}`,
        title: 'Document reviewed',
        description: toEmail ? 'Sent for final approval.' : 'Review completed.',
        date: formatReviewDateTime(event.createdAt),
        byEmail: reviewerEmail,
        toEmail: toEmail,
      });
      continue;
    }

    if (event.type === 'rejected') {
      const reason = event.metadata?.reason?.trim() || doc.rejectionReason?.trim();
      const rejectorEmail =
        pickEmail(event.actorEmail, doc.rejectedBy) ||
        resolveEmail(event.actorName, teamUsers) ||
        resolveEmail(doc.rejectedBy, teamUsers);
      const stage = resolveRejectionStage(event, sorted);
      const copy = rejectionTimelineCopy(stage);

      steps.push({
        id: `rejected-${event.id}`,
        title: copy.title,
        description: copy.description,
        date: formatReviewDateTime(event.createdAt),
        byEmail: rejectorEmail,
        reviewMessage: reason,
        rejectionStage: stage,
        reasonLabel: copy.reasonLabel,
      });
      continue;
    }

    if (event.type === 'approved') {
      const approverEmail =
        pickEmail(event.actorEmail) ||
        resolveEmail(doc.approvedBy, teamUsers) ||
        resolveEmail(event.actorName, teamUsers);
      const reviewAlreadyInTimeline = steps.some((step) => step.id.startsWith('reviewed-'));
      const reviewerEmail =
        pickEmail(doc.reviewedBy) ||
        resolveEmail(doc.reviewedBy, teamUsers) ||
        reviewerEmailForDoc(doc, teamUsers);
      const daysFromCreate = createdAtIso ? daysBetween(createdAtIso, event.createdAt) : null;
      const daysFromSubmit = lastSubmitAt ? daysBetween(lastSubmitAt, event.createdAt) : null;

      const reviewTiming = [
        dayLabel(daysFromCreate) ? `${dayLabel(daysFromCreate)} after creation` : '',
        dayLabel(daysFromSubmit) && lastSubmitAt ? `${dayLabel(daysFromSubmit)} after submission` : '',
      ]
        .filter(Boolean)
        .join(' · ');

      if (!reviewAlreadyInTimeline && (lastSubmitAt || Boolean(doc.reviewedAt))) {
        const matchingReviewEvent = sorted.find(
          (entry) => entry.type === 'reviewed' && entry.createdAt <= event.createdAt,
        );
        const reviewDate = matchingReviewEvent?.createdAt ?? doc.reviewedAt ?? event.createdAt;
        const reviewActorEmail =
          pickEmail(matchingReviewEvent?.actorEmail) ||
          resolveEmail(matchingReviewEvent?.actorName, teamUsers) ||
          reviewerEmail ||
          approverEmail;

        steps.push({
          id: matchingReviewEvent
            ? `reviewed-${matchingReviewEvent.id}`
            : `reviewed-${event.id}-inferred`,
          title: 'Document reviewed',
          description: reviewTiming
            ? `Review completed · ${reviewTiming}`
            : 'Review completed.',
          date: formatReviewDateTime(reviewDate),
          byEmail: reviewActorEmail,
          toEmail: pickEmail(matchingReviewEvent?.metadata?.recipientEmail) ?? approverEmailForDoc(doc, teamUsers),
        });
      }

      steps.push({
        id: `approved-${event.id}`,
        title: 'Document approved',
        description: ['Approved for controlled use', reviewTiming ? `· ${reviewTiming}` : '']
          .filter(Boolean)
          .join(' '),
        date: formatReviewDateTime(event.createdAt),
        byEmail: approverEmail,
      });
    }
  }

  return steps;
}