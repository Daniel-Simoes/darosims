import { createPortal } from 'react-dom';
import { LiveKitRoom } from '@livekit/components-react';
import type { DisconnectReason } from 'livekit-client';
import type { ApprovalMeetingRecord } from '../../../types/approvalMeetings';
import { DarosLiveMeetingInner } from './DarosLiveMeetingInner';
import '@livekit/components-styles';
import '../darosLiveMeeting.css';

interface DarosLiveMeetingViewportProps {
  serverUrl: string;
  token: string;
  meeting: ApprovalMeetingRecord;
  onLeave: () => void;
  onDisconnected: (reason?: DisconnectReason) => void;
  onError: (message: string) => void;
}

export function DarosLiveMeetingViewport({
  serverUrl,
  token,
  meeting,
  onLeave,
  onDisconnected,
  onError,
}: DarosLiveMeetingViewportProps) {
  return createPortal(
    <div className="dl-meeting-viewport" role="dialog" aria-modal="true" aria-label="Daros Live meeting">
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect
        audio
        video
        data-lk-theme="default"
        className="dl-livekit-room"
        onDisconnected={onDisconnected}
        onError={(error) => onError(error.message)}
      >
        <DarosLiveMeetingInner meeting={meeting} onLeave={onLeave} />
      </LiveKitRoom>
    </div>,
    document.body,
  );
}