import { useCallback, useEffect, useState } from 'react';
import type { ApprovalMeetingRecord } from '../../../types/approvalMeetings';
import type { DocumentRecord } from '../../../types/documents';
import { PdfDocumentPreview } from '../../documents/components/PdfDocumentPreview';
import type { useLiveMeetingDocumentSession } from '../hooks/useLiveMeetingDocumentSession';

type DocumentSession = ReturnType<typeof useLiveMeetingDocumentSession>;

interface LiveMeetingCollaborativeDocumentPaneProps {
  meeting: ApprovalMeetingRecord;
  document: DocumentRecord | null;
  fileUrl: string | null;
  loading: boolean;
  error: string | null;
  documentSession: DocumentSession;
}

export function LiveMeetingCollaborativeDocumentPane({
  meeting,
  document,
  fileUrl,
  loading,
  error,
  documentSession,
}: LiveMeetingCollaborativeDocumentPaneProps) {
  const {
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
  } = documentSession;

  const [pdfPageCount, setPdfPageCount] = useState(0);

  useEffect(() => {
    setPdfPageCount(0);
  }, [fileUrl, meeting.documentId]);
  const showPdfNav = Boolean(fileUrl && document && !docBlocked && format === 'pdf' && pdfPageCount > 0);

  const goPdfPage = useCallback(
    (nextIndex: number) => {
      if (!canControl || pdfPageCount <= 0) return;
      const clamped = Math.max(0, Math.min(nextIndex, pdfPageCount - 1));
      setPageIndex(clamped);
    },
    [canControl, pdfPageCount, setPageIndex],
  );

  return (
    <section className="dl-document-pane" aria-label="Shared document">
      <div className="dl-document-card">
        {mode === 'follow' && syncEnabled ? (
          <span className="dl-following-badge">Following presenter</span>
        ) : null}

        <div className="dl-document-pane-head">
          <div className="dl-document-pane-head-left">
            <p className="dl-document-pane-sub">
              Version <strong>v{meeting.documentVersion}</strong>
              {meeting.title?.trim() ? ` · ${meeting.title.trim()}` : ''}
            </p>
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
          {showPdfNav ? (
            <div className="dl-document-pane-pdf-toolbar" aria-label="PDF page navigation">
              {canControl && pdfPageCount > 1 ? (
                <div className="doc-pdf-page-nav">
                  <button
                    type="button"
                    className="doc-pdf-page-nav-btn"
                    disabled={pageIndex <= 0}
                    onClick={() => goPdfPage(pageIndex - 1)}
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="doc-pdf-page-nav-btn"
                    disabled={pageIndex >= pdfPageCount - 1}
                    onClick={() => goPdfPage(pageIndex + 1)}
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              ) : null}
              <span className="dl-document-pane-page-label">
                Page {pageIndex + 1} of {pdfPageCount}
              </span>
            </div>
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
                hidePageToolbar
                onPageCountChange={setPdfPageCount}
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
      </div>
    </section>
  );
}