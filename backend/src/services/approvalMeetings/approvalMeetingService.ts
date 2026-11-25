import { createHash } from 'crypto';
import { buildLiveKitRoomName, isLiveKitConfigured } from '@/config/livekit';
import { ensureLiveKitRoomForMeeting } from '@/services/livekit/livekitRoomService';
import { buildDocumentContentFingerprint } from '@/lib/approvalMeetings/documentContentFingerprint';
import { getDocumentById, submitDocumentForApproval, updateDocument } from '@/lib/documents';
import { normalizeTeamEmail } from '@/lib/legacyEmails';
import {
  findApprovalMeetingByClientSubmissionKey,
  findApprovalMeetingById,
  findApprovalMeetingsByDocumentId,
  saveApprovalMeetingRecord,
} from '@/repositories/approvalMeetings/approvalMeetingRepository';
import {
  findMeetingDecisionByMeetingId,
  saveMeetingDecisionRecord,
} from '@/repositories/approvalMeetings/meetingDecisionRepository';
import type {
  ApprovalMeetingRecord,
  ApprovalMeetingStatus,
  CreateApprovalMeetingInput,
  DocumentRecord,
  MeetingDecisionRecord,
  RescheduleApprovalMeetingInput,
} from '@/types';
import {
  assertUserIsDocumentApprover,
  assertUserIsDocumentReviewer,
  buildMeetingParticipants,
  canAuthUserAccessApprovalMeeting,
  resolveReviewerApproverEmails,
} from './approvalMeetingAuthorization';

function documentVersionNumber(document: DocumentRecord): number {
  const version = Number(document.version);
  return Number.isFinite(version) ? version : 1;
}

function assertMeetingDocumentVersion(document: DocumentRecord, expectedVersion: number) {
  const current = documentVersionNumber(document);
  if (current !== expectedVersion) {
    throw new Error(
      `Document version changed (expected ${expectedVersion}, current ${current}). Cancel this meeting and schedule a new one.`,
    );
  }
}

function assertMeetingFingerprint(document: DocumentRecord, expectedFingerprint: string) {
  const fingerprint = buildDocumentContentFingerprint(document);
  if (fingerprint !== expectedFingerprint) {
    throw new Error('Document content changed since this meeting was scheduled');
  }
}

async function loadDocumentForMeeting(documentId: string): Promise<DocumentRecord> {
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }
  if (document.documentOrigin === 'External') {
    throw new Error('Live approval meetings are only available for internal documents');
  }
  return document;
}

function assertAuthorCanSchedule(authEmail: string, document: DocumentRecord) {
  const normalized = normalizeTeamEmail(authEmail) ?? authEmail.trim().toLowerCase();
  const createdBy = normalizeTeamEmail(document.createdBy) ?? document.createdBy?.trim().toLowerCase();
  if (!createdBy || normalized !== createdBy) {
    throw new Error('Only the document author can schedule a live approval meeting');
  }
}

function parseScheduledStart(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid scheduled start time');
  }
  return date.toISOString();
}

export function transitionMeetingStatus(
  meeting: ApprovalMeetingRecord,
  next: ApprovalMeetingStatus,
): ApprovalMeetingRecord {
  if (meeting.status === 'completed' || meeting.status === 'cancelled') {
    throw new Error(`Meeting is already ${meeting.status}`);
  }

  const allowed: Record<ApprovalMeetingStatus, ApprovalMeetingStatus[]> = {
    scheduled: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!allowed[meeting.status].includes(next)) {
    throw new Error(`Cannot move meeting from ${meeting.status} to ${next}`);
  }

  const now = new Date().toISOString();
  if (next === 'in_progress') {
    return { ...meeting, status: next, startedAt: now };
  }
  if (next === 'completed') {
    return { ...meeting, status: next, endedAt: now };
  }
  if (next === 'cancelled') {
    return { ...meeting, status: next, cancelledAt: now };
  }
  return { ...meeting, status: next };
}

