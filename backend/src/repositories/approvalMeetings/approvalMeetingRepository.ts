import { getDatabaseProvider } from '@/database/provider';
import * as files from '@/repositories/approvalMeetings/approvalMeetingRepository.files';
import * as supabase from '@/repositories/approvalMeetings/approvalMeetingRepository.supabase';
import type { ApprovalMeetingRecord } from '@/types';

function repo() {
  return getDatabaseProvider() === 'supabase' ? supabase : files;
}

export async function readAllApprovalMeetings() {
  return repo().readAllApprovalMeetings();
}

export async function findApprovalMeetingById(id: string) {
  return repo().findApprovalMeetingById(id);
}

export async function findApprovalMeetingsByDocumentId(documentId: string) {
  return repo().findApprovalMeetingsByDocumentId(documentId);
}

export async function saveApprovalMeetingRecord(record: ApprovalMeetingRecord) {
  return repo().saveApprovalMeetingRecord(record);
}

export async function findApprovalMeetingByClientSubmissionKey(
  clientSubmissionKey: string,
): Promise<ApprovalMeetingRecord | null> {
  const key = clientSubmissionKey.trim();
  if (!key) return null;
  const meetings = await readAllApprovalMeetings();
  return meetings.find((item) => item.clientSubmissionKey === key) ?? null;
}