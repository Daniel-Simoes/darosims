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
