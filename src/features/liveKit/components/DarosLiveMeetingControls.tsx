import { Track } from 'livekit-client';
import { TrackToggle, useRoomContext } from '@livekit/components-react';

import type { ReactNode } from 'react';

interface DarosLiveMeetingControlsProps {
  onLeave: () => void;
}

function ControlIcon({ children }: { children: ReactNode }) {
  return <span className="dl-control-icon" aria-hidden="true">{children}</span>;
}

export function DarosLiveMeetingControls({ onLeave }: DarosLiveMeetingControlsProps) {
  const room = useRoomContext();

  const handleLeave = () => {
    void room.disconnect();
    onLeave();
  };

  return (
    <footer className="dl-meeting-toolbar" role="toolbar" aria-label="Meeting controls">
      <div className="dl-toolbar-dock">
        <TrackToggle
          source={Track.Source.Microphone}
          className="dl-control-btn dl-control-btn-round"
          aria-label="Toggle microphone"
        >
          <ControlIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" />
            </svg>
          </ControlIcon>
        </TrackToggle>

        <TrackToggle
          source={Track.Source.Camera}
          className="dl-control-btn dl-control-btn-round"
          aria-label="Toggle camera"
        >
          <ControlIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m16 13 5.2 3.5a1 1 0 0 0 1.5-.86V8.36a1 1 0 0 0-1.5-.86L16 11" />
              <rect x="2" y="6" width="14" height="12" rx="2" />
            </svg>
          </ControlIcon>
        </TrackToggle>

        <TrackToggle
          source={Track.Source.ScreenShare}
          captureOptions={{ audio: false }}
          className="dl-control-btn dl-control-btn-round"
          aria-label="Toggle screen sharing"
        >
          <ControlIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </ControlIcon>
        </TrackToggle>

        <button type="button" className="dl-control-btn dl-control-btn-round dl-control-leave" onClick={handleLeave} aria-label="Leave meeting">
          <ControlIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
              <line x1="23" y1="1" x2="1" y2="23" />
            </svg>
          </ControlIcon>
        </button>
      </div>
    </footer>
  );
}