export type { DocumentType } from '../data/documentTypes';

export type DocumentStatus = 'Active' | 'Draft' | 'Obsolete';

export interface DocumentRecord {
  id: string;
  code: string;
  title: string;
  version: number;
  type: string;
  hasIso?: boolean;
  process: string;
  owner: string;
  effectiveDate: string;
  nextReviewDate: string;
  status: DocumentStatus;
  documentOrigin?: string;
  externalRef?: string;
  externalVersion?: string;
  fileName?: string;
  fileFormat?: 'word' | 'pdf';
  sourceContent?: string;
  sourceModified?: boolean;
  approvedBy?: string;
  department?: string;
  reviewFrequency?: string;
  repository?: string;
  distribution?: string;
  retentionPeriod?: string;
  retentionNotes?: string;
  disposition?: string;
  comments?: string;
  createdAt?: string;
  createdBy?: string;
  submittedAt?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
}

export interface CreateDocumentPayload {
  type: string;
  hasIso?: boolean;
  code?: string;
  process: string;
  title: string;
  version?: number;
  documentOrigin?: string;
  externalRef?: string;
  externalVersion?: string;
  owner?: string;
  approvedBy?: string;
  department?: string;
  effectiveDate?: string;
  reviewFrequency?: string;
  nextReviewDate?: string;
  repository?: string;
  distribution?: string;
  retentionPeriod?: string;
  retentionNotes?: string;
  disposition?: string;
  comments?: string;
  status?: DocumentRecord['status'];
}

export interface UpdateDocumentPayload {
  type?: string;
  hasIso?: boolean;
  process?: string;
  title?: string;
  version?: number;
  status?: DocumentRecord['status'];
  documentOrigin?: string;
  externalRef?: string;
  externalVersion?: string;
  owner?: string;
  approvedBy?: string;
  department?: string;
  effectiveDate?: string;
  reviewFrequency?: string;
  nextReviewDate?: string;
  repository?: string;
  distribution?: string;
  retentionPeriod?: string;
  retentionNotes?: string;
  disposition?: string;
  comments?: string;
  sourceContent?: string;
  fileFormat?: 'word' | 'pdf';
  fileName?: string;
  sourceModified?: boolean;
  submittedAt?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
}

export interface DocumentsResponse {
  documents: DocumentRecord[];
  total: number;
}

export interface DocumentResponse {
  document: DocumentRecord;
}

export interface CreateDocumentResponse {
  document: DocumentRecord;
}

export interface DeleteDocumentResponse {
  success: boolean;
}
