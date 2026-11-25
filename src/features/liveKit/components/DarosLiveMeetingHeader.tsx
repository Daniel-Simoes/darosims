import type { ApprovalMeetingRecord } from '../../../types/approvalMeetings';
import { useMeetingDuration } from '../hooks/useMeetingDuration';

const STATUS_LABEL: Record<ApprovalMeetingRecord['status'], string> = {
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

interface DarosLiveMeetingHeaderProps {
  meeting: ApprovalMeetingRecord;
  documentTitle: string;
  connectionState: string;
}

export function DarosLiveMeetingHeader({
  meeting,
  documentTitle,
  connectionState,
}: DarosLiveMeetingHeaderProps) {
  const duration = useMeetingDuration(meeting.startedAt ?? meeting.createdAt);

  return (
    <header className="dl-meeting-header">
      <div className="dl-meeting-brand">
        <span className="dl-meeting-brand-mark" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </span>
        <div>
          <p className="dl-meeting-brand-title">Daros Live</p>
          <p className="dl-meeting-brand-sub">Collaborative review &amp; approval</p>
        </div>
      </div>

      <div className="dl-meeting-header-center">
        <h1 className="dl-meeting-doc-title">
          {meeting.title?.trim() || documentTitle || 'Document review'}
        </h1>
        <p className="dl-meeting-doc-meta">
          Live session · {meeting.livekitRoomName ?? meeting.id.slice(0, 8)}
        </p>
      </div>

      <div className="dl-meeting-header-status" aria-live="polite">
        <span className={`dl-status-pill dl-status-${meeting.status}`}>
          {STATUS_LABEL[meeting.status]}
        </span>
        <span className="dl-status-pill dl-status-connection">{connectionState}</span>
        <span className="dl-meeting-duration" aria-label="Meeting duration">
          {duration}
        </span>
      </div>
    </header>
  );
}