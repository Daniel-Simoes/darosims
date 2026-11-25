export type DocumentFieldOptionCategory =
  | 'repository'
  | 'location'
  | 'retention_period'
  | 'disposition'
  | 'distribution_department'
  | 'review_frequency';

export const DOCUMENT_FIELD_OPTION_DEFAULTS: Record<DocumentFieldOptionCategory, readonly string[]> = {
  repository: ['Physical Repository', 'Employee Personal File', 'Document Control', 'Quality System'],
  location: ['Head Office', 'Production Site', 'Archive Room'],
  retention_period: ['1 year', '2 years', '3 years', '4 years', '5 years', 'Permanent'],
  disposition: ['Delete', 'Destroy', 'Delete + Destroy', 'Return to employee'],
  distribution_department: [
    'Administration',
    'Human Resources',
    'IT',
    'Quality',
    'Production',
    'Operations',
  ],
  review_frequency: [
    'Monthly',
    'Quarterly',
    'Every six months',
    'Annually',
    'Every two months',
    'Every three months',
    'Every four months',
  ],
};

export const DOCUMENT_FIELD_OPTION_CATEGORIES = Object.keys(
  DOCUMENT_FIELD_OPTION_DEFAULTS,
) as DocumentFieldOptionCategory[];

export function isDocumentFieldOptionCategory(value: string): value is DocumentFieldOptionCategory {
  return (DOCUMENT_FIELD_OPTION_CATEGORIES as string[]).includes(value);
}