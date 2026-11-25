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

  return (
    <div className="dl-participant-row">
      <div className="dl-participant-tile-wrap">
        <ParticipantVideo participant={participant} />
      </div>
      <div className="dl-participant-meta">
        <span className="dl-participant-name">{participant.name || participant.identity}</span>
        <span className="dl-participant-role">{roleLabel}</span>
        <span className="dl-participant-connection">{connection}</span>
        <ConnectionQualityIndicator participant={participant} className="dl-connection-quality" />
      </div>
    </div>
  );
}

export function DarosLiveMeetingParticipantsSidebar() {
  const participants = useParticipants();
  const roomState = useConnectionState();

  return (
    <aside className="dl-participants-sidebar" aria-label="Participants">
      <div className="dl-participants-head">
        <h2 className="dl-participants-title">Participants</h2>
        <span className="dl-participants-count">{participants.length}</span>
      </div>
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