import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentLoadingTask, type PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import './WordDocumentPreview.css';
import './PdfDocumentPreview.css';

GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfDocumentPreviewProps {
  pdfUrl: string;
  title: string;
}

async function renderPageToDataUrl(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  targetWidth: number,
): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;

  const context = canvas.getContext('2d');
  if (!context) return '';

  await page.render({ canvasContext: context, viewport: scaledViewport, canvas }).promise;
  return canvas.toDataURL('image/png');
}

export function PdfDocumentPreview({ pdfUrl, title }: PdfDocumentPreviewProps) {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);

  useEffect(() => {
    setActivePage(0);
  }, [pdfUrl]);

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
            renderPageToDataUrl(pdf, index + 1, 136),
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
    if (!pdf || !canvas || pageCount === 0) return;

    let active = true;

    async function renderMainPage() {
      try {
        const page = await pdf!.getPage(activePage + 1);
        if (!active || !mainCanvasRef.current) return;

        const viewport = page.getViewport({ scale: 1 });
        const maxWidth = mainCanvasRef.current.parentElement?.clientWidth ?? 680;
        const scale = Math.min(maxWidth / viewport.width, 1.35);
        const scaledViewport = page.getViewport({ scale });

        const context = mainCanvasRef.current.getContext('2d');
        if (!context) return;

        mainCanvasRef.current.width = scaledViewport.width;
        mainCanvasRef.current.height = scaledViewport.height;

        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
          canvas: mainCanvasRef.current,
        }).promise;
      } catch {
        if (active) setError('Unable to render PDF page.');
      }
    }

    void renderMainPage();

    return () => {
      active = false;
    };
  }, [activePage, pageCount, thumbnails]);

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
    <div className="doc-word-pages doc-pdf-pages">
      <aside className="doc-word-pages-sidebar" aria-label="PDF pages">
        {thumbnails.map((thumb, index) => (
          <button
            key={`pdf-page-${index + 1}`}
            type="button"
            className={`doc-word-page-thumb-btn ${activePage === index ? 'active' : ''}`}
            onClick={() => setActivePage(index)}
            aria-label={`Page ${index + 1}`}
            aria-current={activePage === index ? 'page' : undefined}
          >
            <div className="doc-word-page-thumb doc-pdf-page-thumb">
              <img src={thumb} alt="" className="doc-pdf-thumb-image" />
            </div>
            <span className="doc-word-page-label">Page {index + 1}</span>
          </button>
        ))}
      </aside>

      <div className="doc-word-pages-main">
        <div className="doc-word-page-toolbar">
          <span>
            Page {activePage + 1} of {pageCount}
          </span>
          <span className="doc-pdf-toolbar-title">{title}</span>
        </div>
        <div className="doc-word-page-viewport doc-pdf-page-viewport">
          <article className="doc-word-page-sheet doc-pdf-page-sheet">
            <canvas ref={mainCanvasRef} className="doc-pdf-main-canvas" />
          </article>
        </div>
      </div>
    </div>
  );
}
