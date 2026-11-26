import { useCallback } from 'react';
import { ConnectionStateToast, RoomAudioRenderer, useConnectionState } from '@livekit/components-react';
import type { ApprovalMeetingRecord } from '../../../types/approvalMeetings';
import { useMeetingDocumentPreview } from '../hooks/useMeetingDocumentPreview';
import { DarosLiveMeetingControls } from './DarosLiveMeetingControls';
import { DarosLiveMeetingDecisionBar } from './DarosLiveMeetingDecisionBar';
import { useLiveMeetingDecisionState } from '../hooks/useLiveMeetingDecisionState';
import { useLiveMeetingDocumentSession } from '../hooks/useLiveMeetingDocumentSession';
import { LiveMeetingCollaborativeDocumentPane } from './LiveMeetingCollaborativeDocumentPane';
import { DarosLiveMeetingHeader } from './DarosLiveMeetingHeader';
import { DarosLiveMeetingParticipantsSidebar } from './DarosLiveMeetingParticipantsSidebar';
import '../darosLiveMeeting.css';

interface DarosLiveMeetingInnerProps {
  meeting: ApprovalMeetingRecord;
  onLeave: () => void;
}

function formatConnectionState(state: string): string {
  switch (state) {
    case 'connected':
      return 'Connected';
    case 'connecting':
      return 'Connecting…';
    case 'reconnecting':
      return 'Reconnecting…';
    case 'disconnected':
      return 'Disconnected';
    default:
      return state;
  }
}

export function DarosLiveMeetingInner({ meeting, onLeave }: DarosLiveMeetingInnerProps) {
  const connectionState = useConnectionState();
  const { document: docRecord, fileUrl, loading, error } = useMeetingDocumentPreview(meeting.documentId);
  const decisionState = useLiveMeetingDecisionState(meeting.id);
  const documentSession = useLiveMeetingDocumentSession(meeting, docRecord, fileUrl);
  const isHost = Boolean(
    documentSession.syncEnabled && documentSession.canControl && decisionState.role === 'author',
  );

  const toggleFullscreen = useCallback(() => {
    const root = window.document.querySelector('.dl-meeting-viewport');
    if (!root || !(root instanceof HTMLElement)) return;
    if (window.document.fullscreenElement) {
      void window.document.exitFullscreen();
      return;
    }
    void root.requestFullscreen?.();
  }, []);

  return (
    <div className="dl-meeting-layout">
      <DarosLiveMeetingHeader
        document={docRecord}
        connectionState={formatConnectionState(connectionState)}
        onToggleFullscreen={toggleFullscreen}
        isHost={isHost}
        workflowSlot={
          <DarosLiveMeetingDecisionBar
            variant="header"
            statusLabel={decisionState.statusLabel}
            loading={decisionState.loading}
            actionBusy={decisionState.actionBusy}
            error={decisionState.error}
            canApproveReview={decisionState.canApproveReview}
            canRejectReview={decisionState.canRejectReview}
            canApproveDocument={decisionState.canApproveDocument}
            canRejectDocument={decisionState.canRejectDocument}
            showAuthorDocument={decisionState.showAuthorDocument}
            canFinishCycle={decisionState.canFinishCycle}
            onApproveReview={decisionState.runReview}
            onRejectReview={decisionState.runRejectReview}
            onApproveDocument={decisionState.runApprove}
            onRejectDocument={decisionState.runReject}
            onAuthorDocument={decisionState.focusDocumentPane}
            onFinishCycle={decisionState.runFinishCycle}
          />
        }
      />

      <div className="dl-meeting-main">
        <LiveMeetingCollaborativeDocumentPane
          meeting={meeting}
          document={docRecord}
          fileUrl={fileUrl}
          loading={loading}
          error={error}
          documentSession={documentSession}
        />
        <DarosLiveMeetingParticipantsSidebar />
      </div>

      <DarosLiveMeetingControls onLeave={onLeave} />
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}