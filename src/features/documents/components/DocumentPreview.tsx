import {
  DocPreviewDesc,
  DocPreviewEmpty,
  DocPreviewEmptyHint,
  DocPreviewEmptyIcon,
  DocPreviewFooter,
  DocPreviewFormat,
  DocPreviewFrameWrap,
  DocPreviewFullscreenActions,
  DocPreviewFullscreenBar,
  DocPreviewFullscreenEditHint,
  DocPreviewFullscreenFile,
  DocPreviewFullscreenInfo,
  DocPreviewFullscreenTitle,
  DocPreviewFullscreenWord,
  DocPreviewHead,
  DocPreviewHeadActions,
  DocPreviewMeta,
  DocPreviewSubtitle,
  DocPreviewTag,
  DocPreviewTags,
  DocPreviewTitle,
} from './DocumentPreview.styles';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchDocumentFileBlob } from '../../../lib/api';
import { documentTypeBadgeClass } from '../../../data/documentRegister';
import { getDocumentFileLabel, isInternalDraftDocument } from '../../../lib/documentStatus';
import { DocumentEditor } from './DocumentEditor';
import { WordDocumentPreview } from './WordDocumentPreview';
import { PdfDocumentPreview } from './PdfDocumentPreview';

interface DocumentPreviewProps {
  documentId: string;
  title: string;
  fileName?: string;
  fileFormat?: 'word' | 'pdf';
  sourceContent?: string;
  sourceModified?: boolean;
  status: 'Active' | 'Draft' | 'Obsolete';
  type: string;
  process: string;
  origin?: string;
  editableDraft?: boolean;
  onSourceContentChange?: (html: string) => void;
  onSaveDraftContent?: (html: string) => Promise<void>;
}