export async function createApprovalMeeting(
  input: CreateApprovalMeetingInput,
  auth: { email: string; name: string },
): Promise<{ meeting: ApprovalMeetingRecord; decision: MeetingDecisionRecord; created: boolean }> {
  const submissionKey = input.clientSubmissionKey?.trim();
  if (submissionKey) {
    const existing = await findApprovalMeetingByClientSubmissionKey(submissionKey);
    if (existing) {
      const decision = await findMeetingDecisionByMeetingId(existing.id);
      if (!decision) {
        throw new Error('Meeting decision missing for existing submission');
      }
      return { meeting: existing, decision, created: false };
    }
  }

  const document = await loadDocumentForMeeting(input.documentId.trim());
  assertAuthorCanSchedule(auth.email, document);

  if (!document.owner?.trim()) {
    throw new Error('Document reviewer (owner) must be assigned before scheduling a meeting');
  }

  const title = input.title?.trim();
  if (!title) {
    throw new Error('Meeting title is required');
  }

  const roles = await resolveReviewerApproverEmails(document);
  const version = documentVersionNumber(document);
  const fingerprint = buildDocumentContentFingerprint(document);
  const scheduledStartsAt = parseScheduledStart(input.scheduledStartsAt);

  const timezone = input.timezone?.trim() || 'UTC';
  const meetingId = crypto.randomUUID();
  const now = new Date().toISOString();

  const meeting: ApprovalMeetingRecord = {
    id: meetingId,
    documentId: document.id,
    documentVersion: version,
    status: 'scheduled',
    scheduledStartsAt,
    scheduledEndsAt: input.scheduledEndsAt?.trim()
      ? parseScheduledStart(input.scheduledEndsAt)
      : undefined,
    timezone,
    createdBy: normalizeTeamEmail(auth.email) ?? auth.email.trim().toLowerCase(),
    createdAt: now,
    contentFingerprint: fingerprint,
    ownerAtSchedule: document.owner.trim(),
    approverAtSchedule: roles.approverEmail,
    livekitRoomName: buildLiveKitRoomName(meetingId),
    title,
    description: input.description?.trim() || undefined,
    clientSubmissionKey: submissionKey || undefined,
    participants: await buildMeetingParticipants(document, roles),
  };

  const decision: MeetingDecisionRecord = {
    id: crypto.randomUUID(),
    meetingId,
    documentId: document.id,
    documentVersion: version,
    status: 'pending',
    reviewerEmail: roles.reviewerEmail,
    approverEmail: roles.approverEmail,
    createdAt: now,
    updatedAt: now,
  };

  await saveApprovalMeetingRecord(meeting);
  await saveMeetingDecisionRecord(decision);

  return { meeting, decision, created: true };
}

export async function getApprovalMeetingBundle(meetingId: string): Promise<{
  meeting: ApprovalMeetingRecord;
  decision: MeetingDecisionRecord | null;
}> {
  const meeting = await findApprovalMeetingById(meetingId);
  if (!meeting) {
    throw new Error('Meeting not found');
  }
  const decision = await findMeetingDecisionByMeetingId(meetingId);
  return { meeting, decision };
}

export async function listApprovalMeetingsForDocument(
  documentId: string,
): Promise<ApprovalMeetingRecord[]> {
  const meetings = await findApprovalMeetingsByDocumentId(documentId);
  return meetings.sort(
    (a, b) => new Date(b.scheduledStartsAt).getTime() - new Date(a.scheduledStartsAt).getTime(),
  );
}

async function requireMeetingAccess(
  authEmail: string,
  meeting: ApprovalMeetingRecord,
): Promise<void> {
  if (!(await canAuthUserAccessApprovalMeeting(authEmail, meeting))) {
    throw new Error('You are not allowed to access this meeting');
  }
}

export async function startApprovalMeeting(
  meetingId: string,
  auth: { email: string; name: string },
): Promise<ApprovalMeetingRecord> {
  const meeting = await findApprovalMeetingById(meetingId);
  if (!meeting) {
    throw new Error('Meeting not found');
  }

  await requireMeetingAccess(auth.email, meeting);

  const document = await loadDocumentForMeeting(meeting.documentId);
  assertMeetingDocumentVersion(document, meeting.documentVersion);
  assertMeetingFingerprint(document, meeting.contentFingerprint);

  if (document.approvalWorkflow === 'live' && !document.submittedAt) {
    await submitDocumentForApproval(document.id, meeting.createdBy);
  }

  const updated = transitionMeetingStatus(meeting, 'in_progress');
  if (isLiveKitConfigured()) {
    await ensureLiveKitRoomForMeeting(
      updated.id,
      updated.livekitRoomName ?? buildLiveKitRoomName(updated.id),
    );
  }
  await saveApprovalMeetingRecord(updated);
  return updated;
}

export async function completeApprovalMeeting(
  meetingId: string,
  auth: { email: string; name: string },
): Promise<ApprovalMeetingRecord> {
  const meeting = await findApprovalMeetingById(meetingId);
  if (!meeting) {
    throw new Error('Meeting not found');
  }

  await requireMeetingAccess(auth.email, meeting);

  const normalizedAuthor =
    normalizeTeamEmail(meeting.createdBy) ?? meeting.createdBy.trim().toLowerCase();
  const normalizedUser = normalizeTeamEmail(auth.email) ?? auth.email.trim().toLowerCase();
  if (normalizedUser !== normalizedAuthor) {
    throw new Error('Only the meeting host can end this meeting');
  }

  const updated = transitionMeetingStatus(meeting, 'completed');
  await saveApprovalMeetingRecord(updated);
  return updated;
}

