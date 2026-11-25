/** Daros Live — approval meetings (Phase 1 backend foundation). */
export * from '@/services/approvalMeetings/approvalMeetingService';
export { findApprovalMeetingById } from '@/repositories/approvalMeetings/approvalMeetingRepository';
export {
  canAuthUserAccessApprovalMeeting,
  getAuthUserMeetingRole,
  resolveReviewerApproverEmails,
} from '@/services/approvalMeetings/approvalMeetingAuthorization';
export { buildDocumentContentFingerprint } from '@/lib/approvalMeetings/documentContentFingerprint';
export {
  recordLiveMeetingApprove,
  recordLiveMeetingReject,
  recordLiveMeetingReview,
} from '@/services/approvalMeetings/liveMeetingDecisionService';