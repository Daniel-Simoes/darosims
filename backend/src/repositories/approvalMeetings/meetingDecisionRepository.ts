import { getDatabaseProvider } from '@/database/provider';
import * as files from '@/repositories/approvalMeetings/meetingDecisionRepository.files';
import * as supabase from '@/repositories/approvalMeetings/meetingDecisionRepository.supabase';
import type { MeetingDecisionRecord } from '@/types';

function repo() {
  return getDatabaseProvider() === 'supabase' ? supabase : files;
}

export async function findMeetingDecisionByMeetingId(meetingId: string) {
  return repo().findMeetingDecisionByMeetingId(meetingId);
}

export async function findMeetingDecisionsByDocumentId(documentId: string) {
  return repo().findMeetingDecisionsByDocumentId(documentId);
}

export async function saveMeetingDecisionRecord(record: MeetingDecisionRecord) {
  return repo().saveMeetingDecisionRecord(record);
}

export async function transitionMeetingDecisionRecord(
  meetingId: string,
  expectedStatus: MeetingDecisionRecord['status'],
  apply: (current: MeetingDecisionRecord) => MeetingDecisionRecord,
) {
  return repo().transitionMeetingDecisionRecord(meetingId, expectedStatus, apply);
}