import { createPortal } from 'react-dom';
import {
  ConfirmDialogActions,
  ConfirmDialogBtnOutline,
  ConfirmDialogBtnPrimary,
  ConfirmDialogMessage,
  ConfirmDialogOverlay,
  ConfirmDialogPanel,
  ConfirmDialogTitle,
} from './ConfirmDialog.styles';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return createPortal(
    <ConfirmDialogOverlay onClick={onCancel}>
      <ConfirmDialogPanel
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ConfirmDialogTitle id="confirm-dialog-title">{title}</ConfirmDialogTitle>
        <ConfirmDialogMessage>{message}</ConfirmDialogMessage>
        <ConfirmDialogActions>
          <ConfirmDialogBtnOutline type="button" onClick={onCancel}>
            {cancelLabel}
          </ConfirmDialogBtnOutline>
          <ConfirmDialogBtnPrimary type="button" onClick={onConfirm}>
            {confirmLabel}
          </ConfirmDialogBtnPrimary>
        </ConfirmDialogActions>
      </ConfirmDialogPanel>
    </ConfirmDialogOverlay>,
    document.body,
  );
}
