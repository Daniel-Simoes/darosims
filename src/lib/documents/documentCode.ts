import { TYPE_PREFIX } from '../../data/documentTypes';
import { PROCESS_PREFIX } from '../../data/processes';

function fallbackPrefix(label: string): string {
  const acronym = label.match(/\(([A-Z]+)\)\s*$/)?.[1];
  if (acronym) return acronym;

  const words = label
    .replace(/\([^)]*\)/g, '')
    .split(/[/\s-]+/)
    .filter(Boolean);

  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.map((word) => word[0]?.toUpperCase() ?? '').join('');
}

export function getDocumentCodePrefix(type: string, process: string): string {
  const typePrefix = TYPE_PREFIX[type] ?? fallbackPrefix(type);
  const processPrefix = PROCESS_PREFIX[process] ?? fallbackPrefix(process);
  if (!typePrefix || !processPrefix) return '';
  return `${typePrefix} ${processPrefix}`;
}

/** e.g. Policy Manual + Human Resources → "PM HR 01", "PM HR 02", … */
export function generateDocumentCode(
  type: string,
  process: string,
  existingCodes: string[],
): string {
  const prefix = getDocumentCodePrefix(type, process);
  if (!prefix) return '';

  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escaped} (\\d+)$`);

  let maxNumber = 0;
  for (const code of existingCodes) {
    const match = code.match(pattern);
    if (match) maxNumber = Math.max(maxNumber, parseInt(match[1], 10));
  }

  return `${prefix} ${String(maxNumber + 1).padStart(2, '0')}`;
}

/**
 * Version number used when rendering the document code (same rules everywhere as Document Control).
 * During an open revision before submit, show the target revision on the code.
 */
export function resolveDocumentVersionForCode(doc: {
  version?: number;
  revisionTargetVersion?: number;
  publishedBaseline?: unknown;
  submittedAt?: string;
}): number {
  const current = Number(doc.version);
  const target = doc.revisionTargetVersion;
  if (doc.publishedBaseline && target != null && Number.isFinite(target) && !doc.submittedAt) {
    return target;
  }
  return Number.isFinite(current) ? current : 1;
}

/**
 * DAROS internal code with revision suffix (e.g. `FR AD 01` + v1.1 → `FR AD 01.1`).
 * Base stored code stays the series number; minor revisions append `.1`, `.2`, …
 * Version `1` keeps the base code without a suffix.
 */
export function formatDocumentCodeWithVersion(
  code: string | undefined,
  version: number | undefined,
): string {
  const base = code?.trim();
  if (!base) return '';

  const v = Number(version);
  if (!Number.isFinite(v) || v <= 1) {
    return base;
  }

  let minorDigit: number;
  if (Number.isInteger(v)) {
    minorDigit = v;
  } else {
    const fractional = v - Math.floor(v);
    if (fractional < 0.001) {
      return base;
    }
    minorDigit = Math.round(fractional * 10);
  }

  if (minorDigit <= 0) {
    return base;
  }

  const match = base.match(/^(.+\s)(\d+)$/);
  if (match) {
    return `${match[1]}${match[2]}.${minorDigit}`;
  }

  return `${base}.${minorDigit}`;
}

export function formatDocumentCodeForRecord(doc: {
  code?: string;
  version?: number;
  revisionTargetVersion?: number;
  publishedBaseline?: unknown;
  submittedAt?: string;
  documentOrigin?: string;
  externalRef?: string;
}): string {
  if (doc.documentOrigin === 'External') {
    return doc.externalRef?.trim() || '—';
  }
  const version = resolveDocumentVersionForCode(doc);
  return formatDocumentCodeWithVersion(doc.code, version) || doc.code?.trim() || '—';
}

/**
 * When type or process changes, assign the next code in that series (01 if none exist yet).
 * `existingCodes` must exclude the document being edited.
 */
export function recalculateDocumentCodeForTypeProcessChange(
  type: string,
  process: string,
  currentCode: string,
  existingCodes: string[],
): string {
  const next = generateDocumentCode(type, process, existingCodes);
  if (next) return next;
  return currentCode.trim();
}
