export type { DocumentType } from '@/data/documentTypes';
import type { DocumentType } from '@/data/documentTypes';

export type DocumentStatus = 'Active' | 'Draft' | 'Obsolete';

/** Last approved snapshot kept while a newer version is in review. */
export interface DocumentPublishedBaseline {
  version: number;
  title: string;
  type: string;
  process: string;
  owner: string;
  approver?: string;
  approvedBy?: string;
  department?: string;
  effectiveDate: string;
  nextReviewDate: string;
  fileName?: string;
  fileFormat?: 'pdf' | 'image' | 'text' | 'video' | 'audio' | 'office' | 'other' | 'word';
  sourceContent?: string;
  reviewFrequency?: string;
  repository?: string;
  location?: string;
  distribution?: string;
  distributionIndividuals?: string;
  retentionPeriod?: string;
  retentionNotes?: string;
  disposition?: string;
  comments?: string;
}

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
  fileFormat?: 'pdf' | 'image' | 'text' | 'video' | 'audio' | 'office' | 'other' | 'word';
  sourceContent?: string;
  sourceModified?: boolean;
  approver?: string;
  approvedBy?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  department?: string;
  reviewFrequency?: string;
  repository?: string;
  location?: string;
  distribution?: string;
  distributionIndividuals?: string;
  retentionPeriod?: string;
  retentionNotes?: string;
  disposition?: string;
  comments?: string;
  submittedAt?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  createdAt: string;
  createdBy: string;
  publishedBaseline?: DocumentPublishedBaseline;
  revisionStartedBy?: string;
  /** Next version number; applied when the revision is submitted for review. */
  revisionTargetVersion?: number;
  /** Set after a new file upload during an open revision (required before submit). */
  revisionFileUpdated?: boolean;
  /** Email of the user who last submitted the document for review. */
  lastSubmittedBy?: string;
  approvalWorkflow?: 'standard' | 'live';
  activeApprovalMeetingId?: string;
}

export interface CreateDocumentInput {
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
  approver?: string;
  approvedBy?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  department?: string;
  effectiveDate?: string;
  reviewFrequency?: string;
  nextReviewDate?: string;
  repository?: string;
  location?: string;
  distribution?: string;
  distributionIndividuals?: string;
  retentionPeriod?: string;
  retentionNotes?: string;
  disposition?: string;
  comments?: string;
  status?: DocumentStatus;
  approvalWorkflow?: 'standard' | 'live';
  activeApprovalMeetingId?: string;
}

export interface UpdateDocumentInput {
  type?: string;
  hasIso?: boolean;
  process?: string;
  title?: string;
  version?: number;
  status?: DocumentStatus;
  documentOrigin?: string;
  externalRef?: string;
  externalVersion?: string;
  owner?: string;
  approver?: string;
  approvedBy?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  department?: string;
  effectiveDate?: string;
  reviewFrequency?: string;
  nextReviewDate?: string;
  repository?: string;
  location?: string;
  distribution?: string;
  distributionIndividuals?: string;
  retentionPeriod?: string;
  retentionNotes?: string;
  disposition?: string;
  comments?: string;
  sourceContent?: string;
  fileFormat?: 'pdf' | 'image' | 'text' | 'video' | 'audio' | 'office' | 'other' | 'word';
  fileName?: string;
  sourceModified?: boolean;
  submittedAt?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  publishedBaseline?: DocumentPublishedBaseline;
  revisionStartedBy?: string;
  revisionTargetVersion?: number;
  revisionFileUpdated?: boolean;
  /** Email of the user who last submitted the document for review. */
  lastSubmittedBy?: string;
  approvalWorkflow?: 'standard' | 'live';
  activeApprovalMeetingId?: string;
}
