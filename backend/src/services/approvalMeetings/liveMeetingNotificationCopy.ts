import type { ApprovalMeetingRecord } from '@/types';

export function formatMeetingSchedule(iso: string, timezone: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone,
    });
  } catch {
    return new Date(iso).toISOString();
  }
}

export function liveMeetingJoinHint(): string {
  return 'Open this notification in Daros to join the live meeting.';
}

export function buildScheduledMeetingNotification(params: {
  meeting: Pick<ApprovalMeetingRecord, 'title' | 'scheduledStartsAt' | 'timezone'>;
  documentTitle: string;
  documentCode?: string;
  actorName: string;
  variant: 'invitation' | 'rescheduled';
}): { title: string; message: string } {
  const when = formatMeetingSchedule(params.meeting.scheduledStartsAt, params.meeting.timezone);
  const docLabel = params.documentCode?.trim() || params.documentTitle.trim() || 'Document';
  const meetingTitle = params.meeting.title?.trim() || `Live review: ${docLabel}`;

  if (params.variant === 'rescheduled') {
    return {
      title: `Live meeting rescheduled — ${meetingTitle}`,
      message: `${params.actorName} rescheduled the Daros Live session for "${docLabel}" to ${when} (${params.meeting.timezone}). ${liveMeetingJoinHint()}`,
    };
  }

  return {
    title: meetingTitle,
    message: `${params.actorName} scheduled a Daros Live session for "${docLabel}" on ${when} (${params.meeting.timezone}). ${liveMeetingJoinHint()}`,
  };
}