import {
  RejectDialog,
  RejectDialogActions,
  RejectDialogError,
  RejectDialogField,
  RejectDialogLabel,
  RejectDialogMessage,
  RejectDialogOverlay,
} from './RejectDocumentDialog.styles';
import { createPortal } from 'react-dom';
import { useState } from 'react';

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
    <RejectDialogOverlay onClick={handleCancel}>
      <RejectDialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="reject-dialog-title" className="reject-dialog-title">
          Do not approve document
        </h2>
        <RejectDialogMessage>
          Explain why <strong>{documentTitle}</strong> was not approved. This will be sent to the
          person who requested approval.
        </RejectDialogMessage>
        <RejectDialogField>
          <RejectDialogLabel>Reason for not approving</RejectDialogLabel>
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
        </RejectDialogField>
        {error ? <RejectDialogError>{error}</RejectDialogError> : null}
        <RejectDialogActions>
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
        </RejectDialogActions>
      </RejectDialog>
    </RejectDialogOverlay>,
    document.body,
  );
}
