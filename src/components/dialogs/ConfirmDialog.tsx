import { createPortal } from 'react-dom';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** When true, only the primary button is shown (e.g. informational “Back”). */
  singleAction?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  singleAction = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return createPortal(
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="confirm-dialog-title">
          {title}
        </h2>
        <p className="confirm-dialog-message">{message}</p>
        <div className={`confirm-dialog-actions ${singleAction ? 'confirm-dialog-actions-single' : ''}`}>
          {!singleAction ? (
            <button type="button" className="confirm-dialog-btn confirm-dialog-btn-outline" onClick={onCancel}>
              {cancelLabel}
            </button>
          ) : null}
          <button type="button" className="confirm-dialog-btn confirm-dialog-btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
