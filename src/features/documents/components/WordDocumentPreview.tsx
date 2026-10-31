import { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { fetchDocumentSourceBlob } from '../../../lib/api';
import './WordDocumentPreview.css';

interface WordDocumentPreviewProps {
  documentId: string;
  fileName?: string;
  sourceContent?: string;
  sourceModified?: boolean;
}

interface PageItem {
  id: string;
  html: string;
  isPlainText?: boolean;
}

function PagedDocumentLayout({
  pages,
  activePage,
  onSelectPage,
  docxStyles,
}: {
  pages: PageItem[];
  activePage: number;
  onSelectPage: (index: number) => void;
  docxStyles?: string;
}) {
  const current = pages[activePage];

  return (
    <div className="doc-word-pages">
      <aside className="doc-word-pages-sidebar" aria-label="Document pages">
        {pages.map((page, index) => (
          <button
            key={page.id}
            type="button"
            className={`doc-word-page-thumb-btn ${activePage === index ? 'active' : ''}`}
            onClick={() => onSelectPage(index)}
            aria-label={`Page ${index + 1}`}
            aria-current={activePage === index ? 'page' : undefined}
          >
            <div className="doc-word-page-thumb">
              {page.isPlainText ? (
                <pre className="doc-word-page-thumb-text">{page.html.slice(0, 280)}</pre>
              ) : (
                <div className="doc-word-preview-styles">
                  {docxStyles ? <style>{docxStyles}</style> : null}
                  <div
                    className="doc-word-page-thumb-content"
                    dangerouslySetInnerHTML={{ __html: page.html }}
                  />
                </div>
              )}
            </div>
            <span className="doc-word-page-label">Page {index + 1}</span>
          </button>
        ))}
      </aside>

      <div className="doc-word-pages-main">
        <div className="doc-word-page-toolbar">
          <span>
            Page {activePage + 1} of {pages.length}
          </span>
        </div>
        <div className="doc-word-page-viewport">
          <article className="doc-word-page-sheet">
            {current?.isPlainText ? (
              <pre className="doc-word-page-text">{current.html}</pre>
            ) : (
              <div className="doc-word-page-content">
                {docxStyles ? <style>{docxStyles}</style> : null}
                <div dangerouslySetInnerHTML={{ __html: current?.html ?? '' }} />
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}

function singleHtmlPage(html: string, id = 'html-0'): PageItem[] {
  return [{ id, html }];
}

function singleTextPage(text: string, id = 'txt-0'): PageItem[] {
  return [{ id, html: text, isPlainText: true }];
}

export function WordDocumentPreview({
  documentId,
  fileName,
  sourceContent,
  sourceModified = false,
}: WordDocumentPreviewProps) {
  const hiddenRenderRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [docxStyles, setDocxStyles] = useState('');
  const [activePage, setActivePage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setActivePage(0);
  }, [documentId, sourceModified, sourceContent, fileName]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    setPages([]);
    setDocxStyles('');

    async function loadSourcePreview() {
      if (sourceModified && sourceContent?.trim()) {
        setPages(singleHtmlPage(sourceContent, 'edited'));
        setIsLoading(false);
        return;
      }

      try {
        const blob = await fetchDocumentSourceBlob(documentId);
        if (!active || !hiddenRenderRef.current) return;

        hiddenRenderRef.current.innerHTML = '';
        const isDocx =
          fileName?.toLowerCase().endsWith('.docx') ||
          blob.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        if (isDocx) {
          await renderAsync(blob, hiddenRenderRef.current, undefined, {
            className: 'docx',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true,
            ignoreLastRenderedPageBreak: true,
            renderHeaders: true,
            renderFooters: true,
          });

          const styleEl = hiddenRenderRef.current.querySelector('style');
          const styles = styleEl?.textContent ?? '';
          const sections = hiddenRenderRef.current.querySelectorAll('.docx-wrapper > section.docx');

          const pageItems: PageItem[] =
            sections.length > 0
              ? Array.from(sections).map((section, index) => ({
                  id: `docx-${index}`,
                  html: section.outerHTML,
                }))
              : singleHtmlPage(hiddenRenderRef.current.querySelector('.docx-wrapper')?.innerHTML ?? '');

          if (active) {
            setDocxStyles(styles);
            setPages(pageItems);
          }
        } else {
          const text = await blob.text();
          if (active) setPages(singleTextPage(text));
        }
      } catch {
        if (!active) return;
        if (sourceContent?.trim()) {
          setPages(singleHtmlPage(sourceContent, 'fallback'));
        } else {
          setError('Unable to load document preview.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadSourcePreview();

    return () => {
      active = false;
    };
  }, [documentId, fileName, sourceContent, sourceModified]);

  useEffect(() => {
    if (activePage > pages.length - 1) {
      setActivePage(Math.max(0, pages.length - 1));
    }
  }, [activePage, pages.length]);

  if (isLoading) {
    return (
      <>
        <div ref={hiddenRenderRef} className="doc-word-preview-hidden" aria-hidden="true" />
        <div className="doc-word-preview-loading">Loading preview...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div ref={hiddenRenderRef} className="doc-word-preview-hidden" aria-hidden="true" />
        <div className="doc-word-preview-empty">{error}</div>
      </>
    );
  }

  if (pages.length === 0) {
    return (
      <>
        <div ref={hiddenRenderRef} className="doc-word-preview-hidden" aria-hidden="true" />
        <div className="doc-word-preview-empty">No document content to preview.</div>
      </>
    );
  }

  return (
    <>
      <div ref={hiddenRenderRef} className="doc-word-preview-hidden" aria-hidden="true" />
      <PagedDocumentLayout
        pages={pages}
        activePage={activePage}
        onSelectPage={setActivePage}
        docxStyles={docxStyles}
      />
    </>
  );
}
