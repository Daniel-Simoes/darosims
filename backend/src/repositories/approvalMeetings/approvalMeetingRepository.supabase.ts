import {
  fetchAllApprovalMeetings,
  fetchApprovalMeetingById,
  fetchApprovalMeetingsByDocumentId,
  upsertApprovalMeeting,
} from '@/database/supabase/approvalMeetingsTable';
import type { ApprovalMeetingRecord } from '@/types';

export async function readAllApprovalMeetings(): Promise<ApprovalMeetingRecord[]> {
  return fetchAllApprovalMeetings();
}

export async function findApprovalMeetingById(id: string): Promise<ApprovalMeetingRecord | null> {
  return fetchApprovalMeetingById(id);
}

export async function findApprovalMeetingsByDocumentId(
  documentId: string,
): Promise<ApprovalMeetingRecord[]> {
  return fetchApprovalMeetingsByDocumentId(documentId);
}

export async function saveApprovalMeetingRecord(record: ApprovalMeetingRecord): Promise<void> {
  await upsertApprovalMeeting(record);
}