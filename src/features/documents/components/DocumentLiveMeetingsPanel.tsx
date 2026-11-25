import { useEffect, useState } from 'react';
import { approvalMeetingsApi } from '../../../lib/api/approvalMeetings';
import type { ApprovalMeetingRecord, MeetingDecisionRecord } from '../../../types/approvalMeetings';
import { getLiveMeetingViewId } from '../../../data/liveMeetingNavigation';
import './DocumentLiveMeetingsPanel.css';

type MeetingBundle = {
  meeting: ApprovalMeetingRecord;
  decision: MeetingDecisionRecord | null;
};

interface DocumentLiveMeetingsPanelProps {
  documentId: string;
  canJoin: boolean;
  onJoinMeeting: (navId: string) => void;
}

function formatWhen(meeting: ApprovalMeetingRecord): string {
  try {
    return new Date(meeting.scheduledStartsAt).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: meeting.timezone,
    });
  } catch {
    return meeting.scheduledStartsAt;
  }
}

function decisionSummary(decision: MeetingDecisionRecord | null): string {
  if (!decision) return 'No decision record';
  const parts = [`Decision: ${decision.status}`];
  if (decision.reviewedAt) {
    parts.push(`Reviewed ${new Date(decision.reviewedAt).toLocaleString()}`);
  }
  if (decision.approvedAt) {
    parts.push(`Approved ${new Date(decision.approvedAt).toLocaleString()}`);
  }
  if (decision.rejectedAt) {
    parts.push(`Rejected ${new Date(decision.rejectedAt).toLocaleString()}`);
  }
  return parts.join(' · ');
}

export function DocumentLiveMeetingsPanel({
  documentId,
  canJoin,
  onJoinMeeting,
}: DocumentLiveMeetingsPanelProps) {
  const [bundles, setBundles] = useState<MeetingBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void approvalMeetingsApi
      .listDocumentMeetings(documentId)
      .then((data) => {
        if (active) setBundles(data.meetings);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load live meetings');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [documentId]);

  if (loading) {
    return (
      <section className="dd-live-meetings" aria-label="Daros Live meetings">
        <h3 className="dd-live-meetings-title">Daros Live meetings</h3>
        <p className="dd-live-meetings-muted">Loading meeting history…</p>
      </section>
    );
  }

  if (error || bundles.length === 0) {
    return null;
  }

  return (
    <section className="dd-live-meetings" aria-label="Daros Live meetings">
      <h3 className="dd-live-meetings-title">Daros Live meetings</h3>
      <p className="dd-live-meetings-intro">
        Scheduled live review sessions for this document. Meeting activity also appears in review history.
      </p>
      <ul className="dd-live-meetings-list">
        {bundles.map(({ meeting, decision }) => (
          <li key={meeting.id} className="dd-live-meeting-card">
            <div className="dd-live-meeting-card-head">
              <strong>{meeting.title?.trim() || 'Live review'}</strong>
              <span className={`dd-live-meeting-status dd-live-meeting-status-${meeting.status}`}>
                {meeting.status.replace('_', ' ')}
              </span>
            </div>
            <p className="dd-live-meeting-when">
              {formatWhen(meeting)} ({meeting.timezone}) · v{meeting.documentVersion}
            </p>
            <p className="dd-live-meeting-decision">{decisionSummary(decision)}</p>
            {decision?.rejectionReason ? (
              <p className="dd-live-meeting-reject-reason">Reason: {decision.rejectionReason}</p>
            ) : null}
            <div className="dd-live-meeting-participants">
              <span className="dd-live-meetings-label">Participants</span>
              <ul>
                {meeting.participants.map((participant) => (
                  <li key={`${meeting.id}-${participant.role}-${participant.email}`}>
                    <span className="dd-live-participant-role">{participant.role}</span>
                    {participant.displayName}
                  </li>
                ))}
              </ul>
            </div>
            {canJoin &&
            (meeting.status === 'scheduled' || meeting.status === 'in_progress') ? (
              <button
                type="button"
                className="dd-btn dd-btn-outline dd-live-meeting-join"
                onClick={() => onJoinMeeting(getLiveMeetingViewId(meeting.id))}
              >
                Join meeting
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}