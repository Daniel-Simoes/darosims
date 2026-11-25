import { getSupabaseAdmin } from '@/database/supabase/client';
import type { MeetingDecisionRecord } from '@/types';

function rowFromRecord(record: MeetingDecisionRecord) {
  return {
    id: record.id,
    meeting_id: record.meetingId,
    document_id: record.documentId,
    document_version: record.documentVersion,
    status: record.status,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    body: record,
  };
}

export async function fetchMeetingDecisionByMeetingId(
  meetingId: string,
): Promise<MeetingDecisionRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('meeting_decisions')
    .select('body')
    .eq('meeting_id', meetingId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (data.body as MeetingDecisionRecord) : null;
}

export async function fetchMeetingDecisionsByDocumentId(
  documentId: string,
): Promise<MeetingDecisionRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('meeting_decisions')
    .select('body')
    .eq('document_id', documentId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.body as MeetingDecisionRecord);
}

export async function upsertMeetingDecision(record: MeetingDecisionRecord): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('meeting_decisions')
    .upsert(rowFromRecord(record), { onConflict: 'id' });
  if (error) throw new Error(error.message);
}