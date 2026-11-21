import type { DocumentArchiveRecord } from '../../../types/documentArchive';
import type { DocumentRecord } from '../../../types/documents';
import {
  isPendingApprovalDocument,
  isPendingFinalApprovalDocument,
} from '../../../lib/documentStatus';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function toTimestamp(value?: string): number | null {
  if (!value?.trim()) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getRange(now = Date.now()): { currentStart: number; previousStart: number; previousEnd: number } {
  const currentStart = now - WEEK_MS;
  const previousStart = now - WEEK_MS * 2;
  const previousEnd = currentStart;
  return { currentStart, previousStart, previousEnd };
}

function inRange(ts: number, start: number, end: number): boolean {
  return ts >= start && ts < end;
}

function countCreatedBetween(documents: DocumentRecord[], start: number, end: number): number {
  let count = 0;
  for (const doc of documents) {
    const ts = toTimestamp(doc.createdAt);
    if (ts !== null && inRange(ts, start, end)) count += 1;
  }
  return count;
}

function countActiveEffectiveBetween(documents: DocumentRecord[], start: number, end: number): number {
  let count = 0;
  for (const doc of documents) {
    if (doc.status !== 'Active') continue;
    const ts = toTimestamp(doc.effectiveDate) ?? toTimestamp(doc.createdAt);
    if (ts !== null && inRange(ts, start, end)) count += 1;
  }
  return count;
}

function countSubmittedBetween(documents: DocumentRecord[], start: number, end: number): number {
  let count = 0;
  for (const doc of documents) {
    const ts = toTimestamp(doc.submittedAt);
    if (ts === null || !inRange(ts, start, end)) continue;
    if (
      isPendingApprovalDocument(doc) ||
      isPendingFinalApprovalDocument(doc) ||
      doc.status === 'Active' ||
      doc.status === 'Obsolete'
    ) {
      count += 1;
    }
  }
  return count;
}

function countArchivedBetween(archives: DocumentArchiveRecord[], start: number, end: number): number {
  let count = 0;
  for (const item of archives) {
    const ts = toTimestamp(item.archivedAt);
    if (ts !== null && inRange(ts, start, end)) count += 1;
  }
  return count;
}

/** Week-over-week change (last 7 days vs prior 7 days). */
export function computeWeeklyChangePercent(current: number, previous: number): number {
  if (current === 0 && previous === 0) return 0;
  if (previous === 0) return Math.min(99, current * 100);
  const raw = Math.round(((current - previous) / previous) * 100);
  return Math.max(-99, Math.min(99, raw));
}

export function formatWeeklyDeltaLabel(percent: number): string {
  if (percent === 0) return '0%';
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent}%`;
}

export type RegisterWeeklyMetric = {
  currentWeek: number;
  previousWeek: number;
  changePercent: number;
};

export function buildRegisterWeeklyMetrics(
  documents: DocumentRecord[],
  archives: DocumentArchiveRecord[],
  now = Date.now(),
): {
  total: RegisterWeeklyMetric;
  active: RegisterWeeklyMetric;
  pending: RegisterWeeklyMetric;
  archived: RegisterWeeklyMetric;
} {
  const { currentStart, previousStart, previousEnd } = getRange(now);

  const totalCurrent = countCreatedBetween(documents, currentStart, now);
  const totalPrevious = countCreatedBetween(documents, previousStart, previousEnd);

  const activeCurrent = countActiveEffectiveBetween(documents, currentStart, now);
  const activePrevious = countActiveEffectiveBetween(documents, previousStart, previousEnd);

  const pendingCurrent = countSubmittedBetween(documents, currentStart, now);
  const pendingPrevious = countSubmittedBetween(documents, previousStart, previousEnd);

  const archivedCurrent = countArchivedBetween(archives, currentStart, now);
  const archivedPrevious = countArchivedBetween(archives, previousStart, previousEnd);

  const metric = (currentWeek: number, previousWeek: number): RegisterWeeklyMetric => ({
    currentWeek,
    previousWeek,
    changePercent: computeWeeklyChangePercent(currentWeek, previousWeek),
  });

  return {
    total: metric(totalCurrent, totalPrevious),
    active: metric(activeCurrent, activePrevious),
    pending: metric(pendingCurrent, pendingPrevious),
    archived: metric(archivedCurrent, archivedPrevious),
  };
}