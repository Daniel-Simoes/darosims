import {
  DocReviewHistoryDialog,
  DocReviewHistoryError,
  DocReviewHistoryFooter,
  DocReviewHistoryHeader,
  DocReviewHistoryLoading,
  DocReviewHistoryMeta,
  DocReviewHistoryOverlay,
  DocReviewHistoryTable,
  DocReviewHistoryTableWrap,
} from './DocumentReviewHistoryDialog.styles';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { DocumentRecord } from '../../../types/documents';
import type { DocumentReviewHistoryRow } from '../utils/reviewHistory';

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
    <DocReviewHistoryOverlay onClick={onClose}>
      <DocReviewHistoryDialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="doc-review-history-title"
        onClick={(e) => e.stopPropagation()}
      >
        <DocReviewHistoryHeader>
          <div>
            <h2 id="doc-review-history-title" className="doc-review-history-title">
              Document Review History
            </h2>
            <DocReviewHistoryMeta>
              {displayCode} · {documentRecord.title}
            </DocReviewHistoryMeta>
          </div>
          <button type="button" className="doc-review-history-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </DocReviewHistoryHeader>

        {error ? <DocReviewHistoryError>{error}</DocReviewHistoryError> : null}

        {isLoading ? (
          <DocReviewHistoryLoading>Loading review history…</DocReviewHistoryLoading>
        ) : (
          <DocReviewHistoryTableWrap>
            <DocReviewHistoryTable>
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
            </DocReviewHistoryTable>
          </DocReviewHistoryTableWrap>
        )}

        <DocReviewHistoryFooter>
          <button type="button" className="doc-review-history-close-btn" onClick={onClose}>
            Close
          </button>
        </DocReviewHistoryFooter>
      </DocReviewHistoryDialog>
    </DocReviewHistoryOverlay>,
    document.body,
  );
}
