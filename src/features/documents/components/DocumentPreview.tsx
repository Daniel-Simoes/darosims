import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchDocumentFileBlob } from '../../../lib/api';
import { documentTypeBadgeClass } from '../../../data/documentRegister';
import { getDocumentFileLabel } from '../../../lib/documentStatus';
import { PdfDocumentPreview } from './PdfDocumentPreview';
import './DocumentPreview.css';

interface DocumentPreviewProps {
  documentId: string;
  title: string;
  fileName?: string;
  fileFormat?: 'word' | 'pdf';
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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [isFullSize, setIsFullSize] = useState(false);

  const isExternal = origin === 'External';
  const fileLabel = getDocumentFileLabel({
    fileName,
    fileFormat,
    status,
    documentOrigin: origin,
  });
  const showPdfPreview = !!fileName;
  const canFullSize = !!pdfUrl;

  useEffect(() => {
    if (!showPdfPreview) {
      setPdfUrl(null);
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
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });
      })
      .catch(() => {
        if (active) {
          setPreviewError('Unable to load PDF preview.');
          setPdfUrl(null);
        }
      })
      .finally(() => {
        if (active) setIsLoadingPreview(false);
      });

    return () => {
      active = false;
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [documentId, fileName, showPdfPreview]);

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

  async function handleOpenInNewTab() {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank');
  }

  const fullscreenModal =
    isFullSize && canFullSize ? (
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
            <span className="doc-preview-format doc-preview-format-pdf">PDF</span>
            <span className="doc-preview-fullscreen-title">{title}</span>
            <span className="doc-preview-fullscreen-file">{fileLabel}</span>
          </div>
          <div className="doc-preview-fullscreen-actions">
            {pdfUrl ? (
              <button
                type="button"
                className="doc-preview-fullscreen-action"
                onClick={handleOpenInNewTab}
              >
                Open in New Tab
              </button>
            ) : null}
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
        <iframe
          src={pdfUrl ?? undefined}
          title={`Full size preview of ${title}`}
          className="doc-preview-fullscreen-frame"
        />
      </div>
    ) : null;

  return (
    <section className="doc-preview doc-preview-pdf">
      <div className="doc-preview-head">
        <div>
          <h2>Document Preview</h2>
          <p className="doc-preview-subtitle">{fileLabel}</p>
        </div>
        <div className="doc-preview-head-actions">
          <span className={`doc-preview-status doc-preview-status-${status.toLowerCase()}`}>
            {status}
          </span>
          <span className="doc-preview-format doc-preview-format-pdf">PDF</span>
          <button
            type="button"
            className="doc-preview-fullsize-btn"
            disabled={!canFullSize}
            title="View PDF full size"
            aria-label="View PDF full size"
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
            <p>No PDF uploaded for this document.</p>
          </div>
        ) : isLoadingPreview ? (
          <div className="doc-preview-empty">
            <p>Loading preview...</p>
          </div>
        ) : previewError ? (
          <div className="doc-preview-empty doc-preview-empty-error">
            <p>{previewError}</p>
          </div>
        ) : pdfUrl ? (
          <PdfDocumentPreview pdfUrl={pdfUrl} title={title} />
        ) : null}
      </div>

      {fullscreenModal ? createPortal(fullscreenModal, document.body) : null}

      <div className="doc-preview-meta">
        <div>
          <p className="doc-preview-title">{title}</p>
          <p className="doc-preview-desc">
            {isExternal
              ? 'External reference document · PDF'
              : status === 'Draft'
                ? 'Draft internal document · PDF'
                : 'Approved controlled document · PDF'}
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
          disabled={!pdfUrl}
          onClick={handleOpenInNewTab}
        >
          Open in New Tab
        </button>
      </div>
    </section>
  );
}
