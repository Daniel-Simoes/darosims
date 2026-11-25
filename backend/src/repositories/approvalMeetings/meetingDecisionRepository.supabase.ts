import {
  fetchMeetingDecisionByMeetingId,
  fetchMeetingDecisionsByDocumentId,
  upsertMeetingDecision,
} from '@/database/supabase/meetingDecisionsTable';
import type { MeetingDecisionRecord } from '@/types';

export async function findMeetingDecisionByMeetingId(meetingId: string) {
  return fetchMeetingDecisionByMeetingId(meetingId);
}

export async function findMeetingDecisionsByDocumentId(documentId: string) {
  return fetchMeetingDecisionsByDocumentId(documentId);
}

export async function saveMeetingDecisionRecord(record: MeetingDecisionRecord): Promise<void> {
  await upsertMeetingDecision(record);
}

export async function transitionMeetingDecisionRecord(
  meetingId: string,
  expectedStatus: MeetingDecisionRecord['status'],
  apply: (current: MeetingDecisionRecord) => MeetingDecisionRecord,
): Promise<MeetingDecisionRecord> {
  const current = await fetchMeetingDecisionByMeetingId(meetingId);
  if (!current) {
    throw new Error('Meeting decision not found');
  }
  if (current.status !== expectedStatus) {
    throw new Error(`Meeting decision is already ${current.status}`);
  }
  const next = { ...apply(current), updatedAt: new Date().toISOString() };
  await upsertMeetingDecision(next);
  return next;
}