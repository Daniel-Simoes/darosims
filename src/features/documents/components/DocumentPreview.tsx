import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchDocumentFileBlob } from '../../../lib/api';
import { documentTypeBadgeClass } from '../../../data/documentRegister';
import { getDocumentFileLabel } from '../../../lib/documentStatus';
import {
  getDocumentFileFormatLabel,
  inferDocumentFileFormat,
} from '../../../lib/documents/documentFileKind';
import type { DocumentRecord } from '../../../types/documents';
import { DocumentFilePreview } from './DocumentFilePreview';
import './DocumentPreview.css';

interface DocumentPreviewProps {
  documentId: string;
  title: string;
  fileName?: string;
  fileFormat?: DocumentRecord['fileFormat'];
  status: 'Active' | 'Draft' | 'Obsolete';
  type: string;
  process: string;
  origin?: string;
}

export function DocumentPreview({
  documentId,
  title,
  fileName,
  fileFormat,
  status,
  type,
  process,
  origin,
}: DocumentPreviewProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [isFullSize, setIsFullSize] = useState(false);

  const isExternal = origin === 'External';
  const resolvedFormat = useMemo(
    () => (fileFormat === 'word' ? 'office' : fileFormat ?? (fileName ? inferDocumentFileFormat(fileName) : undefined)),
    [fileFormat, fileName],
  );
  const formatLabel = getDocumentFileFormatLabel(resolvedFormat);
  const fileLabel = getDocumentFileLabel({
    fileName,
    fileFormat: resolvedFormat,
    status,
    documentOrigin: origin,
  });
  const showPreview = !!fileName;
  const canFullSize = !!fileUrl && (resolvedFormat === 'pdf' || resolvedFormat === 'image');

  useEffect(() => {
    if (!showPreview) {
      setFileUrl(null);
      setPreviewError('');
      return;
    }

    let active = true;
    setIsLoadingPreview(true);
    setPreviewError('');

    fetchDocumentFileBlob(documentId)
      .then((blob) => {
        if (!active) return;
        const objectUrl = URL.createObjectURL(blob);
        setFileMimeType(blob.type || '');
        setFileUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });
      })
      .catch(() => {
        if (active) {
          setPreviewError('Unable to load document preview.');
          setFileUrl(null);
        }
      })
      .finally(() => {
        if (active) setIsLoadingPreview(false);
      });

    return () => {
      active = false;
      setFileUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [documentId, fileName, showPreview]);

  useEffect(() => {
    if (!isFullSize) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsFullSize(false);
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullSize]);

  function handleOpenInNewTab() {
    if (!fileUrl) return;
    window.open(fileUrl, '_blank');
  }

  const fullscreenModal =
    isFullSize && canFullSize && fileUrl ? (
      <div
        className="doc-preview-fullscreen"
        role="dialog"
        aria-modal="true"
        aria-label={`Full size preview of ${title}`}
      >
        <div className="doc-preview-fullscreen-bar">
          <div className="doc-preview-fullscreen-info">
            <span className={`doc-preview-status doc-preview-status-${status.toLowerCase()}`}>
              {status}
            </span>
            <span className="doc-preview-format">{formatLabel}</span>
            <span className="doc-preview-fullscreen-title">{title}</span>
            <span className="doc-preview-fullscreen-file">{fileLabel}</span>
          </div>
          <div className="doc-preview-fullscreen-actions">
            <button
              type="button"
              className="doc-preview-fullscreen-action"
              onClick={handleOpenInNewTab}
            >
              Open in New Tab
            </button>
            <button
              type="button"
              className="doc-preview-fullscreen-close"
              aria-label="Close full size preview"
              onClick={() => setIsFullSize(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {resolvedFormat === 'image' ? (
          <div className="doc-preview-fullscreen-image-wrap">
            <img src={fileUrl} alt={title} className="doc-preview-fullscreen-image" />
          </div>
        ) : (
          <iframe
            src={fileUrl}
            title={`Full size preview of ${title}`}
            className="doc-preview-fullscreen-frame"
          />
        )}
      </div>
    ) : null;

  return (
    <section className="doc-preview">
      <div className="doc-preview-head">
        <div>
          <h2>Document Preview</h2>
          <p className="doc-preview-subtitle">{fileLabel}</p>
        </div>
        <div className="doc-preview-head-actions">
          <span className={`doc-preview-status doc-preview-status-${status.toLowerCase()}`}>
            {status}
          </span>
          <span className="doc-preview-format">{formatLabel}</span>
          <button
            type="button"
            className="doc-preview-fullsize-btn"
            disabled={!canFullSize}
            title="View document full size"
            aria-label="View document full size"
            onClick={() => setIsFullSize(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
            Full Size
          </button>
        </div>
      </div>

      <div className="doc-preview-frame-wrap">
        {!fileName ? (
          <div className="doc-preview-empty">
            <div className="doc-preview-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
            <p>No file uploaded for this document.</p>
          </div>
        ) : isLoadingPreview ? (
          <div className="doc-preview-empty">
            <p>Loading preview...</p>
          </div>
        ) : previewError ? (
          <div className="doc-preview-empty doc-preview-empty-error">
            <p>{previewError}</p>
          </div>
        ) : fileUrl ? (
          <DocumentFilePreview
            fileUrl={fileUrl}
            fileName={fileName}
            fileFormat={resolvedFormat}
            title={title}
            mimeType={fileMimeType}
          />
        ) : null}
      </div>

      {fullscreenModal ? createPortal(fullscreenModal, document.body) : null}

      <div className="doc-preview-meta">
        <div>
          <p className="doc-preview-title">{title}</p>
          <p className="doc-preview-desc">
            {isExternal
              ? `External reference document · ${formatLabel}`
              : status === 'Draft'
                ? `Draft internal document · ${formatLabel}`
                : `Approved controlled document · ${formatLabel}`}
          </p>
        </div>
        <div className="doc-preview-tags">
          <span className={`doc-badge ${documentTypeBadgeClass(type)}`}>{type}</span>
          <span className="doc-preview-tag">{process}</span>
          <span className="doc-preview-tag">{origin ?? 'Internal'}</span>
        </div>
      </div>

      <div className="doc-preview-footer">
        <button
          type="button"
          className="doc-preview-btn"
          disabled={!fileUrl}
          onClick={handleOpenInNewTab}
        >
          Open in New Tab
        </button>
      </div>
    </section>
  );
}