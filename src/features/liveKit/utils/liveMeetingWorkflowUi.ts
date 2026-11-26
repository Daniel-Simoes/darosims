import type { Participant } from 'livekit-client';
import type {
  ApprovalMeetingParticipantRole,
  MeetingDecisionRecord,
} from '../../../types/approvalMeetings';
import { parseLiveKitParticipantMetadata } from './participantRole';

export const LIVE_WORKFLOW_ROLES: ApprovalMeetingParticipantRole[] = ['author', 'reviewer', 'approver'];

const ROLE_WAITING_LABEL: Record<ApprovalMeetingParticipantRole, string> = {
  author: 'creator',
  reviewer: 'reviewer',
  approver: 'approver',
};

export function getConnectedWorkflowRoles(
  participants: Participant[],
): Set<ApprovalMeetingParticipantRole> {
  const roles = new Set<ApprovalMeetingParticipantRole>();
  for (const participant of participants) {
    const { role } = parseLiveKitParticipantMetadata(participant.metadata);
    if (role && LIVE_WORKFLOW_ROLES.includes(role)) {
      roles.add(role);
    }
  }
  return roles;
}

export function missingWorkflowRoles(connected: Set<ApprovalMeetingParticipantRole>): ApprovalMeetingParticipantRole[] {
  return LIVE_WORKFLOW_ROLES.filter((role) => !connected.has(role));
}

export function formatWaitingParticipantsLabel(missing: ApprovalMeetingParticipantRole[]): string {
  if (missing.length === 0) return '';
  const labels = missing.map((role) => ROLE_WAITING_LABEL[role]);
  if (labels.length === 1) return `Waiting ${labels[0]}`;
  if (labels.length === 2) return `Waiting ${labels[0]} and ${labels[1]}`;
  return 'Waiting creator, reviewer and approver';
}

export function buildLiveWorkflowStatusLabel(options: {
  loading: boolean;
  decision: MeetingDecisionRecord | null | undefined;
  allPresent: boolean;
  missing: ApprovalMeetingParticipantRole[];
}): string {
  const { loading, decision, allPresent, missing } = options;
  if (loading) return 'Loading…';
  if (!allPresent) {
    return formatWaitingParticipantsLabel(missing);
  }

  switch (decision?.status) {
    case 'pending':
      return 'Ready for live review';
    case 'reviewed':
      return 'Review approved';
    case 'approved':
      return 'Review approved · Document approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Workflow';
  }
}