import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { DocumentRecord } from '../../../types/documents';
import { getDocumentDisplayCode } from '../../../lib/search/documentSearch';
import type {
  DocumentReviewHistoryRow,
  DocumentReviewTimelineStep,
} from '../utils/reviewHistory';
import { downloadReviewHistorySpreadsheet } from '../utils/reviewHistoryExport';
import { ReviewHistorySkeleton } from '../../../components/common/skeletons/DashboardSkeletons';
import './DocumentReviewHistoryDialog.css';

interface DocumentReviewHistoryDialogProps {
  open: boolean;
  documentRecord: DocumentRecord | null;
  steps: DocumentReviewTimelineStep[];
  tableRows?: DocumentReviewHistoryRow[];
  isLoading?: boolean;
  error?: string;
  onClose: () => void;
}

export function DocumentReviewHistoryDialog({
  open,
  documentRecord,
  steps,
  tableRows = [],
  isLoading = false,
  error = '',
  onClose,
}: DocumentReviewHistoryDialogProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open || !documentRecord) return null;

  const displayCode = getDocumentDisplayCode(documentRecord) || '—';

  return createPortal(
    <div className="doc-review-history-overlay" onClick={onClose}>
      <div
        className="doc-review-history-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="doc-review-history-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="doc-review-history-header">
          <div>
            <h2 id="doc-review-history-title" className="doc-review-history-title">
              Document Review History
            </h2>
            <p className="doc-review-history-meta">
              {displayCode} · {documentRecord.title}
            </p>
          </div>
          <button type="button" className="doc-review-history-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {error ? <p className="doc-review-history-error">{error}</p> : null}

        {isLoading ? (
          <ReviewHistorySkeleton />
        ) : (
          <div className="doc-review-history-body">
            {steps.length === 0 ? (
              <p className="doc-review-history-empty">No review history recorded yet.</p>
            ) : (
              <ol className="doc-review-history-timeline">
                {steps.map((step, index) => (
                  <li key={step.id} className="doc-review-history-timeline-item">
                    <div className="doc-review-history-timeline-marker" aria-hidden="true">
                      <span className="doc-review-history-timeline-dot" />
                      {index < steps.length - 1 ? (
                        <span className="doc-review-history-timeline-line" />
                      ) : null}
                    </div>
                    <div className="doc-review-history-timeline-content">
                      <div className="doc-review-history-timeline-head">
                        <h3 className="doc-review-history-step-title">{step.title}</h3>
                        <span className="doc-review-history-step-date">{step.date}</span>
                      </div>
                      <p className="doc-review-history-step-desc">{step.description}</p>
                      {step.toEmail ? (
                        <p className="doc-review-history-step-actor">
                          To <span className="doc-review-history-email">{step.toEmail}</span>
                        </p>
                      ) : null}
                      {step.byEmail ? (
                        <p className="doc-review-history-step-actor">
                          By <span className="doc-review-history-email">{step.byEmail}</span>
                        </p>
                      ) : null}
                      {step.rejectionStage ? (
                        <p className="doc-review-history-step-stage">
                          Stage:{' '}
                          <span className="doc-review-history-stage-badge">
                            {step.rejectionStage === 'approval'
                              ? 'Final approval'
                              : 'Document review'}
                          </span>
                        </p>
                      ) : null}
                      {step.reviewMessage ? (
                        <div className="doc-review-history-reason">
                          <span className="doc-review-history-reason-label">
                            {step.reasonLabel ?? 'Reason not approved'}
                          </span>
                          <p>{step.reviewMessage}</p>
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        <div className="doc-review-history-footer">
          <button
            type="button"
            className="doc-review-history-export-btn"
            disabled={isLoading || steps.length === 0}
            onClick={() => downloadReviewHistorySpreadsheet(documentRecord, steps, tableRows)}
          >
            Export CSV
          </button>
          <button type="button" className="doc-review-history-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}