export function DocumentPreview({
  documentId,
  title,
  fileName,
  fileFormat,
  sourceContent,
  sourceModified,
  status,
  type,
  process,
  origin,
  editableDraft = false,
  onSourceContentChange,
  onSaveDraftContent,
}: DocumentPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [isFullSize, setIsFullSize] = useState(false);
  const [fullscreenContent, setFullscreenContent] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const isExternal = origin === 'External';
  const isWordDraft = isInternalDraftDocument({ documentOrigin: origin, status });
  const canEditDraft = isWordDraft && editableDraft;
  const fileLabel = getDocumentFileLabel({
    fileName,
    fileFormat,
    status,
    documentOrigin: origin,
  });
  const hasWordContent = isWordDraft && !!sourceContent?.trim();
  const showPdfPreview = !isWordDraft && !!fileName;
  const canFullSize = isWordDraft ? canEditDraft || hasWordContent : !!pdfUrl;

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
    if (canEditDraft) {
      document.body.classList.add('draft-document-fullscreen');
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('draft-document-fullscreen');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullSize, canEditDraft]);

  function openFullSize() {
    setFullscreenContent(sourceContent || '<p></p>');
    setSaveMessage('');
    setIsFullSize(true);
  }

  function handleFullscreenContentChange(html: string) {
    setFullscreenContent(html);
    onSourceContentChange?.(html);
  }

  async function handleSaveDraft() {
    if (!onSaveDraftContent) {
      setIsFullSize(false);
      return;
    }

    setIsSavingDraft(true);
    setSaveMessage('');

    try {
      await onSaveDraftContent(fullscreenContent);
      setSaveMessage('Draft saved.');
      setTimeout(() => setIsFullSize(false), 600);
    } catch {
      setSaveMessage('Failed to save draft.');
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handleOpenInNewTab() {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank');
  }

  const fullscreenModal =
    isFullSize && canFullSize ? (
      <div
        className={`doc-preview-fullscreen ${canEditDraft ? 'doc-preview-fullscreen-draft' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Full size preview of ${title}`}
      >
        <DocPreviewFullscreenBar>
          <DocPreviewFullscreenInfo>
            <span className={`doc-preview-status doc-preview-status-${status.toLowerCase()}`}>
              {status}
            </span>
            {isWordDraft ? (
              <DocPreviewFormat>Word</DocPreviewFormat>
            ) : (
              <DocPreviewFormat>PDF</DocPreviewFormat>
            )}
            <DocPreviewFullscreenTitle>{title}</DocPreviewFullscreenTitle>
            <DocPreviewFullscreenFile>{fileLabel}</DocPreviewFullscreenFile>
            {canEditDraft ? (
              <DocPreviewFullscreenEditHint>Editing · changes marked in yellow</DocPreviewFullscreenEditHint>
            ) : null}
          </DocPreviewFullscreenInfo>
          <DocPreviewFullscreenActions>
            {saveMessage ? (
              <span className={`doc-preview-save-msg ${saveMessage.includes('Failed') ? 'error' : ''}`}>
                {saveMessage}
              </span>
            ) : null}
            {canEditDraft && onSaveDraftContent ? (
              <button
                type="button"
                className="doc-preview-fullscreen-action doc-preview-fullscreen-action-primary"
                disabled={isSavingDraft}
                onClick={handleSaveDraft}
              >
                {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </button>
            ) : null}
            {!isWordDraft && pdfUrl ? (
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
          </DocPreviewFullscreenActions>
        </DocPreviewFullscreenBar>
        {canEditDraft ? (
          <DocumentEditor
            content={fullscreenContent}
            onChange={handleFullscreenContentChange}
            trackEdits
            variant="fullscreen"
            placeholder="Edit your document..."
          />
        ) : isWordDraft ? (
          <DocPreviewFullscreenWord
            dangerouslySetInnerHTML={{ __html: sourceContent ?? '' }}
          />
        ) : (
          <iframe
            src={pdfUrl ?? undefined}
            title={`Full size preview of ${title}`}
            className="doc-preview-fullscreen-frame"
          />
        )}
      </div>
    ) : null;

  return (
    <section className={`doc-preview ${isWordDraft ? 'doc-preview-draft' : 'doc-preview-pdf'}`}>
      <DocPreviewHead>
        <div>
          <h2>Document Preview</h2>
          <DocPreviewSubtitle>{fileLabel}</DocPreviewSubtitle>
        </div>
        <DocPreviewHeadActions>
          <span className={`doc-preview-status doc-preview-status-${status.toLowerCase()}`}>
            {status}
          </span>
          {isWordDraft ? (
            <DocPreviewFormat>Word</DocPreviewFormat>
          ) : (
            <DocPreviewFormat>PDF</DocPreviewFormat>
          )}
          <button
            type="button"
            className="doc-preview-fullsize-btn"
            disabled={!canFullSize}
            title={canEditDraft ? 'Edit document full size' : 'View PDF full size'}
            aria-label={canEditDraft ? 'Edit document full size' : 'View PDF full size'}
            onClick={openFullSize}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
            Full Size
          </button>
        </DocPreviewHeadActions>
      </DocPreviewHead>

      <DocPreviewFrameWrap>
        {isWordDraft ? (
          !hasWordContent ? (
            <DocPreviewEmpty>
              <DocPreviewEmptyIcon>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M12 11v6M9 14h6" />
                </svg>
              </DocPreviewEmptyIcon>
              <p>No Word content for this draft document.</p>
              <DocPreviewEmptyHint>
                {canEditDraft
                  ? 'Open full size to start writing.'
                  : 'Edit the document to add content before approval.'}
              </DocPreviewEmptyHint>
            </DocPreviewEmpty>
          ) : (
            <WordDocumentPreview
              documentId={documentId}
              fileName={fileName}
              sourceContent={sourceContent}
              sourceModified={sourceModified}
            />
          )
        ) : !fileName ? (
          <DocPreviewEmpty>
            <DocPreviewEmptyIcon>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </DocPreviewEmptyIcon>
            <p>No PDF uploaded for this document.</p>
          </DocPreviewEmpty>
        ) : isLoadingPreview ? (
          <DocPreviewEmpty>
            <p>Loading preview...</p>
          </DocPreviewEmpty>
        ) : previewError ? (
          <DocPreviewEmpty>
            <p>{previewError}</p>
          </DocPreviewEmpty>
        ) : pdfUrl ? (
          <PdfDocumentPreview pdfUrl={pdfUrl} title={title} />
        ) : null}
      </DocPreviewFrameWrap>

      {fullscreenModal ? createPortal(fullscreenModal, document.body) : null}

      <DocPreviewMeta>
        <div>
          <DocPreviewTitle>{title}</DocPreviewTitle>
          <DocPreviewDesc>
            {isWordDraft
              ? 'Draft internal document · Word format until approved'
              : isExternal
                ? 'External reference document'
                : 'Approved controlled document · PDF format'}
          </DocPreviewDesc>
        </div>
        <DocPreviewTags>
          <span className={`doc-badge ${documentTypeBadgeClass(type)}`}>{type}</span>
          <DocPreviewTag>{process}</DocPreviewTag>
          <DocPreviewTag>{origin ?? 'Internal'}</DocPreviewTag>
        </DocPreviewTags>
      </DocPreviewMeta>

      {!isWordDraft ? (
        <DocPreviewFooter>
          <button
            type="button"
            className="doc-preview-btn"
            disabled={!pdfUrl}
            onClick={handleOpenInNewTab}
          >
            Open in New Tab
          </button>
        </DocPreviewFooter>
      ) : null}
    </section>
  );
}
