export type ApprovalMeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type MeetingDecisionStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

export type ApprovalMeetingParticipantRole = 'author' | 'reviewer' | 'approver';

export interface ApprovalMeetingParticipant {
  role: ApprovalMeetingParticipantRole;
  email: string;
  displayName: string;
}

export interface ApprovalMeetingRecord {
  id: string;
  documentId: string;
  documentVersion: number;
  status: ApprovalMeetingStatus;
  scheduledStartsAt: string;
  scheduledEndsAt?: string;
  timezone: string;
  createdBy: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  contentFingerprint: string;
  ownerAtSchedule: string;
  approverAtSchedule: string;
  /** LiveKit Cloud room — set at scheduling time. */
  livekitRoomName?: string;
  /** Display title for invitations and meeting header. */
  title?: string;
  description?: string;
  clientSubmissionKey?: string;
  invitationsSentAt?: string;
  participants: ApprovalMeetingParticipant[];
}

export interface MeetingDecisionRecord {
  id: string;
  meetingId: string;
  documentId: string;
  documentVersion: number;
  status: MeetingDecisionStatus;
  reviewerEmail: string;
  approverEmail: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApprovalMeetingInput {
  documentId: string;
  scheduledStartsAt: string;
  scheduledEndsAt?: string;
  timezone: string;
  title: string;
  description?: string;
  clientSubmissionKey?: string;
  sendInvitations?: boolean;
}

export interface RescheduleApprovalMeetingInput {
  scheduledStartsAt: string;
  scheduledEndsAt?: string;
  timezone?: string;
  title?: string;
  description?: string;
  notifyParticipants?: boolean;
}