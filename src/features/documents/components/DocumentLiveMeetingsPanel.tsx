import { useEffect, useState } from 'react';
import { approvalMeetingsApi } from '../../../lib/api/approvalMeetings';
import type {
  ApprovalMeetingParticipant,
  ApprovalMeetingRecord,
  MeetingDecisionRecord,
} from '../../../types/approvalMeetings';
import { LiveMeetingJoinDialog } from '../../liveKit/components/LiveMeetingJoinDialog';
import './DocumentLiveMeetingsPanel.css';

type MeetingBundle = {
  meeting: ApprovalMeetingRecord;
  decision: MeetingDecisionRecord | null;
};

interface DocumentLiveMeetingsPanelProps {
  documentId: string;
  canJoin: boolean;
}

function JoinButtonSpinner() {
  return (
    <svg
      className="dd-join-btn-spinner"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.35" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function formatWhen(meeting: ApprovalMeetingRecord): string {
  try {
    const formatted = new Date(meeting.scheduledStartsAt).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: meeting.timezone,
    });
    return formatted;
  } catch {
    return meeting.scheduledStartsAt;
  }
}

function participantForRole(
  participants: ApprovalMeetingParticipant[],
  role: ApprovalMeetingParticipant['role'],
): string {
  return participants.find((p) => p.role === role)?.displayName ?? '—';
}

function statusLabel(status: ApprovalMeetingRecord['status']): string {
  switch (status) {
    case 'in_progress':
      return 'IN PROGRESS';
    case 'scheduled':
      return 'SCHEDULED';
    case 'completed':
      return 'COMPLETED';
    case 'cancelled':
      return 'CANCELLED';
  }
}

function LiveMeetingsSectionHeader() {
  return (
    <div className="dd-live-meetings-hero">
      <span className="dd-live-meetings-hero-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="14" height="14" rx="2" />
          <path d="M17 9l4-2v10l-4-2" />
        </svg>
      </span>
      <div className="dd-live-meetings-hero-text">
        <h3 className="dd-live-meetings-title">Daros Live meetings</h3>
        <p className="dd-live-meetings-intro">
          Scheduled live review sessions for this document. Meeting activity also appears in review history.
        </p>
      </div>
    </div>
  );
}

export function DocumentLiveMeetingsPanel({
  documentId,
  canJoin,
}: DocumentLiveMeetingsPanelProps) {
  const [bundles, setBundles] = useState<MeetingBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prepareJoinId, setPrepareJoinId] = useState<string | null>(null);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [joinDialog, setJoinDialog] = useState<{
    meetingId: string;
    meeting: ApprovalMeetingRecord;
  } | null>(null);

  const handlePrepareJoin = async (meeting: ApprovalMeetingRecord) => {
    setPrepareError(null);
    setPrepareJoinId(meeting.id);
    try {
      const bundle = await approvalMeetingsApi.getMeeting(meeting.id);
      if (!bundle.authorization.canAccess) {
        setPrepareError('You are not allowed to join this meeting.');
        return;
      }
      setJoinDialog({ meetingId: meeting.id, meeting: bundle.meeting });
    } catch (err) {
      setPrepareError(err instanceof Error ? err.message : 'Could not open meeting');
    } finally {
      setPrepareJoinId(null);
    }
  };

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
        <LiveMeetingsSectionHeader />
        <p className="dd-live-meetings-muted">Loading meeting history…</p>
      </section>
    );
  }

  if (error || bundles.length === 0) {
    return null;
  }

  return (
    <section className="dd-live-meetings" aria-label="Daros Live meetings">
      <LiveMeetingsSectionHeader />
      {prepareError ? (
        <p className="dd-live-meetings-muted dd-live-meetings-prepare-error" role="alert">
          {prepareError}
        </p>
      ) : null}
      <ul className="dd-live-meetings-list">
        {bundles.map(({ meeting, decision }) => {
          const decisionStatus = decision?.status ?? 'pending';
          const showJoin =
            canJoin && (meeting.status === 'scheduled' || meeting.status === 'in_progress');

          return (
            <li key={meeting.id} className="dd-live-meeting-card">
              <div className="dd-live-meeting-card-top">
                <h4 className="dd-live-meeting-name">{meeting.title?.trim() || 'Live review'}</h4>
                <span
                  className={`dd-live-meeting-status-pill dd-live-meeting-status-${meeting.status}`}
                >
                  <span className="dd-live-meeting-status-dot" aria-hidden="true" />
                  {statusLabel(meeting.status)}
                </span>
              </div>

              <div className="dd-live-meeting-meta-row">
                <span className="dd-live-meeting-meta">
                  <CalendarIcon />
                  {formatWhen(meeting)} ({meeting.timezone}) · v{meeting.documentVersion}
                </span>
              </div>

              <div className="dd-live-meeting-meta-row">
                <span className="dd-live-meeting-meta">
                  <ScalesIcon />
                  Decision: <strong>{decisionStatus}</strong>
                </span>
              </div>

              {decision?.rejectionReason ? (
                <p className="dd-live-meeting-reject-reason">Reason: {decision.rejectionReason}</p>
              ) : null}

              <div className="dd-live-meeting-participants-block">
                <div className="dd-live-meeting-participants-label">
                  <PeopleIcon />
                  <span>Participants</span>
                </div>
                <MeetingParticipantsGrid meeting={meeting} />
              </div>

              <div className="dd-live-meeting-actions">
                {showJoin ? (
                  <button
                    type="button"
                    className={`dd-live-meeting-join-btn${prepareJoinId === meeting.id ? ' is-loading' : ''}`}
                    disabled={prepareJoinId === meeting.id}
                    aria-busy={prepareJoinId === meeting.id}
                    onClick={() => void handlePrepareJoin(meeting)}
                  >
                    {prepareJoinId === meeting.id ? (
                      <JoinButtonSpinner />
                    ) : (
                      <span className="dd-live-meeting-join-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="5" width="14" height="14" rx="2" />
                          <path d="M17 9l4-2v10l-4-2" />
                        </svg>
                      </span>
                    )}
                    {prepareJoinId === meeting.id ? 'Opening…' : 'Join meeting'}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="dd-live-meeting-more-btn"
                  aria-label="More meeting options"
                  title="More options (coming soon)"
                  disabled
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="5" cy="12" r="1.75" />
                    <circle cx="12" cy="12" r="1.75" />
                    <circle cx="19" cy="12" r="1.75" />
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {joinDialog ? (
        <LiveMeetingJoinDialog
          meetingId={joinDialog.meetingId}
          initialMeeting={joinDialog.meeting}
          onClose={() => setJoinDialog(null)}
        />
      ) : null}
    </section>
  );
}

function MeetingParticipantsGrid({ meeting }: { meeting: ApprovalMeetingRecord }) {
  const roles = ['author', 'reviewer', 'approver'] as const;
  return (
    <div className="dd-live-meeting-participants-grid">
      {roles.map((role) => (
        <div key={role} className="dd-live-meeting-participant-col">
          <span className="dd-live-participant-role">{role}</span>
          <span className="dd-live-participant-name">{participantForRole(meeting.participants, role)}</span>
        </div>
      ))}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ScalesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3v18" />
      <path d="M5 7h14" />
      <path d="M6 7 3 13h6L6 7zM18 7l-3 6h6l-3-6z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M21 20v-1a3.5 3.5 0 0 0-2.5-3.36" />
    </svg>
  );
}