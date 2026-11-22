import type { DocumentArchiveRecord } from '../../../types/documentArchive';
import { formatRevisionVersionLabel } from '../../../lib/documents/documentVersionRevision';
import { formatDocumentCodeWithVersion } from '../../../lib/documents/documentCode';

function csvCell(value: string | number | undefined): string {
  if (value === undefined || value === null) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function joinCsvRow(cells: (string | number | undefined)[]): string {
  return cells.map(csvCell).join(',');
}

function safeFileToken(value: string): string {
  return value.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_').slice(0, 48) || 'document-archives';
}

function formatArchivedDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export function downloadDocumentArchivesCsv(
  archives: DocumentArchiveRecord[],
  fileStem = 'document-archives',
) {
  const exportedAt = new Date().toLocaleString();
  const lines: string[] = [];

  lines.push(joinCsvRow(['Document Archives Export']));
  lines.push(joinCsvRow(['Exported at', exportedAt]));
  lines.push(joinCsvRow(['Row count', archives.length]));
  lines.push('');
  lines.push(
    joinCsvRow([
      'Version',
      'Superseded by',
      'Document Code',
      'Title',
      'Document Type',
      'Process',
      'Owner',
      'Approved by',
      'Archived at',
      'Archived by',
    ]),
  );

  for (const row of archives) {
    lines.push(
      joinCsvRow([
        formatRevisionVersionLabel(row.version),
        formatRevisionVersionLabel(row.supersededByVersion),
        formatDocumentCodeWithVersion(row.code, row.version) || row.code,
        row.title,
        row.type,
        row.process,
        row.owner,
        row.approvedBy ?? '',
        formatArchivedDate(row.archivedAt),
        row.archivedByName ?? row.archivedBy,
      ]),
    );
  }

  const csv = lines.join('\r\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = `${safeFileToken(fileStem)}.csv`;
  link.rel = 'noopener';
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}