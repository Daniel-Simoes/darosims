import type { DocumentRecord } from '../../../types/documents';
import { getDocumentStatusLabel } from '../../../lib/documentStatus';
import { getDocumentDisplayCode } from '../../../lib/search/documentSearch';
import { getDocumentRegisterOwnerDisplay } from './registerOwnerDisplay';
import { DOCUMENT_USERS } from '../../../lib/permissions/documentPermissions';

function csvCell(value: string | number | undefined): string {
  if (value === undefined || value === null) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function joinCsvRow(cells: (string | number | undefined)[]): string {
  return cells.map(csvCell).join(',');
}

function documentCode(doc: DocumentRecord): string {
  return getDocumentDisplayCode(doc);
}

function safeFileToken(value: string): string {
  return value.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_').slice(0, 48) || 'document-control';
}

export function downloadDocumentRegisterCsv(documents: DocumentRecord[], fileStem = 'document-register') {
  const exportedAt = new Date().toLocaleString();
  const lines: string[] = [];

  lines.push(joinCsvRow(['Document Control Export']));
  lines.push(joinCsvRow(['Exported at', exportedAt]));
  lines.push(joinCsvRow(['Row count', documents.length]));
  lines.push('');
  lines.push(
    joinCsvRow([
      'Document Code',
      'Title',
      'Document Type',
      'Process',
      'Status',
      'Origin',
      'Version',
      'Owner',
      'Owner notes',
      'Department',
      'Effective Date',
    ]),
  );

  const teamUsers = [...DOCUMENT_USERS];

  for (const doc of documents) {
    const ownerDisplay = getDocumentRegisterOwnerDisplay(doc, teamUsers);
    lines.push(
      joinCsvRow([
        documentCode(doc),
        doc.title,
        doc.type,
        doc.process,
        getDocumentStatusLabel(doc),
        doc.documentOrigin ?? 'Internal',
        doc.documentOrigin === 'External' ? doc.externalVersion ?? '' : doc.version,
        ownerDisplay.primaryTitle ?? ownerDisplay.primary,
        ownerDisplay.secondary ?? '',
        doc.department ?? '',
        doc.effectiveDate ?? '',
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
  URL.revokeObjectURL(url);
}