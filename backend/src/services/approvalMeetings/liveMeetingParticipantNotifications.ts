import { createNotification } from '@/lib/notifications';
import { shouldNotifyUser } from '@/lib/documentWorkflowNotifications';
import type { ApprovalMeetingRecord, DocumentRecord } from '@/types';
import { buildScheduledMeetingNotification, liveMeetingJoinHint } from './liveMeetingNotificationCopy';

type Actor = { name: string; email: string };

function documentLabel(document: Pick<DocumentRecord, 'title' | 'code'>): string {
  return document.code?.trim() || document.title.trim() || 'Document';
}

export async function sendLiveMeetingScheduledNotifications(
  meeting: ApprovalMeetingRecord,
  document: Pick<DocumentRecord, 'id' | 'title' | 'code'>,
  actor: Actor,
): Promise<void> {
  const copy = buildScheduledMeetingNotification({
    meeting,
    documentTitle: document.title,
    documentCode: document.code,
    actorName: actor.name,
    variant: 'invitation',
  });

  for (const participant of meeting.participants) {
    if (participant.role === 'author') continue;
    if (!shouldNotifyUser(participant.email, actor.email)) continue;

    await createNotification({
      recipientEmail: participant.email,
      documentId: document.id,
      type: 'live_meeting_invitation',
      title: copy.title,
      message: copy.message,
      actorName: actor.name,
      approvalMeetingId: meeting.id,
    });
  }
}

export async function sendLiveMeetingRescheduledNotifications(
  meeting: ApprovalMeetingRecord,
  document: Pick<DocumentRecord, 'id' | 'title' | 'code'>,
  actor: Actor,
): Promise<void> {
  const copy = buildScheduledMeetingNotification({
    meeting,
    documentTitle: document.title,
    documentCode: document.code,
    actorName: actor.name,
    variant: 'rescheduled',
  });

  for (const participant of meeting.participants) {
    if (!shouldNotifyUser(participant.email, actor.email)) continue;

    await createNotification({
      recipientEmail: participant.email,
      documentId: document.id,
      type: 'live_meeting_rescheduled',
      title: copy.title,
      message: copy.message,
      actorName: actor.name,
      approvalMeetingId: meeting.id,
    });
  }
}

export async function sendLiveMeetingCancelledNotifications(
  meeting: ApprovalMeetingRecord,
  document: Pick<DocumentRecord, 'id' | 'title' | 'code'>,
  actor: Actor,
  reason?: string,
): Promise<void> {
  const docLabel = documentLabel(document);
  const meetingTitle = meeting.title?.trim() || `Live review: ${docLabel}`;
  const reasonSuffix = reason?.trim() ? ` Reason: ${reason.trim()}` : '';

  for (const participant of meeting.participants) {
    if (!shouldNotifyUser(participant.email, actor.email)) continue;

    await createNotification({
      recipientEmail: participant.email,
      documentId: document.id,
      type: 'live_meeting_cancelled',
      title: `Live meeting cancelled — ${meetingTitle}`,
      message: `${actor.name} cancelled the Daros Live session for "${docLabel}".${reasonSuffix}`,
      actorName: actor.name,
      approvalMeetingId: meeting.id,
    });
  }
}

export async function sendLiveMeetingIncompleteNotifications(
  meeting: ApprovalMeetingRecord,
  document: Pick<DocumentRecord, 'id' | 'title' | 'code'>,
  actor: Actor,
  decisionStatus: string,
): Promise<void> {
  const docLabel = documentLabel(document);
  const meetingTitle = meeting.title?.trim() || `Live review: ${docLabel}`;

  for (const participant of meeting.participants) {
    if (!shouldNotifyUser(participant.email, actor.email)) continue;

    await createNotification({
      recipientEmail: participant.email,
      documentId: document.id,
      type: 'live_meeting_ended',
      title: `Live meeting ended — ${meetingTitle}`,
      message: `${actor.name} ended the live session for "${docLabel}" before the approval cycle completed (status: ${decisionStatus}). ${liveMeetingJoinHint()}`,
      actorName: actor.name,
      approvalMeetingId: meeting.id,
    });
  }
}