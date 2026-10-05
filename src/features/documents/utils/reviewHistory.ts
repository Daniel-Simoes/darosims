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
