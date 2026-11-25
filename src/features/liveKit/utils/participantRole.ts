import type { ApprovalMeetingParticipantRole } from '../../../types/approvalMeetings';

const ROLE_LABEL: Record<ApprovalMeetingParticipantRole, string> = {
  author: 'Author',
  reviewer: 'Reviewer',
  approver: 'Approver',
};

export function formatParticipantRole(role: string | undefined): string {
  if (!role) return 'Participant';
  if (role in ROLE_LABEL) return ROLE_LABEL[role as ApprovalMeetingParticipantRole];
  return role;
}

export function parseLiveKitParticipantMetadata(
  metadata: string | undefined,
): { role?: ApprovalMeetingParticipantRole } {
  if (!metadata?.trim()) return {};
  try {
    const parsed = JSON.parse(metadata) as { role?: ApprovalMeetingParticipantRole };
    return { role: parsed.role };
  } catch {
    return {};
  }
}