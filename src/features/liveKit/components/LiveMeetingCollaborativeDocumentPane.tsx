import { useEffect, useMemo, useState } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import type { ApprovalMeetingRecord } from '../../../types/approvalMeetings';
import type { DocumentRecord } from '../../../types/documents';
import { inferDocumentFileFormat } from '../../../lib/documents/documentFileKind';
import { buildDocumentContentFingerprint } from '../../../lib/approvalMeetings/documentContentFingerprint';
import { PdfDocumentPreview } from '../../documents/components/PdfDocumentPreview';
import { parseLiveKitParticipantMetadata } from '../utils/participantRole';
import { useLiveMeetingDocumentSync } from '../hooks/useLiveMeetingDocumentSync';

interface LiveMeetingCollaborativeDocumentPaneProps {
  meeting: ApprovalMeetingRecord;
  document: DocumentRecord | null;
  fileUrl: string | null;
  loading: boolean;
  error: string | null;
}

export function LiveMeetingCollaborativeDocumentPane({
  meeting,
  document,
  fileUrl,
  loading,
  error,
}: LiveMeetingCollaborativeDocumentPaneProps) {
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

  return (
    <section className="dl-document-pane" aria-label="Shared document">
      <div className="dl-document-pane-head">
        <div>
          <h2 className="dl-document-pane-title">{document?.title ?? 'Document'}</h2>
          <p className="dl-document-pane-sub">
            Version <strong>v{meeting.documentVersion}</strong>
            {document?.code ? ` · ${document.code}` : ''}
            {format === 'pdf' && syncEnabled ? (
              <>
                {' · '}
                <span className={`dl-doc-sync-badge dl-doc-sync-${mode}`}>
                  {canControl ? 'You control navigation' : 'Following presenter'}
                </span>
              </>
            ) : null}
          </p>
        </div>
        {versionMismatch ? (
          <span className="dl-document-version-warn" role="status">
            Document version has changed since this meeting was scheduled.
          </span>
        ) : null}
        {!versionMismatch && fingerprintMismatch && fingerprintChecked ? (
          <span className="dl-document-version-warn" role="status">
            Document file or metadata was modified after this meeting was scheduled.
          </span>
        ) : null}
      </div>

      <div className="dl-document-pane-body">
        {loading ? <p className="dl-document-pane-message">Loading document…</p> : null}
        {error ? <p className="dl-document-pane-error">{error}</p> : null}
        {!loading && !error && !fileUrl ? (
          <p className="dl-document-pane-message">No file attached to this document yet.</p>
        ) : null}

        {docBlocked ? (
          <p className="dl-document-pane-message">
            Collaborative viewing is paused until the document matches the version bound to this meeting.
          </p>
        ) : null}

        {fileUrl && document && !docBlocked && format === 'pdf' ? (
          <div className="dl-document-preview-wrap dl-document-preview-secure">
            <PdfDocumentPreview
              pdfUrl={fileUrl}
              pageIndex={pageIndex}
              onPageIndexChange={setPageIndex}
              readOnlyNavigation={!canControl}
              hideThumbnailSidebar={!canControl}
              className="dl-pdf-collaborative"
            />
          </div>
        ) : null}

        {fileUrl && document && !docBlocked && format !== 'pdf' ? (
          <p className="dl-document-pane-message">
            Daros Live collaborative viewing currently supports <strong>PDF</strong> documents only. Other
            formats are not shown in this meeting to avoid uncontrolled downloads.
          </p>
        ) : null}
      </div>
    </section>
  );
}