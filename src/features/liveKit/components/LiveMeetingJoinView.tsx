import { useEffect, useState } from 'react';
import { approvalMeetingsApi } from '../../../lib/api/approvalMeetings';
import type { ApprovalMeetingRecord } from '../../../types/approvalMeetings';
import { useLiveKitMeetingSession } from '../hooks/useLiveKitMeetingSession';
import { DarosLiveMeetingViewport } from './DarosLiveMeetingViewport';
import '../liveKit.css';

interface LiveMeetingJoinViewProps {
  meetingId: string;
  onLeave: () => void;
}

export function LiveMeetingJoinView({ meetingId, onLeave }: LiveMeetingJoinViewProps) {
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [meetingMeta, setMeetingMeta] = useState<ApprovalMeetingRecord | null>(null);

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
    let active = true;
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
  }, [meetingId]);

  const handleJoin = () => {
    void joinMeeting(meetingId);
  };

  const handleLeave = () => {
    leaveMeeting();
    onLeave();
  };

  if (phase === 'connected' && credentials && meeting) {
    return (
      <DarosLiveMeetingViewport
        serverUrl={credentials.serverUrl}
        token={credentials.token}
        meeting={meeting}
        onLeave={handleLeave}
        onDisconnected={(reason) => {
          handleRoomDisconnected(reason);
          if (reason === undefined) onLeave();
        }}
        onError={() => undefined}
      />
    );
  }

  return (
    <div className="dl-join-page">
      <h1 className="dl-join-title">Daros Live meeting</h1>
      {loadingMeta ? <p className="dl-join-message">Loading meeting…</p> : null}
      {metaError ? <p className="livekit-alert livekit-alert-error">{metaError}</p> : null}
      {!loadingMeta && !metaError && meetingMeta ? (
        <>
          <p className="dl-join-message">
            <strong>{meetingMeta.title ?? 'Live review'}</strong>
            <br />
            Scheduled {new Date(meetingMeta.scheduledStartsAt).toLocaleString()} (
            {meetingMeta.timezone})
          </p>
          <div className="livekit-test-actions">
            <button
              type="button"
              className="livekit-btn livekit-btn-primary"
              disabled={phase === 'connecting' || phase === 'reconnecting'}
              onClick={handleJoin}
            >
              {phase === 'connecting' ? 'Connecting…' : 'Join meeting'}
            </button>
            <button type="button" className="livekit-btn livekit-btn-outline" onClick={onLeave}>
              Back
            </button>
            {disconnectReason ? (
              <button type="button" className="livekit-btn livekit-btn-primary" onClick={() => void reconnect()}>
                Reconnect
              </button>
            ) : null}
          </div>
        </>
      ) : null}
      {error ? <p className="livekit-alert livekit-alert-error">{error}</p> : null}
      {disconnectReason ? <p className="livekit-alert livekit-alert-warn">{disconnectReason}</p> : null}
    </div>
  );
}