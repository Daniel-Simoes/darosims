import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentLoadingTask, type PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import './WordDocumentPreview.css';
import './PdfDocumentPreview.css';

GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfDocumentPreviewProps {
  pdfUrl: string;
  /** Kept for call-site compatibility; page toolbar no longer repeats the document title. */
  title?: string;
  /** When set, page is controlled externally (e.g. live meeting sync). */
  pageIndex?: number;
  onPageIndexChange?: (index: number) => void;
  /** Disables thumbnails and paging controls (viewers following a presenter). */
  readOnlyNavigation?: boolean;
  /** Hides thumbnail strip (e.g. Daros Live follow mode). */
  hideThumbnailSidebar?: boolean;
  className?: string;
}

const THUMB_WIDTH = 136;
const THUMB_DPR = 2;

async function renderPageToCanvas(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  cssWidth: number,
  pixelRatio: number,
  canvas: HTMLCanvasElement,
): Promise<void> {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = cssWidth / baseViewport.width;
  const viewport = page.getViewport({ scale: scale * pixelRatio });

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.style.width = `${viewport.width / pixelRatio}px`;
  canvas.style.height = `${viewport.height / pixelRatio}px`;

  const context = canvas.getContext('2d');
  if (!context) return;

  await page.render({ canvasContext: context, viewport, canvas }).promise;
}

async function renderPageToDataUrl(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  cssWidth: number,
): Promise<string> {
  const canvas = document.createElement('canvas');
  await renderPageToCanvas(pdf, pageNumber, cssWidth, THUMB_DPR, canvas);
  return canvas.toDataURL('image/png');
}

export function PdfDocumentPreview({
  pdfUrl,
  pageIndex,
  onPageIndexChange,
  readOnlyNavigation = false,
  hideThumbnailSidebar = false,
  className = '',
}: PdfDocumentPreviewProps) {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [internalPage, setInternalPage] = useState(0);
  const activePage = pageIndex ?? internalPage;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewportWidth, setViewportWidth] = useState(0);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);

  function goToPage(index: number) {
    if (readOnlyNavigation) return;
    const next = Math.max(0, Math.min(index, Math.max(pageCount - 1, 0)));
    if (pageIndex === undefined) {
      setInternalPage(next);
    }
    onPageIndexChange?.(next);
  }

  useEffect(() => {
    if (pageIndex === undefined) {
      setInternalPage(0);
    }
  }, [pdfUrl, pageIndex]);

  useEffect(() => {
    if (pageIndex !== undefined && pageCount > 0) {
      const clamped = Math.max(0, Math.min(pageIndex, pageCount - 1));
      if (clamped !== pageIndex && onPageIndexChange) {
        onPageIndexChange(clamped);
      }
    }
  }, [pageCount, pageIndex, onPageIndexChange]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const updateWidth = () => {
      setViewportWidth(node.clientWidth || 680);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, [pageCount, isLoading]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    setPageCount(0);
    setThumbnails([]);

    async function loadPdf() {
      try {
        const loadingTask = getDocument({ url: pdfUrl });
        loadingTaskRef.current = loadingTask;
        const pdf = await loadingTask.promise;
        if (!active) {
          await loadingTask.destroy();
          return;
        }

        pdfRef.current = pdf;
        const totalPages = pdf.numPages;
        setPageCount(totalPages);

        const thumbUrls = await Promise.all(
          Array.from({ length: totalPages }, (_, index) =>
            renderPageToDataUrl(pdf, index + 1, THUMB_WIDTH),
          ),
        );

        if (active) {
          setThumbnails(thumbUrls);
          setIsLoading(false);
        }
      } catch {
        if (active) {
          setError('Unable to load PDF preview.');
          setIsLoading(false);
        }
      }
    }

    void loadPdf();

    return () => {
      active = false;
      pdfRef.current = null;
      void loadingTaskRef.current?.destroy();
      loadingTaskRef.current = null;
    };
  }, [pdfUrl]);

  useEffect(() => {
    const pdf = pdfRef.current;
    const canvas = mainCanvasRef.current;
    if (!pdf || !canvas || pageCount === 0 || viewportWidth <= 0) return;

    let active = true;

    async function renderMainPage() {
      try {
        if (!active || !mainCanvasRef.current) return;

        const cssWidth = Math.max(viewportWidth - 32, 280);
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 3);

        await renderPageToCanvas(
          pdf!,
          activePage + 1,
          cssWidth,
          pixelRatio,
          mainCanvasRef.current,
        );
      } catch {
        if (active) setError('Unable to render PDF page.');
      }
    }

    void renderMainPage();

    return () => {
      active = false;
    };
  }, [activePage, pageCount, viewportWidth]);

  if (isLoading) {
    return <div className="doc-word-preview-loading">Loading PDF preview...</div>;
  }

  if (error) {
    return <div className="doc-word-preview-empty">{error}</div>;
  }

  if (pageCount === 0) {
    return <div className="doc-word-preview-empty">No PDF pages to preview.</div>;
  }

  return (
    <div className={`doc-word-pages doc-pdf-pages${className ? ` ${className}` : ''}`}>
      {!hideThumbnailSidebar ? (
        <aside className="doc-word-pages-sidebar" aria-label="PDF pages">
          {thumbnails.map((thumb, index) => (
            <button
              key={`pdf-page-${index + 1}`}
              type="button"
              className={`doc-word-page-thumb-btn ${activePage === index ? 'active' : ''}`}
              onClick={() => goToPage(index)}
              disabled={readOnlyNavigation}
              aria-label={`Page ${index + 1}`}
              aria-current={activePage === index ? 'page' : undefined}
            >
              <div className="doc-word-page-thumb doc-pdf-page-thumb">
                <img src={thumb} alt="" className="doc-pdf-thumb-image" draggable={false} />
              </div>
              <span className="doc-word-page-label">Page {index + 1}</span>
            </button>
          ))}
        </aside>
      ) : null}

      <div className="doc-word-pages-main">
        <div className="doc-word-page-toolbar">
          {!readOnlyNavigation && pageCount > 1 ? (
            <div className="doc-pdf-page-nav">
              <button
                type="button"
                className="doc-pdf-page-nav-btn"
                disabled={activePage <= 0}
                onClick={() => goToPage(activePage - 1)}
                aria-label="Previous page"
              >
                Previous
              </button>
              <button
                type="button"
                className="doc-pdf-page-nav-btn"
                disabled={activePage >= pageCount - 1}
                onClick={() => goToPage(activePage + 1)}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          ) : null}
          <span>
            Page {activePage + 1} of {pageCount}
          </span>
        </div>
        <div ref={viewportRef} className="doc-word-page-viewport doc-pdf-page-viewport">
          <article className="doc-word-page-sheet doc-pdf-page-sheet">
            <canvas ref={mainCanvasRef} className="doc-pdf-main-canvas" />
          </article>
        </div>
      </div>
    </div>
  );
}
