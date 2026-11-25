import {
  findApprovalMeetingById,
  saveApprovalMeetingRecord,
} from '@/repositories/approvalMeetings/approvalMeetingRepository';
import {
  findMeetingDecisionByMeetingId,
  transitionMeetingDecisionRecord,
} from '@/repositories/approvalMeetings/meetingDecisionRepository';
import { buildDocumentContentFingerprint } from '@/lib/approvalMeetings/documentContentFingerprint';
import {
  getDocumentById,
  markDocumentReviewed,
  rejectDocumentForApproval,
  submitDocumentForApproval,
  updateDocument,
} from '@/lib/documents';
import { resolveDesignatedApproverEmail } from '@/lib/documentApproval';
import { createDocumentEvent } from '@/lib/documentEvents';
import { createNotification } from '@/lib/notifications';
import { normalizeTeamEmail } from '@/lib/legacyEmails';
import {
  isSelfServiceDocumentWorkflow,
  shouldNotifyUser,
} from '@/lib/documentWorkflowNotifications';
import { finalizeDocumentApproval } from '@/services/documents/finalizeDocumentApproval';
import type {
  ApprovalMeetingRecord,
  DocumentRecord,
  MeetingDecisionRecord,
} from '@/types';
import {
  assertUserIsDocumentApprover,
  assertUserIsDocumentReviewer,
  canAuthUserAccessApprovalMeeting,
} from './approvalMeetingAuthorization';
import { transitionMeetingStatus } from './approvalMeetingService';

type AuthActor = { email: string; name: string };

function normalizedEmail(email: string) {
  return normalizeTeamEmail(email) ?? email.trim().toLowerCase();
}

function assertMeetingActive(meeting: ApprovalMeetingRecord) {
  if (meeting.status !== 'in_progress') {
    throw new Error('Meeting must be in progress to record live approval decisions');
  }
}

function assertDocumentBinding(meeting: ApprovalMeetingRecord, document: DocumentRecord) {
  const version = Number(document.version);
  const safeVersion = Number.isFinite(version) ? version : 1;
  if (safeVersion !== meeting.documentVersion) {
    throw new Error(
      `Document version changed (expected ${meeting.documentVersion}, current ${safeVersion})`,
    );
  }
  const fingerprint = buildDocumentContentFingerprint(document);
  if (fingerprint !== meeting.contentFingerprint) {
    throw new Error('Document content changed since this meeting was scheduled');
  }
}

