import { ConnectionStateToast, RoomAudioRenderer, useConnectionState } from '@livekit/components-react';
import type { ApprovalMeetingRecord } from '../../../types/approvalMeetings';
import { useMeetingDocumentPreview } from '../hooks/useMeetingDocumentPreview';
import { DarosLiveMeetingControls } from './DarosLiveMeetingControls';
import { DarosLiveMeetingDecisionBar } from './DarosLiveMeetingDecisionBar';
import { useLiveMeetingDecisionState } from '../hooks/useLiveMeetingDecisionState';
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
  const { document, fileUrl, loading, error } = useMeetingDocumentPreview(meeting.documentId);
  const decisionState = useLiveMeetingDecisionState(meeting.id);

  return (
  <div className="dl-meeting-layout">
    <DarosLiveMeetingHeader
      meeting={meeting}
      documentTitle={document?.title ?? 'Document'}
      connectionState={formatConnectionState(connectionState)}
    />

    <div className="dl-meeting-main">
      <LiveMeetingCollaborativeDocumentPane
        meeting={meeting}
        document={document}
        fileUrl={fileUrl}
        loading={loading}
        error={error}
      />
      <DarosLiveMeetingParticipantsSidebar />
    </div>

    <DarosLiveMeetingDecisionBar
      statusLabel={decisionState.statusLabel}
      loading={decisionState.loading}
      actionBusy={decisionState.actionBusy}
      error={decisionState.error}
      canMarkReviewed={decisionState.canMarkReviewed}
      canApprove={decisionState.canApprove}
      canReject={decisionState.canReject}
      onMarkReviewed={decisionState.runReview}
      onApprove={decisionState.runApprove}
      onReject={decisionState.runReject}
    />

    <DarosLiveMeetingControls onLeave={onLeave} />
    <RoomAudioRenderer />
    <ConnectionStateToast />
  </div>
  );
}