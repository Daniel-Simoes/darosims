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
      <Project className="dl-toolbar-group">
        <TrackToggle
          source={Track.Source.Microphone}
          className="dl-control-btn"
          aria-label="Toggle microphone"
        >
          <ControlIcon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" />
            </svg>
          </ControlIcon>
          <span className="dl-control-label">Mic</span>
        </TrackToggle>

        <TrackToggle source={Track.Source.Camera} className="dl-control-btn" aria-label="Toggle camera">
          <ControlIcon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m16 13 5.2 3.5a1 1 0 0 0 1.5-.86V8.36a1 1 0 0 0-1.5-.86L16 11" />
              <rect x="2" y="6" width="14" height="12" rx="2" />
            </svg>
          </ControlIcon>
          <span className="dl-control-label">Camera</span>
        </TrackToggle>

        <TrackToggle
          source={Track.Source.ScreenShare}
          captureOptions={{ audio: false }}
          className="dl-control-btn"
          aria-label="Toggle screen sharing"
        >
          <ControlIcon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </ControlIcon>
          <span className="dl-control-label">Share</span>
        </TrackToggle>
      </Project>

      <button type="button" className="dl-control-btn dl-control-leave" onClick={handleLeave}>
        <ControlIcon>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </ControlIcon>
        <span className="dl-control-label">Leave</span>
      </button>
    </footer>
  );
}

function Project({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={className}>{children}</div>;
}