async function loadMeetingContext(
  meetingId: string,
  auth: AuthActor,
): Promise<{ meeting: ApprovalMeetingRecord; decision: MeetingDecisionRecord; document: DocumentRecord }> {
  const meeting = await findApprovalMeetingById(meetingId);
  if (!meeting) {
    throw new Error('Meeting not found');
  }
  if (!(await canAuthUserAccessApprovalMeeting(auth.email, meeting))) {
    throw new Error('You are not allowed to access this meeting');
  }

  const decision = await findMeetingDecisionByMeetingId(meetingId);
  if (!decision) {
    throw new Error('Meeting decision not found');
  }

  const document = await getDocumentById(meeting.documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  assertMeetingActive(meeting);
  assertDocumentBinding(meeting, document);

  return { meeting, decision, document };
}

async function ensureDocumentSubmittedForLive(document: DocumentRecord, submitterEmail: string) {
  if (document.submittedAt) {
    return document;
  }
  if (document.approvalWorkflow !== 'live') {
    throw new Error('Document must be submitted for review before live decisions');
  }
  return submitDocumentForApproval(document.id, submitterEmail);
}

async function completeMeetingAfterTerminalDecision(meeting: ApprovalMeetingRecord) {
  if (meeting.status === 'completed' || meeting.status === 'cancelled') {
    return meeting;
  }
  const updated = transitionMeetingStatus(meeting, 'completed');
  await saveApprovalMeetingRecord(updated);
  await updateDocument(meeting.documentId, { activeApprovalMeetingId: undefined });
  return updated;
}

export async function recordLiveMeetingReview(
  meetingId: string,
  auth: AuthActor,
): Promise<{ meeting: ApprovalMeetingRecord; decision: MeetingDecisionRecord; document: DocumentRecord }> {
  const { meeting, document } = await loadMeetingContext(meetingId, auth);
  await assertUserIsDocumentReviewer(auth.email, document);

  const reviewerEmail = normalizedEmail(auth.email);
  if (normalizedEmail(document.owner) !== reviewerEmail) {
    const decision = await findMeetingDecisionByMeetingId(meetingId);
    if (decision && normalizedEmail(decision.reviewerEmail) !== reviewerEmail) {
      throw new Error('Only the assigned reviewer for this meeting can mark the document as reviewed');
    }
  }

  let workingDoc = await ensureDocumentSubmittedForLive(document, meeting.createdBy);
  workingDoc = await markDocumentReviewed(workingDoc.id, auth.email);

  const approverEmail = await resolveDesignatedApproverEmail(workingDoc);
  const decision = await transitionMeetingDecisionRecord(meetingId, 'pending', (current) => ({
    ...current,
    status: 'reviewed',
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerEmail,
  }));

  await createDocumentEvent({
    documentId: workingDoc.id,
    type: 'reviewed',
    actorEmail: auth.email,
    actorName: auth.name,
    metadata: {
      approvalMeetingId: meeting.id,
      meetingDecisionId: decision.id,
      recipientEmail: approverEmail ?? undefined,
    },
  });

  await createDocumentEvent({
    documentId: workingDoc.id,
    type: 'approval_meeting_reviewed',
    actorEmail: auth.email,
    actorName: auth.name,
    metadata: {
      approvalMeetingId: meeting.id,
      meetingDecisionId: decision.id,
    },
  });

  const selfService = await isSelfServiceDocumentWorkflow(workingDoc);

  if (
    approverEmail &&
    !selfService &&
    shouldNotifyUser(approverEmail, auth.email)
  ) {
    await createNotification({
      recipientEmail: approverEmail,
      documentId: workingDoc.id,
      type: 'approval_request',
      title: 'Document ready for approval',
      actorName: auth.name,
      message: `${auth.name} reviewed "${workingDoc.title}" in Daros Live and sent it to you for final approval.`,
      approvalMeetingId: meeting.id,
    });
  }

  if (workingDoc.createdBy && !selfService && shouldNotifyUser(workingDoc.createdBy, auth.email)) {
    await createNotification({
      recipientEmail: workingDoc.createdBy,
      documentId: workingDoc.id,
      type: 'document_reviewed',
      title: 'Document reviewed',
      actorName: auth.name,
      message: `${auth.name} reviewed your document "${workingDoc.title}" during the live session.`,
      approvalMeetingId: meeting.id,
    });
  }

  return { meeting, decision, document: workingDoc };
}

export async function recordLiveMeetingApprove(
  meetingId: string,
  auth: AuthActor,
): Promise<{ meeting: ApprovalMeetingRecord; decision: MeetingDecisionRecord; document: DocumentRecord }> {
  const { meeting, document } = await loadMeetingContext(meetingId, auth);
  await assertUserIsDocumentApprover(auth.email, document);

  const decision = await findMeetingDecisionByMeetingId(meetingId);
  if (!decision || decision.status !== 'reviewed') {
    throw new Error('The reviewer must complete review before approval');
  }

  const approverEmail = normalizedEmail(auth.email);
  if (normalizedEmail(decision.approverEmail) !== approverEmail) {
    throw new Error('Only the assigned approver for this meeting can approve');
  }

  const { document: approved, archivedOnApprove } = await finalizeDocumentApproval(document.id, auth);

  const closedDecision = await transitionMeetingDecisionRecord(meetingId, 'reviewed', (current) => ({
    ...current,
    status: 'approved',
    approvedAt: new Date().toISOString(),
    approvedBy: approverEmail,
  }));

  const completedMeeting = await completeMeetingAfterTerminalDecision(meeting);

  await createDocumentEvent({
    documentId: approved.id,
    type: 'approved',
    actorEmail: auth.email,
    actorName: auth.name,
    metadata: {
      version: String(approved.version),
      approvalMeetingId: meeting.id,
      meetingDecisionId: closedDecision.id,
    },
  });

  if (archivedOnApprove) {
    await createDocumentEvent({
      documentId: approved.id,
      type: 'version_archived',
      actorEmail: auth.email,
      actorName: auth.name,
      metadata: {
        version: String(archivedOnApprove.version),
        supersededByVersion: String(archivedOnApprove.supersededByVersion),
      },
    });
  }

  await createDocumentEvent({
    documentId: approved.id,
    type: 'approval_meeting_ended',
    actorEmail: auth.email,
    actorName: auth.name,
    metadata: {
      approvalMeetingId: completedMeeting.id,
      meetingDecisionId: closedDecision.id,
      action: 'approved',
    },
  });

  const selfService = await isSelfServiceDocumentWorkflow(approved);
  if (approved.createdBy && !selfService && shouldNotifyUser(approved.createdBy, auth.email)) {
    await createNotification({
      recipientEmail: approved.createdBy,
      documentId: approved.id,
      type: 'document_approved',
      title: 'Document approved',
      actorName: auth.name,
      message: `${auth.name} approved your document "${approved.title}" in Daros Live.`,
      approvalMeetingId: meeting.id,
    });
  }

  await updateDocument(approved.id, { approvalWorkflow: 'standard', activeApprovalMeetingId: undefined });

  return { meeting: completedMeeting, decision: closedDecision, document: approved };
}

export async function recordLiveMeetingReject(
  meetingId: string,
  auth: AuthActor,
  reason: string,
): Promise<{ meeting: ApprovalMeetingRecord; decision: MeetingDecisionRecord; document: DocumentRecord }> {
  const trimmed = reason.trim();
  if (!trimmed) {
    throw new Error('Rejection reason is required');
  }

  const { meeting, document } = await loadMeetingContext(meetingId, auth);
  await assertUserIsDocumentApprover(auth.email, document);

  const decision = await findMeetingDecisionByMeetingId(meetingId);
  if (!decision || decision.status !== 'reviewed') {
    throw new Error('The reviewer must complete review before rejection at approval stage');
  }

  const approverEmail = normalizedEmail(auth.email);
  if (normalizedEmail(decision.approverEmail) !== approverEmail) {
    throw new Error('Only the assigned approver for this meeting can reject');
  }

  const rejected = await rejectDocumentForApproval(document.id, auth.name, trimmed);

  const closedDecision = await transitionMeetingDecisionRecord(meetingId, 'reviewed', (current) => ({
    ...current,
    status: 'rejected',
    rejectedAt: new Date().toISOString(),
    rejectedBy: approverEmail,
    rejectionReason: trimmed,
  }));

  const completedMeeting = await completeMeetingAfterTerminalDecision(meeting);

  await createDocumentEvent({
    documentId: rejected.id,
    type: 'rejected',
    actorEmail: auth.email,
    actorName: auth.name,
    metadata: {
      reason: trimmed,
      rejectionStage: 'approval',
      approvalMeetingId: meeting.id,
      meetingDecisionId: closedDecision.id,
    },
  });

  await createDocumentEvent({
    documentId: rejected.id,
    type: 'approval_meeting_ended',
    actorEmail: auth.email,
    actorName: auth.name,
    metadata: {
      approvalMeetingId: completedMeeting.id,
      meetingDecisionId: closedDecision.id,
      action: 'rejected',
      reason: trimmed,
    },
  });

  if (rejected.createdBy && shouldNotifyUser(rejected.createdBy, auth.email)) {
    await createNotification({
      recipientEmail: rejected.createdBy,
      documentId: rejected.id,
      type: 'document_rejected',
      title: 'Document approval rejected',
      actorName: auth.name,
      message: `${auth.name} rejected "${rejected.title}" in Daros Live. Reason: ${trimmed}`,
      approvalMeetingId: meeting.id,
    });
  }

  await updateDocument(rejected.id, { approvalWorkflow: 'standard', activeApprovalMeetingId: undefined });

  return { meeting: completedMeeting, decision: closedDecision, document: rejected };
}