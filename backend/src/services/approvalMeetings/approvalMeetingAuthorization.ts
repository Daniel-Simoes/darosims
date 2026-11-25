import {
  getDesignatedApprover,
  isAuthUserDesignatedApprover,
  resolveDesignatedApproverEmail,
} from '@/lib/documentApproval';
import {
  isAuthUserDocumentOwner,
  resolveDocumentOwnerEmail,
} from '@/lib/documentOwnership';
import { normalizeTeamEmail } from '@/lib/legacyEmails';
import { findUserByEmail } from '@/repositories/users/userRepository';
import type {
  ApprovalMeetingParticipant,
  ApprovalMeetingParticipantRole,
  ApprovalMeetingRecord,
  DocumentRecord,
} from '@/types';

export async function resolveReviewerApproverEmails(
  document: Pick<DocumentRecord, 'owner' | 'approver'>,
): Promise<{ reviewerEmail: string; approverEmail: string }> {
  const reviewerEmail = await resolveDocumentOwnerEmail(document.owner);
  const approverEmail = await resolveDesignatedApproverEmail(document);

  if (!reviewerEmail) {
    throw new Error('Document reviewer (owner) could not be resolved');
  }
  if (!approverEmail) {
    throw new Error('Document approver could not be resolved');
  }

  return {
    reviewerEmail: normalizeTeamEmail(reviewerEmail) ?? reviewerEmail,
    approverEmail: normalizeTeamEmail(approverEmail) ?? approverEmail,
  };
}

export async function buildMeetingParticipants(
  document: Pick<DocumentRecord, 'owner' | 'approver' | 'createdBy'>,
  roles: { reviewerEmail: string; approverEmail: string },
): Promise<ApprovalMeetingParticipant[]> {
  const authorEmail = normalizeTeamEmail(document.createdBy) ?? document.createdBy.trim().toLowerCase();
  const authorUser = await findUserByEmail(authorEmail);

  const reviewerUser = await findUserByEmail(roles.reviewerEmail);
  const approverUser = await findUserByEmail(roles.approverEmail);

  return [
    {
      role: 'author',
      email: authorEmail,
      displayName: authorUser?.name ?? authorEmail,
    },
    {
      role: 'reviewer',
      email: roles.reviewerEmail,
      displayName: reviewerUser?.name ?? document.owner?.trim() ?? roles.reviewerEmail,
    },
    {
      role: 'approver',
      email: roles.approverEmail,
      displayName:
        approverUser?.name ?? getDesignatedApprover(document) ?? roles.approverEmail,
    },
  ];
}

export async function getAuthUserMeetingRole(
  userEmail: string,
  meeting: ApprovalMeetingRecord,
): Promise<ApprovalMeetingParticipantRole | null> {
  const normalized = normalizeTeamEmail(userEmail) ?? userEmail.trim().toLowerCase();
  const participant = meeting.participants.find(
    (entry) => (normalizeTeamEmail(entry.email) ?? entry.email.toLowerCase()) === normalized,
  );
  return participant?.role ?? null;
}

export async function canAuthUserAccessApprovalMeeting(
  userEmail: string,
  meeting: ApprovalMeetingRecord,
): Promise<boolean> {
  return (await getAuthUserMeetingRole(userEmail, meeting)) !== null;
}

/** Server-side role validation against the live document (not only snapshot). */
export async function assertUserIsDocumentReviewer(
  userEmail: string,
  document: Pick<DocumentRecord, 'owner'>,
): Promise<void> {
  if (!(await isAuthUserDocumentOwner(userEmail, document.owner))) {
    throw new Error('Only the assigned reviewer can act in this live approval meeting');
  }
}

export async function assertUserIsDocumentApprover(
  userEmail: string,
  document: Pick<DocumentRecord, 'owner' | 'approver' | 'approvedBy'>,
): Promise<void> {
  if (!(await isAuthUserDesignatedApprover(userEmail, document))) {
    throw new Error('Only the designated approver can act in this live approval meeting');
  }
}