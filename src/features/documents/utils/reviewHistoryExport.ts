import type { DocumentRecord } from '../../../types/documents';
import type { DocumentReviewHistoryRow, DocumentReviewTimelineStep } from './reviewHistory';

function csvCell(value: string | number | undefined): string {
  if (value === undefined || value === null) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function joinCsvRow(cells: (string | number | undefined)[]): string {
  return cells.map(csvCell).join(',');
}

function documentCodeLabel(doc: DocumentRecord): string {
  return doc.documentOrigin === 'External' ? doc.externalRef?.trim() || 'External' : doc.code?.trim() || '—';
}

function safeFileToken(value: string): string {
  return value.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_').slice(0, 80);
}

export function buildReviewHistoryCsv(
  document: DocumentRecord,
  steps: DocumentReviewTimelineStep[],
  tableRows: DocumentReviewHistoryRow[] = [],
): string {
  const lines: string[] = [];
  const exportedAt = new Date().toLocaleString();

  lines.push(joinCsvRow(['Document Review History Export']));
  lines.push(joinCsvRow(['Document code', documentCodeLabel(document)]));
  lines.push(joinCsvRow(['Document title', document.title]));
  lines.push(joinCsvRow(['Current version', String(document.version)]));
  lines.push(joinCsvRow(['Status', document.status]));
  lines.push(joinCsvRow(['Exported at', exportedAt]));
  lines.push('');

  if (tableRows.length > 0) {
    lines.push(joinCsvRow(['Review history register']));
    lines.push(
      joinCsvRow([
        'Version',
        'Date',
        'Section',
        'Description of change',
        'Justification',
        'Approved by',
      ]),
    );
    for (const row of tableRows) {
      lines.push(
        joinCsvRow([
          row.versionNumber,
          row.date,
          row.section,
          row.descriptionOfChange,
          row.justificationForChange,
          row.approvedBy,
        ]),
      );
    }
    lines.push('');
  }

  lines.push(joinCsvRow(['Workflow timeline']));
  lines.push(
    joinCsvRow([
      'Step',
      'Date',
      'Title',
      'Description',
      'Version',
      'By (email)',
      'To (email)',
      'Stage',
      'Reason / notes',
    ]),
  );

  steps.forEach((step, index) => {
    lines.push(
      joinCsvRow([
        index + 1,
        step.date,
        step.title,
        step.description,
        step.version ?? '',
        step.byEmail ?? '',
        step.toEmail ?? '',
        step.rejectionStage ?? '',
        step.reviewMessage ?? '',
      ]),
    );
  });

  return lines.join('\r\n');
}

export function downloadReviewHistorySpreadsheet(
  document: DocumentRecord,
  steps: DocumentReviewTimelineStep[],
  tableRows: DocumentReviewHistoryRow[] = [],
): void {
  const csv = buildReviewHistoryCsv(document, steps, tableRows);
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const code = safeFileToken(documentCodeLabel(document));
  const filename = `${code || 'document'}-review-history.csv`;

  const link = window.document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}