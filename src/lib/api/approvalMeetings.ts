import { apiFetch } from './client';
import type { ApprovalMeetingRecord, MeetingDecisionRecord } from '../../types/approvalMeetings';

export type LiveKitTokenResponse = {
  token: string;
  serverUrl: string;
  roomName: string;
  role: 'author' | 'reviewer' | 'approver';
  meetingId: string;
  documentId: string;
  expiresAt: string;
};

export const approvalMeetingsApi = {
  createMeeting(payload: {
    documentId: string;
    scheduledStartsAt: string;
    timezone?: string;
    scheduledEndsAt?: string;
    title: string;
    description?: string;
    clientSubmissionKey?: string;
    sendInvitations?: boolean;
  }) {
    return apiFetch<{
      meeting: ApprovalMeetingRecord;
      decision: MeetingDecisionRecord;
      created: boolean;
    }>('/api/approval-meetings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMeeting(id: string) {
    return apiFetch<{
      meeting: ApprovalMeetingRecord;
      decision: MeetingDecisionRecord | null;
      authorization: { role: string | null; canAccess: boolean; isHost: boolean };
    }>(`/api/approval-meetings/${id}`);
  },

  listMeetingsForDocument(documentId: string) {
    return apiFetch<{ meetings: ApprovalMeetingRecord[] }>(
      `/api/approval-meetings?documentId=${encodeURIComponent(documentId)}`,
    );
  },

  listDocumentMeetings(documentId: string) {
    return apiFetch<{
      meetings: Array<{
        meeting: ApprovalMeetingRecord;
        decision: MeetingDecisionRecord | null;
      }>;
    }>(`/api/documents/${encodeURIComponent(documentId)}/approval-meetings`);
  },

  rescheduleMeeting(
    meetingId: string,
    payload: {
      scheduledStartsAt: string;
      timezone?: string;
      scheduledEndsAt?: string;
      title?: string;
      description?: string;
    },
  ) {
    return apiFetch<{ meeting: ApprovalMeetingRecord }>(
      `/api/approval-meetings/${meetingId}/reschedule`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  startMeeting(id: string) {
    return apiFetch<{ meeting: ApprovalMeetingRecord }>(`/api/approval-meetings/${id}/start`, {
      method: 'POST',
    });
  },

  endMeeting(id: string) {
    return apiFetch<{ meeting: ApprovalMeetingRecord }>(`/api/approval-meetings/${id}/end`, {
      method: 'POST',
    });
  },

  cancelMeeting(id: string, reason?: string) {
    return apiFetch<{ meeting: ApprovalMeetingRecord }>(`/api/approval-meetings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(reason ? { reason } : {}),
    });
  },

  fetchLiveKitToken(meetingId: string) {
    return apiFetch<LiveKitTokenResponse>(`/api/approval-meetings/${meetingId}/livekit-token`, {
      method: 'POST',
    });
  },

  reviewInMeeting(meetingId: string) {
    return apiFetch<{
      meeting: ApprovalMeetingRecord;
      decision: MeetingDecisionRecord;
    }>(`/api/approval-meetings/${meetingId}/review`, { method: 'POST' });
  },

  approveInMeeting(meetingId: string) {
    return apiFetch<{
      meeting: ApprovalMeetingRecord;
      decision: MeetingDecisionRecord;
    }>(`/api/approval-meetings/${meetingId}/approve`, { method: 'POST' });
  },

  rejectInMeeting(meetingId: string, reason: string) {
    return apiFetch<{
      meeting: ApprovalMeetingRecord;
      decision: MeetingDecisionRecord;
    }>(`/api/approval-meetings/${meetingId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};