import type { ColoredChartPoint } from '../../data/moduleVisualizations';
import type { DocumentRecord } from '../../types/documents';
import { isPendingApprovalDocument, isRejectedDocument } from './documentStatus';

export const OPEN_ACTIVITY_COLORS = {
  documents: '#2563eb',
  audits: '#7c3aed',
  nonconformities: '#ef4444',
  capa: '#f59e0b',
  training: '#10b981',
} as const;

function countOpenDocuments(documents: DocumentRecord[]): number {
  return documents.filter(
    (document) => isPendingApprovalDocument(document) || isRejectedDocument(document),
  ).length;
}

/** Open items per module. Non-document modules stay at 0 until those domains are implemented. */
export function buildOpenActivityBreakdown(documents: DocumentRecord[]): ColoredChartPoint[] {
  return [
    {
      label: 'Documents',
      value: countOpenDocuments(documents),
      color: OPEN_ACTIVITY_COLORS.documents,
    },
    { label: 'Audits', value: 0, color: OPEN_ACTIVITY_COLORS.audits },
    { label: 'Nonconformities', value: 0, color: OPEN_ACTIVITY_COLORS.nonconformities },
    { label: 'CAPA', value: 0, color: OPEN_ACTIVITY_COLORS.capa },
    { label: 'Training', value: 0, color: OPEN_ACTIVITY_COLORS.training },
  ];
}