export async function rescheduleApprovalMeeting(
  meetingId: string,
  input: RescheduleApprovalMeetingInput,
  auth: { email: string; name: string },
): Promise<ApprovalMeetingRecord> {
  const meeting = await findApprovalMeetingById(meetingId);
  if (!meeting) {
    throw new Error('Meeting not found');
  }

  const normalizedAuthor =
    normalizeTeamEmail(meeting.createdBy) ?? meeting.createdBy.trim().toLowerCase();
  const normalizedUser = normalizeTeamEmail(auth.email) ?? auth.email.trim().toLowerCase();
  if (normalizedUser !== normalizedAuthor) {
    throw new Error('Only the meeting host can reschedule this meeting');
  }

  if (meeting.status !== 'scheduled') {
    throw new Error('Only scheduled meetings can be rescheduled');
  }

  const scheduledStartsAt = parseScheduledStart(input.scheduledStartsAt);
  const timezone = input.timezone?.trim() || meeting.timezone;

  const updated: ApprovalMeetingRecord = {
    ...meeting,
    scheduledStartsAt,
    scheduledEndsAt: input.scheduledEndsAt?.trim()
      ? parseScheduledStart(input.scheduledEndsAt)
      : meeting.scheduledEndsAt,
    timezone,
    title: input.title?.trim() || meeting.title,
    description: input.description?.trim() || meeting.description,
  };

  await saveApprovalMeetingRecord(updated);
  return updated;
}

export async function listApprovalMeetingBundlesForDocument(
  documentId: string,
): Promise<{ meeting: ApprovalMeetingRecord; decision: MeetingDecisionRecord | null }[]> {
  const meetings = await listApprovalMeetingsForDocument(documentId);
  const bundles = await Promise.all(
    meetings.map(async (meeting) => ({
      meeting,
      decision: await findMeetingDecisionByMeetingId(meeting.id),
    })),
  );
  return bundles;
}

export async function cancelApprovalMeeting(
  meetingId: string,
  auth: { email: string; name: string },
  reason?: string,
): Promise<ApprovalMeetingRecord> {
  const meeting = await findApprovalMeetingById(meetingId);
  if (!meeting) {
    throw new Error('Meeting not found');
  }

  const normalizedAuthor =
    normalizeTeamEmail(meeting.createdBy) ?? meeting.createdBy.trim().toLowerCase();
  const normalizedUser = normalizeTeamEmail(auth.email) ?? auth.email.trim().toLowerCase();
  if (normalizedUser !== normalizedAuthor) {
    throw new Error('Only the meeting host can cancel this meeting');
  }

  const updated: ApprovalMeetingRecord = {
    ...transitionMeetingStatus(meeting, 'cancelled'),
    cancellationReason: reason?.trim() || meeting.cancellationReason,
  };
  await saveApprovalMeetingRecord(updated);
  return updated;
}

export function getMeetingAuthorizationSummary(
  meeting: ApprovalMeetingRecord,
  authEmail: string,
) {
  const normalized = normalizeTeamEmail(authEmail) ?? authEmail.trim().toLowerCase();
  const participant = meeting.participants.find(
    (entry) => (normalizeTeamEmail(entry.email) ?? entry.email.toLowerCase()) === normalized,
  );
  return {
    role: participant?.role ?? null,
    canAccess: Boolean(participant),
    isHost:
      (normalizeTeamEmail(meeting.createdBy) ?? meeting.createdBy.toLowerCase()) === normalized,
  };
}

/** Exposed for later live decision actions — validates reviewer against document. */
export async function validateMeetingReviewer(authEmail: string, documentId: string) {
  const document = await loadDocumentForMeeting(documentId);
  await assertUserIsDocumentReviewer(authEmail, document);
  return document;
}

/** Exposed for later live decision actions — validates approver against document. */
export async function validateMeetingApprover(authEmail: string, documentId: string) {
  const document = await loadDocumentForMeeting(documentId);
  await assertUserIsDocumentApprover(authEmail, document);
  return document;
}

export function meetingDocumentBindingHash(
  documentId: string,
  version: number,
  fingerprint: string,
): string {
  return createHash('sha256')
    .update(`${documentId}|${version}|${fingerprint}`)
    .digest('hex')
    .slice(0, 16);
}