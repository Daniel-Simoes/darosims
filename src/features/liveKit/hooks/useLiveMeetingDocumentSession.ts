import { useEffect, useMemo, useState } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import type { ApprovalMeetingRecord } from '../../../types/approvalMeetings';
import type { DocumentRecord } from '../../../types/documents';
import { inferDocumentFileFormat } from '../../../lib/documents/documentFileKind';
import { buildDocumentContentFingerprint } from '../../../lib/approvalMeetings/documentContentFingerprint';
import { parseLiveKitParticipantMetadata } from '../utils/participantRole';
import { useLiveMeetingDocumentSync } from './useLiveMeetingDocumentSync';

export function useLiveMeetingDocumentSession(
  meeting: ApprovalMeetingRecord,
  document: DocumentRecord | null,
  fileUrl: string | null,
) {
  const { localParticipant } = useLocalParticipant();
  const { role } = parseLiveKitParticipantMetadata(localParticipant?.metadata);
  const [fingerprintMismatch, setFingerprintMismatch] = useState(false);
  const [fingerprintChecked, setFingerprintChecked] = useState(false);

  const versionMismatch =
    document &&
    Number.isFinite(document.version) &&
    Math.trunc(document.version) !== meeting.documentVersion;

  useEffect(() => {
    let active = true;
    if (!document) {
      setFingerprintMismatch(false);
      setFingerprintChecked(false);
      return;
    }

    void buildDocumentContentFingerprint(document).then((fingerprint) => {
      if (!active) return;
      setFingerprintMismatch(fingerprint !== meeting.contentFingerprint);
      setFingerprintChecked(true);
    });

    return () => {
      active = false;
    };
  }, [document, meeting.contentFingerprint]);

  const format = useMemo(() => {
    if (!document) return 'other';
    if (document.fileFormat === 'pdf') return 'pdf';
    if (document.fileName) return inferDocumentFileFormat(document.fileName);
    return 'other';
  }, [document]);

  const syncEnabled = Boolean(
    fileUrl &&
      document &&
      format === 'pdf' &&
      !versionMismatch &&
      !fingerprintMismatch &&
      fingerprintChecked,
  );

  const { pageIndex, setPageIndex, canControl, mode } = useLiveMeetingDocumentSync({
    meetingId: meeting.id,
    documentId: meeting.documentId,
    documentVersion: meeting.documentVersion,
    participantRole: role,
    enabled: syncEnabled,
  });

  const docBlocked = versionMismatch || fingerprintMismatch;

  return {
    format,
    syncEnabled,
    canControl,
    mode,
    pageIndex,
    setPageIndex,
    docBlocked,
    versionMismatch,
    fingerprintMismatch,
    fingerprintChecked,
  };
}