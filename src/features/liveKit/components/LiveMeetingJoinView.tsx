import { LiveMeetingJoinDialog } from './LiveMeetingJoinDialog';

interface LiveMeetingJoinViewProps {
  meetingId: string;
  onLeave: () => void;
}

/** Full-area host for join flow (e.g. notification deep link). Renders join dialog + meeting viewport. */
export function LiveMeetingJoinView({ meetingId, onLeave }: LiveMeetingJoinViewProps) {
  return <LiveMeetingJoinDialog meetingId={meetingId} onClose={onLeave} />;
}