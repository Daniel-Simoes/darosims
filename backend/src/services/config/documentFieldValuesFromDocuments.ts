import type { DocumentFieldOptionCategory } from '@/data/documentFieldDefaults';
import type { DocumentRecord } from '@/types';

function splitList(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function collectDocumentFieldValues(
  category: DocumentFieldOptionCategory,
  documents: DocumentRecord[],
): string[] {
  const values: string[] = [];

  for (const doc of documents) {
    switch (category) {
      case 'repository':
        if (doc.repository?.trim()) values.push(doc.repository);
        break;
      case 'location':
        if (doc.location?.trim()) values.push(doc.location);
        break;
      case 'retention_period':
        if (doc.retentionPeriod?.trim()) values.push(doc.retentionPeriod);
        break;
      case 'disposition':
        if (doc.disposition?.trim()) values.push(doc.disposition);
        break;
      case 'distribution_department':
        if (doc.department?.trim()) values.push(doc.department);
        values.push(...splitList(doc.distribution));
        break;
      case 'review_frequency':
        if (doc.reviewFrequency?.trim()) values.push(doc.reviewFrequency);
        break;
      default:
        break;
    }
  }

  return values;
}