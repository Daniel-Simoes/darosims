import { findApprovalMeetingById, saveApprovalMeetingRecord } from '@/repositories/approvalMeetings/approvalMeetingRepository';
import type { ApprovalMeetingRecord, DocumentRecord } from '@/types';
import { sendLiveMeetingScheduledNotifications } from './liveMeetingParticipantNotifications';

/**
 * In-app invitations (Daros notifications). Email is not configured in this project —
 * operators would add SMTP/Resend later; records here are the source of truth for participants.
 */
export async function sendLiveMeetingInvitations(
  meetingId: string,
  document: Pick<DocumentRecord, 'id' | 'title' | 'code'>,
  actor: { name: string; email: string },
): Promise<ApprovalMeetingRecord> {
  const meeting = await findApprovalMeetingById(meetingId);
  if (!meeting) {
    throw new Error('Meeting not found');
  }

  if (meeting.invitationsSentAt) {
    return meeting;
  }

  await sendLiveMeetingScheduledNotifications(meeting, document, actor);

  const updated: ApprovalMeetingRecord = {
    ...meeting,
    invitationsSentAt: new Date().toISOString(),
  };
  await saveApprovalMeetingRecord(updated);
  return updated;
}