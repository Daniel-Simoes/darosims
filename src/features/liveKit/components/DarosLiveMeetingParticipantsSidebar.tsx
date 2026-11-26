import {
  ConnectionQualityIndicator,
  useConnectionState,
  useParticipants,
  useTracks,
  VideoTrack,
} from '@livekit/components-react';
import type { Participant } from 'livekit-client';
import { Track } from 'livekit-client';
import { formatParticipantRole, parseLiveKitParticipantMetadata } from '../utils/participantRole';

function participantConnectionLabel(participant: Participant, roomState: string): string {
  if (roomState === 'reconnecting') return 'Reconnecting…';
  if (participant.connectionQuality === 'lost') return 'Poor connection';
  return 'Connected';
}

function ParticipantVideo({ participant }: { participant: Participant }) {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: false });
  const activeTrack = tracks.find(
    (ref) =>
      ref.participant.identity === participant.identity &&
      ref.publication &&
      !ref.publication.isMuted &&
      ref.publication.kind === Track.Kind.Video,
  );

  if (!activeTrack) {
    return (
      <div className="dl-participant-placeholder" aria-hidden="true">
        <span>{(participant.name || participant.identity).slice(0, 1).toUpperCase()}</span>
      </div>
    );
  }

  return <VideoTrack trackRef={activeTrack} className="dl-participant-video" />;
}

function ParticipantRow({ participant, roomState }: { participant: Participant; roomState: string }) {
  const meta = parseLiveKitParticipantMetadata(participant.metadata);
  const roleLabel = formatParticipantRole(meta.role);
  const connection = participantConnectionLabel(participant, roomState);
  const displayName = participant.name || participant.identity;
  const micOff = !participant.isMicrophoneEnabled;

  return (
    <div className="dl-participant-row">
      <div className="dl-participant-tile-wrap">
        <ParticipantVideo participant={participant} />
        <div className="dl-participant-overlay">
          <span className="dl-participant-overlay-name">
            <span className="dl-participant-overlay-dot" aria-hidden="true" />
            {displayName}
          </span>
          <div className="dl-participant-overlay-icons">
            {micOff ? (
              <span className="dl-participant-overlay-icon" title="Microphone off" aria-label="Microphone off">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2M12 18v4M8 22h8" />
                </svg>
              </span>
            ) : null}
            <ConnectionQualityIndicator participant={participant} className="dl-connection-quality" />
          </div>
        </div>
        <span className="dl-participant-sr-only">
          {roleLabel} · {connection}
        </span>
      </div>
    </div>
  );
}

export function DarosLiveMeetingParticipantsSidebar() {
  const participants = useParticipants();
  const roomState = useConnectionState();

  return (
    <aside className="dl-participants-sidebar" aria-label="Participants">
      <div className="dl-participants-list">
        {participants.map((participant) => (
          <ParticipantRow key={participant.identity} participant={participant} roomState={roomState} />
        ))}
      </div>
      {participants.length === 0 ? (
        <p className="dl-participants-empty">Waiting for participants to join…</p>
      ) : null}
    </aside>
  );
}