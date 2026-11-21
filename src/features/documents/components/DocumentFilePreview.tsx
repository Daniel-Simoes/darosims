import { useEffect, useState } from 'react';
import type { DocumentRecord } from '../../../types/documents';
import {
  getDocumentFileFormatLabel,
  inferDocumentFileFormat,
  type DocumentFileFormat,
} from '../../../lib/documents/documentFileKind';
import { PdfDocumentPreview } from './PdfDocumentPreview';
import './DocumentFilePreview.css';

type ResolvedFormat = DocumentFileFormat | 'word';

function resolveFormat(
  fileName?: string,
  fileFormat?: DocumentRecord['fileFormat'],
): ResolvedFormat {
  if (fileFormat === 'word') return 'office';
  if (fileFormat) return fileFormat;
  if (!fileName) return 'other';
  return inferDocumentFileFormat(fileName);
}

interface DocumentFilePreviewProps {
  fileUrl: string;
  fileName?: string;
  fileFormat?: DocumentRecord['fileFormat'];
  title: string;
  mimeType?: string;
}

export function DocumentFilePreview({
  fileUrl,
  fileName,
  fileFormat,
  title,
  mimeType,
}: DocumentFilePreviewProps) {
  const format = resolveFormat(fileName, fileFormat);
  const [textContent, setTextContent] = useState('');
  const [textError, setTextError] = useState('');
  const [isLoadingText, setIsLoadingText] = useState(false);

  useEffect(() => {
    if (format !== 'text') {
      setTextContent('');
      setTextError('');
      return;
    }

    let active = true;
    setIsLoadingText(true);
    setTextError('');

    fetch(fileUrl)
      .then((response) => response.text())
      .then((text) => {
        if (!active) return;
        const trimmed = text.length > 200_000 ? `${text.slice(0, 200_000)}\n\n…` : text;
        setTextContent(trimmed);
      })
      .catch(() => {
        if (active) setTextError('Unable to load text preview.');
      })
      .finally(() => {
        if (active) setIsLoadingText(false);
      });

    return () => {
      active = false;
    };
  }, [fileUrl, format]);

  if (format === 'pdf') {
    return <PdfDocumentPreview pdfUrl={fileUrl} title={title} />;
  }

  if (format === 'image') {
    return (
      <div className="doc-file-preview doc-file-preview-image">
        <img src={fileUrl} alt={`Preview of ${title}`} className="doc-file-preview-image-el" />
      </div>
    );
  }

  if (format === 'video') {
    return (
      <div className="doc-file-preview doc-file-preview-media">
        <video src={fileUrl} controls className="doc-file-preview-media-el" preload="metadata">
          <track kind="captions" />
        </video>
      </div>
    );
  }

  if (format === 'audio') {
    return (
      <div className="doc-file-preview doc-file-preview-audio">
        <div className="doc-file-preview-audio-card">
          <p className="doc-file-preview-audio-title">{fileName ?? title}</p>
          <audio src={fileUrl} controls className="doc-file-preview-media-el" preload="metadata" />
        </div>
      </div>
    );
  }

  if (format === 'text') {
    if (isLoadingText) {
      return <div className="doc-file-preview-loading">Loading text preview…</div>;
    }
    if (textError) {
      return <div className="doc-file-preview-fallback">{textError}</div>;
    }
    return (
      <div className="doc-file-preview doc-file-preview-text">
        <pre className="doc-file-preview-text-body">{textContent}</pre>
      </div>
    );
  }

  return (
    <div className="doc-file-preview doc-file-preview-fallback">
      <div className="doc-file-preview-fallback-card">
        <div className="doc-file-preview-fallback-icon" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
        </div>
        <p className="doc-file-preview-fallback-type">
          {getDocumentFileFormatLabel(format === 'word' ? 'office' : format)}
          {mimeType ? ` · ${mimeType}` : ''}
        </p>
        <p className="doc-file-preview-fallback-name">{fileName ?? 'Attached file'}</p>
        <p className="doc-file-preview-fallback-hint">
          {format === 'office'
            ? 'Office files are opened with your browser or desktop apps. Use “Open in New Tab” to view or download.'
            : 'Use “Open in New Tab” to download or open this file with a compatible application.'}
        </p>
        <a className="doc-file-preview-fallback-link" href={fileUrl} target="_blank" rel="noopener noreferrer">
          Open file
        </a>
      </div>
    </div>
  );
}