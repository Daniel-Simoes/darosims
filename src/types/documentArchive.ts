import type { DocumentRecord } from './documents';

export interface DocumentArchiveRecord {
  id: string;
  sourceDocumentId: string;
  code: string;
  title: string;
  version: number;
  type: string;
  process: string;
  owner: string;
  approver?: string;
  approvedBy?: string;
  department?: string;
  effectiveDate: string;
  nextReviewDate?: string;
  documentOrigin?: string;
  fileName?: string;
  fileFormat?: DocumentRecord['fileFormat'];
  supersededByVersion: number;
  archivedAt: string;
  archivedBy: string;
  archivedByName?: string;
}

export interface DocumentArchivesResponse {
  archives: DocumentArchiveRecord[];
  total: number;
}