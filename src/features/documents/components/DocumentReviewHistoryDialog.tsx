import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { DocumentRecord } from '../../../types/documents';
import type { DocumentReviewHistoryRow } from '../utils/reviewHistory';
import './DocumentReviewHistoryDialog.css';

interface DocumentReviewHistoryDialogProps {
  open: boolean;
  documentRecord: DocumentRecord | null;
  rows: DocumentReviewHistoryRow[];
  isLoading?: boolean;
  error?: string;
  onClose: () => void;
}

export function DocumentReviewHistoryDialog({
  open,
  documentRecord,
  rows,
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

  const displayCode =
    documentRecord.documentOrigin === 'External'
      ? documentRecord.externalRef || '—'
      : documentRecord.code || '—';

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
          <p className="doc-review-history-loading">Loading review history…</p>
        ) : (
          <div className="doc-review-history-table-wrap">
            <table className="doc-review-history-table">
              <thead>
                <tr>
                  <th>Version Number</th>
                  <th>Date</th>
                  <th>Section</th>
                  <th>Description of Change</th>
                  <th>Justification for Change</th>
                  <th>Approved by</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.versionNumber}-${row.date}`}>
                    <td>{row.versionNumber}</td>
                    <td>{row.date}</td>
                    <td>{row.section || '—'}</td>
                    <td>{row.descriptionOfChange}</td>
                    <td>{row.justificationForChange || '—'}</td>
                    <td>{row.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="doc-review-history-footer">
          <button type="button" className="doc-review-history-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
