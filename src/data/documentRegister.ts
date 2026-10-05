import type { DocumentType } from './documentTypes';
export type { DocumentType } from './documentTypes';

export interface DocumentRecord {
  id: string;
  code: string;
  title: string;
  version: number;
  type: DocumentType;
  process: string;
  owner: string;
  effectiveDate: string;
  nextReviewDate: string;
  status: 'Active' | 'Draft' | 'Obsolete';
}

export { documentTypeBadgeClass } from './documentTypes';
