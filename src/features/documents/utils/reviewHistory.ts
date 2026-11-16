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
  actor?: string;
  version?: number;
}

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

function eventSection(event: DocumentEventRecord): string {
  switch (event.type) {
    case 'created':
      return 'Document register';
    case 'submitted':
    case 'resubmitted':
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
    case 'rejected':
      return 'Document not approved — returned to creator for revision.';
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
  if (event.type === 'created' || event.type === 'submitted' || event.type === 'resubmitted') {
    return doc.owner?.trim() || event.actorName || '—';
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
  'approved',
  'rejected',
]);

export function buildDocumentReviewTimeline(
  doc: DocumentRecord,
  events: DocumentEventRecord[],
): DocumentReviewTimelineStep[] {
  const sorted = [...events]
    .filter((event) => TIMELINE_EVENT_TYPES.has(event.type))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const createdAtIso =
    sorted.find((event) => event.type === 'created')?.createdAt ?? doc.createdAt ?? doc.effectiveDate;
  const createdAtLabel = formatReviewDate(createdAtIso);
  const steps: DocumentReviewTimelineStep[] = [];

  const pushUniqueCreated = () => {
    const createdEvent = sorted.find((event) => event.type === 'created');
    const creator = doc.createdBy?.trim() || createdEvent?.actorName || '—';
    const version = Math.max(doc.version, 1);
    steps.push({
      id: 'created',
      title: 'Document created',
      description: `Version ${version} · Created on ${createdAtLabel}`,
      date: formatReviewDateTime(createdEvent?.createdAt ?? createdAtIso),
      actor: creator,
      version,
    });
  };

  if (sorted.length === 0) {
    pushUniqueCreated();
    if (doc.submittedAt) {
      steps.push({
        id: 'submitted-fallback',
        title: 'Submitted for review',
        description: `Sent to ${doc.owner?.trim() || 'document owner'} for review`,
        date: formatReviewDateTime(doc.submittedAt),
        actor: doc.createdBy?.trim() || '—',
      });
    }
    if (doc.approvedBy?.trim() && doc.status === 'Active') {
      const days = createdAtIso ? daysBetween(createdAtIso, doc.effectiveDate || createdAtIso) : null;
      const reviewer = doc.owner?.trim() || doc.approvedBy;
      const approver = doc.approvedBy.trim();
      if (reviewer && reviewer !== approver) {
        steps.push({
          id: 'reviewed-fallback',
          title: 'Document reviewed',
          description: `Created on ${createdAtLabel} · Reviewed ${dayLabel(days)}`,
          date: formatReviewDateTime(doc.effectiveDate),
          actor: reviewer,
        });
        steps.push({
          id: 'approved-fallback',
          title: 'Document approved',
          description: `Approved for controlled use`,
          date: formatReviewDateTime(doc.effectiveDate),
          actor: approver,
        });
      } else {
        steps.push({
          id: 'approved-fallback',
          title: 'Document reviewed and approved',
          description: `Created on ${createdAtLabel} · ${dayLabel(days) ? dayLabel(days).charAt(0).toUpperCase() + dayLabel(days).slice(1) : 'Approved'}`,
          date: formatReviewDateTime(doc.effectiveDate),
          actor: approver,
        });
      }
    }
    return steps;
  }

  pushUniqueCreated();

  let lastSubmitAt: string | undefined;

  for (const event of sorted) {
    if (event.type === 'created') continue;

    if (event.type === 'submitted' || event.type === 'resubmitted') {
      lastSubmitAt = event.createdAt;
      const reviewer = doc.owner?.trim() || 'document owner';
      steps.push({
        id: `${event.type}-${event.id}`,
        title: event.type === 'resubmitted' ? 'Resubmitted for review' : 'Submitted for review',
        description: `Sent to ${reviewer} for review`,
        date: formatReviewDateTime(event.createdAt),
        actor: event.actorName,
      });
      continue;
    }

    if (event.type === 'rejected') {
      const reason = event.metadata?.reason?.trim();
      steps.push({
        id: `rejected-${event.id}`,
        title: 'Document not approved',
        description: reason || 'Returned to creator for revision',
        date: formatReviewDateTime(event.createdAt),
        actor: event.actorName,
      });
      continue;
    }

    if (event.type === 'approved') {
      const approver = doc.approvedBy?.trim() || event.actorName || '—';
      const reviewer = doc.owner?.trim();
      const daysFromCreate = createdAtIso ? daysBetween(createdAtIso, event.createdAt) : null;
      const daysFromSubmit = lastSubmitAt ? daysBetween(lastSubmitAt, event.createdAt) : null;

      if (reviewer && reviewer !== approver) {
        steps.push({
          id: `reviewed-${event.id}`,
          title: 'Document reviewed',
          description: [
            `Created on ${createdAtLabel}`,
            dayLabel(daysFromCreate) ? `· Reviewed ${dayLabel(daysFromCreate)}` : '',
            dayLabel(daysFromSubmit) && lastSubmitAt ? `· ${dayLabel(daysFromSubmit)} after submission` : '',
          ]
            .filter(Boolean)
            .join(' '),
          date: formatReviewDateTime(event.createdAt),
          actor: reviewer,
        });
        steps.push({
          id: `approved-${event.id}`,
          title: 'Document approved',
          description: 'Approved for controlled use',
          date: formatReviewDateTime(event.createdAt),
          actor: approver,
        });
      } else {
        steps.push({
          id: `approved-${event.id}`,
          title: 'Document reviewed and approved',
          description: [
            `Created on ${createdAtLabel}`,
            dayLabel(daysFromCreate) ? `· ${dayLabel(daysFromCreate).charAt(0).toUpperCase() + dayLabel(daysFromCreate).slice(1)}` : '',
          ]
            .filter(Boolean)
            .join(' '),
          date: formatReviewDateTime(event.createdAt),
          actor: approver,
        });
      }
    }
  }

  return steps;
}