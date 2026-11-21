import { createPortal } from 'react-dom';
import { RegisterSelect } from '../../features/documents/components/RegisterSelect';
import './ConfirmDialog.css';

interface DocumentWorkflowPeopleDialogProps {
  open: boolean;
  title: string;
  message: string;
  fieldLabel: string;
  value: string;
  options: string[];
  placeholder?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onValueChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
}

export function DocumentWorkflowPeopleDialog({
  open,
  title,
  message,
  fieldLabel,
  value,
  options,
  placeholder = 'Select a person…',
  confirmLabel,
  cancelLabel = 'Cancel',
  onValueChange,
  onConfirm,
  onCancel,
  confirmDisabled,
}: DocumentWorkflowPeopleDialogProps) {
  if (!open) return null;

  return createPortal(
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog confirm-dialog-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workflow-people-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="workflow-people-dialog-title" className="confirm-dialog-title">
          {title}
        </h2>
        <p className="confirm-dialog-message">{message}</p>
        <label className="confirm-dialog-field">
          <span className="confirm-dialog-field-label">{fieldLabel}</span>
          <RegisterSelect
            value={value}
            onChange={onValueChange}
            options={options}
            placeholder={placeholder}
          />
        </label>
        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-btn confirm-dialog-btn-outline" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="confirm-dialog-btn confirm-dialog-btn-primary"
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}