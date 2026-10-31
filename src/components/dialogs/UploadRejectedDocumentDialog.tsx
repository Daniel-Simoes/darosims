import {
  UploadRejectedActions,
  UploadRejectedDialog,
  UploadRejectedMessage,
  UploadRejectedOverlay,
  UploadRejectedReason,
  UploadRejectedReasonLabel,
  UploadRejectedSpinner,
  UploadRejectedZoneSub,
  UploadRejectedZoneTitle,
} from './UploadRejectedDocumentDialog.styles';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import type { DocumentRecord } from '../../types/documents';
import { formatFileSize, verifyInternalDocumentFile } from '../../lib/documentUpload';

interface UploadRejectedDocumentDialogProps {
  open: boolean;
  documentRecord: DocumentRecord | null;
  onUpload: (file: File, resubmit: boolean) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function UploadRejectedDocumentDialog({
  open,
  documentRecord,
  onUpload,
  onCancel,
  isSubmitting = false,
}: UploadRejectedDocumentDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setFileError('');
      setIsChecking(false);
    }
  }, [open]);

  if (!open || !documentRecord) return null;

  async function handleFileSelect(file: File | undefined) {
    if (!file || isSubmitting) return;

    setIsChecking(true);
    setSelectedFile(null);
    setFileError('');

    const validationError = await verifyInternalDocumentFile(file);
    if (validationError) {
      setFileError(validationError);
      setIsChecking(false);
      return;
    }

    setSelectedFile(file);
    setIsChecking(false);
  }

  function handleCancel() {
    if (isSubmitting) return;
    setSelectedFile(null);
    setFileError('');
    onCancel();
  }

  async function handleUpload(resubmit: boolean) {
    if (!selectedFile || isSubmitting) return;
    await onUpload(selectedFile, resubmit);
  }

  return createPortal(
    <UploadRejectedOverlay onClick={handleCancel}>
      <UploadRejectedDialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-rejected-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="upload-rejected-title" className="upload-rejected-title">
          Upload new document
        </h2>
        <UploadRejectedMessage>
          Replace the file for <strong>{documentRecord.title}</strong> and address the feedback below.
        </UploadRejectedMessage>

        {documentRecord.rejectionReason ? (
          <UploadRejectedReason>
            <UploadRejectedReasonLabel>Reason for not approving</UploadRejectedReasonLabel>
            <p>{documentRecord.rejectionReason}</p>
          </UploadRejectedReason>
        ) : null}

        <div
          className={`upload-rejected-zone ${isChecking ? 'is-checking' : ''} ${selectedFile ? 'has-file' : ''} ${fileError ? 'is-error' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!isSubmitting && !isChecking) {
              void handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => {
            if (!isSubmitting && !isChecking) {
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="upload-rejected-file-input"
            onChange={(e) => {
              void handleFileSelect(e.target.files?.[0]);
              e.target.value = '';
            }}
          />

          {isChecking ? (
            <>
              <UploadRejectedSpinner aria-hidden="true" />
              <UploadRejectedZoneTitle>Checking document...</UploadRejectedZoneTitle>
              <UploadRejectedZoneSub>Verifying Word or text file format</UploadRejectedZoneSub>
            </>
          ) : selectedFile ? (
            <>
              <UploadRejectedZoneTitle>{selectedFile.name}</UploadRejectedZoneTitle>
              <UploadRejectedZoneSub>{formatFileSize(selectedFile.size)} · Ready to upload</UploadRejectedZoneSub>
            </>
          ) : (
            <>
              <UploadRejectedZoneTitle>Drag and drop Word or text file here</UploadRejectedZoneTitle>
              <UploadRejectedZoneSub>or click to browse from your computer</UploadRejectedZoneSub>
            </>
          )}
        </div>

        {fileError ? <p className="upload-rejected-error">{fileError}</p> : null}

        <UploadRejectedActions>
          <button
            type="button"
            className="upload-rejected-btn upload-rejected-btn-outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="upload-rejected-btn upload-rejected-btn-outline"
            onClick={() => handleUpload(false)}
            disabled={!selectedFile || isSubmitting || isChecking}
          >
            {isSubmitting ? 'Uploading...' : 'Upload new document'}
          </button>
          <button
            type="button"
            className="upload-rejected-btn upload-rejected-btn-primary"
            onClick={() => handleUpload(true)}
            disabled={!selectedFile || isSubmitting || isChecking}
          >
            {isSubmitting ? 'Sending...' : 'Upload & resubmit'}
          </button>
        </UploadRejectedActions>
      </UploadRejectedDialog>
    </UploadRejectedOverlay>,
    document.body,
  );
}
