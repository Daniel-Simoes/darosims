import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { approvalMeetingsApi } from '../../../lib/api/approvalMeetings';
import type { ApprovalMeetingRecord } from '../../../types/approvalMeetings';
import { useLiveKitMeetingSession } from '../hooks/useLiveKitMeetingSession';
import { DarosLiveMeetingViewport } from './DarosLiveMeetingViewport';
import './LiveMeetingJoinDialog.css';

function formatWhen(meeting: ApprovalMeetingRecord): string {
  try {
    return new Date(meeting.scheduledStartsAt).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: meeting.timezone,
    });
  } catch {
    return meeting.scheduledStartsAt;
  }
}

function DialogButtonSpinner() {
  return (
    <svg
      className="dl-join-dialog-btn-spinner"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export interface LiveMeetingJoinDialogProps {
  meetingId: string;
  onClose: () => void;
  /** When set (e.g. after prefetch from document panel), skip meta loading in the dialog. */
  initialMeeting?: ApprovalMeetingRecord | null;
}

export function LiveMeetingJoinDialog({ meetingId, onClose, initialMeeting }: LiveMeetingJoinDialogProps) {
  const [loadingMeta, setLoadingMeta] = useState(!initialMeeting);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [meetingMeta, setMeetingMeta] = useState<ApprovalMeetingRecord | null>(initialMeeting ?? null);

  const {
    phase,
    credentials,
    meeting,
    error,
    disconnectReason,
    joinMeeting,
    leaveMeeting,
    reconnect,
    handleRoomDisconnected,
  } = useLiveKitMeetingSession();

  useEffect(() => {
    if (initialMeeting) {
      setMeetingMeta(initialMeeting);
      setLoadingMeta(false);
      return undefined;
    }

    let active = true;
    setLoadingMeta(true);
    setMetaError(null);
    void approvalMeetingsApi
      .getMeeting(meetingId)
      .then((bundle) => {
        if (!active) return;
        if (!bundle.authorization.canAccess) {
          setMetaError('You are not allowed to join this meeting.');
          return;
        }
        setMeetingMeta(bundle.meeting);
      })
      .catch((err) => {
        if (active) {
          setMetaError(err instanceof Error ? err.message : 'Could not load meeting');
        }
      })
      .finally(() => {
        if (active) setLoadingMeta(false);
      });
    return () => {
      active = false;
    };
  }, [meetingId, initialMeeting]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleJoin = () => {
    void joinMeeting(meetingId);
  };

  const handleClose = () => {
    leaveMeeting();
    onClose();
  };

  const handleLeave = () => {
    leaveMeeting();
    onClose();
  };

  const isConnecting = phase === 'connecting' || phase === 'reconnecting';

  if (phase === 'connected' && credentials && meeting) {
    return (
      <DarosLiveMeetingViewport
        serverUrl={credentials.serverUrl}
        token={credentials.token}
        meeting={meeting}
        onLeave={handleLeave}
        onDisconnected={(reason) => {
          handleRoomDisconnected(reason);
          if (reason === undefined) onClose();
        }}
        onError={() => undefined}
      />
    );
  }

  return createPortal(
    <div className="dl-join-dialog-overlay" role="presentation" onClick={handleClose}>
      <div
        className="dl-join-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dl-join-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="dl-join-dialog-title" className="dl-join-dialog-title">
          Daros Live meeting
        </h2>

        {loadingMeta ? (
          <p className="dl-join-dialog-message">
            <span className="dl-join-dialog-inline-loading">
              <DialogButtonSpinner />
              Loading meeting…
            </span>
          </p>
        ) : null}

        {metaError ? <p className="dl-join-dialog-error">{metaError}</p> : null}

        {!loadingMeta && !metaError && meetingMeta ? (
          <>
            <p className="dl-join-dialog-meeting-name">{meetingMeta.title?.trim() || 'Live review'}</p>
            <p className="dl-join-dialog-schedule">
              <span className="dl-join-dialog-schedule-label">Scheduled</span>
              {formatWhen(meetingMeta)}
              <span className="dl-join-dialog-timezone">({meetingMeta.timezone})</span>
            </p>
            <div className="dl-join-dialog-actions">
              <button
                type="button"
                className="dl-join-dialog-btn dl-join-dialog-btn-primary"
                disabled={isConnecting}
                onClick={handleJoin}
              >
                {isConnecting ? (
                  <>
                    <DialogButtonSpinner />
                    Connecting…
                  </>
                ) : (
                  'Join meeting'
                )}
              </button>
              <button
                type="button"
                className="dl-join-dialog-btn dl-join-dialog-btn-outline"
                disabled={isConnecting}
                onClick={handleClose}
              >
                Back
              </button>
              {disconnectReason ? (
                <button
                  type="button"
                  className="dl-join-dialog-btn dl-join-dialog-btn-primary"
                  onClick={() => void reconnect()}
                >
                  Reconnect
                </button>
              ) : null}
            </div>
          </>
        ) : null}

        {error ? <p className="dl-join-dialog-error">{error}</p> : null}
        {disconnectReason ? <p className="dl-join-dialog-warn">{disconnectReason}</p> : null}
      </div>
    </div>,
    document.body,
  );
}