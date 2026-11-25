import { getSupabaseAdmin } from '@/database/supabase/client';
import type { ApprovalMeetingRecord } from '@/types';

function rowFromRecord(record: ApprovalMeetingRecord) {
  return {
    id: record.id,
    document_id: record.documentId,
    document_version: record.documentVersion,
    status: record.status,
    scheduled_starts_at: record.scheduledStartsAt,
    timezone: record.timezone,
    created_by: record.createdBy,
    created_at: record.createdAt,
    body: record,
  };
}

export async function fetchAllApprovalMeetings(): Promise<ApprovalMeetingRecord[]> {
  const { data, error } = await getSupabaseAdmin().from('approval_meetings').select('body');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.body as ApprovalMeetingRecord);
}

export async function fetchApprovalMeetingById(id: string): Promise<ApprovalMeetingRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('approval_meetings')
    .select('body')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (data.body as ApprovalMeetingRecord) : null;
}

export async function fetchApprovalMeetingsByDocumentId(
  documentId: string,
): Promise<ApprovalMeetingRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('approval_meetings')
    .select('body')
    .eq('document_id', documentId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.body as ApprovalMeetingRecord);
}

export async function upsertApprovalMeeting(record: ApprovalMeetingRecord): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('approval_meetings')
    .upsert(rowFromRecord(record), { onConflict: 'id' });
  if (error) throw new Error(error.message);
}