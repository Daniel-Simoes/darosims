import { createPortal } from 'react-dom';
import { useState } from 'react';
import './RejectDocumentDialog.css';

interface RejectDocumentDialogProps {
  open: boolean;
  documentTitle: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function RejectDocumentDialog({
  open,
  documentTitle,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: RejectDocumentDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  function handleConfirm() {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('Please provide a reason for not approving this document.');
      return;
    }
    setError('');
    onConfirm(trimmed);
  }

  function handleCancel() {
    setReason('');
    setError('');
    onCancel();
  }

  return createPortal(
    <div className="reject-dialog-overlay" onClick={handleCancel}>
      <div
        className="reject-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="reject-dialog-title" className="reject-dialog-title">
          Do not approve document
        </h2>
        <p className="reject-dialog-message">
          Explain why <strong>{documentTitle}</strong> was not approved. This will be sent to the
          person who requested approval.
        </p>
        <label className="reject-dialog-field">
          <span className="reject-dialog-label">Reason for not approving</span>
          <textarea
            className="reject-dialog-textarea"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="Describe what needs to be changed or why the document cannot be approved..."
            disabled={isSubmitting}
          />
        </label>
        {error ? <p className="reject-dialog-error">{error}</p> : null}
        <div className="reject-dialog-actions">
          <button
            type="button"
            className="reject-dialog-btn reject-dialog-btn-outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="reject-dialog-btn reject-dialog-btn-danger"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Confirm rejection'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
