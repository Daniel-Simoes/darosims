import { useState } from 'react';
import { approvalMeetingsApi } from '../../../lib/api/approvalMeetings';
import { useLiveKitMeetingSession } from '../hooks/useLiveKitMeetingSession';
import { DarosLiveMeetingViewport } from './DarosLiveMeetingViewport';
import '../liveKit.css';

/**
 * Phase 2 harness: author, reviewer, and approver join the same meeting id
 * (three browser sessions / users) to verify LiveKit A/V and screen share.
 */
export function LiveKitMeetingTestJoin() {
  const [meetingId, setMeetingId] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
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

  const busy = phase === 'connecting' || phase === 'reconnecting';

  const handleJoin = async () => {
    if (!meetingId.trim()) return;
    setStatusMessage(null);
    await joinMeeting(meetingId.trim());
  };

  const handleStartMeeting = async () => {
    if (!meetingId.trim()) return;
    setStatusMessage(null);
    try {
      await approvalMeetingsApi.startMeeting(meetingId.trim());
      setStatusMessage('Meeting marked in progress on the server.');
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Could not start meeting');
    }
  };

  if (phase === 'connected' && credentials && meeting) {
    return (
      <>
        <p className="livekit-test-hint">Meeting open — use the full-screen Daros Live workspace.</p>
        <DarosLiveMeetingViewport
          serverUrl={credentials.serverUrl}
          token={credentials.token}
          meeting={meeting}
          onLeave={leaveMeeting}
          onDisconnected={handleRoomDisconnected}
          onError={(message) => setStatusMessage(message)}
        />
      </>
    );
  }

  return (
    <div className="livekit-test-join">
      <p className="livekit-test-hint">
        Test with three participants: log in as the document <strong>author</strong>,{' '}
        <strong>reviewer</strong> (owner), and <strong>approver</strong>. Use the same meeting id in
        each session. The host should start the meeting before others join. Camera, microphone, and
        screen share are enabled via LiveKit.
      </p>

      <div className="livekit-test-field">
        <label htmlFor="livekit-meeting-id">Approval meeting id</label>
        <input
          id="livekit-meeting-id"
          value={meetingId}
          onChange={(event) => setMeetingId(event.target.value)}
          placeholder="Paste meeting UUID from POST /api/approval-meetings"
          disabled={busy}
        />
      </div>

      <div className="livekit-test-actions">
        <button
          type="button"
          className="livekit-btn livekit-btn-outline"
          onClick={() => void handleStartMeeting()}
          disabled={!meetingId.trim() || busy}
        >
          Start meeting (host)
        </button>
        <button
          type="button"
          className="livekit-btn livekit-btn-primary"
          onClick={() => void handleJoin()}
          disabled={!meetingId.trim() || busy}
        >
          {busy ? 'Connecting…' : 'Join with LiveKit'}
        </button>
        {disconnectReason ? (
          <button
            type="button"
            className="livekit-btn livekit-btn-primary"
            onClick={() => void reconnect()}
            disabled={busy}
          >
            Reconnect
          </button>
        ) : null}
      </div>

      {statusMessage ? <div className="livekit-alert livekit-alert-warn">{statusMessage}</div> : null}
      {error ? <div className="livekit-alert livekit-alert-error">{error}</div> : null}
      {disconnectReason ? (
        <div className="livekit-alert livekit-alert-warn">{disconnectReason}</div>
      ) : null}
    </div>
  );
}