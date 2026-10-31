import {
  DocWordPageContent,
  DocWordPageLabel,
  DocWordPageSheet,
  DocWordPageThumb,
  DocWordPageThumbContent,
  DocWordPageToolbar,
  DocWordPageViewport,
  DocWordPages,
  DocWordPagesMain,
  DocWordPagesSidebar,
  DocWordPreviewEmpty,
  DocWordPreviewLoading,
} from './WordDocumentPreview.styles';
import { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { fetchDocumentSourceBlob } from '../../../lib/api';

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
    <DocWordPages>
      <DocWordPagesSidebar aria-label="Document pages">
        {pages.map((page, index) => (
          <button
            key={page.id}
            type="button"
            className={`doc-word-page-thumb-btn ${activePage === index ? 'active' : ''}`}
            onClick={() => onSelectPage(index)}
            aria-label={`Page ${index + 1}`}
            aria-current={activePage === index ? 'page' : undefined}
          >
            <DocWordPageThumb>
              {page.isPlainText ? (
                <pre className="doc-word-page-thumb-text">{page.html.slice(0, 280)}</pre>
              ) : (
                <div className="doc-word-preview-styles">
                  {docxStyles ? <style>{docxStyles}</style> : null}
                  <DocWordPageThumbContent
                    dangerouslySetInnerHTML={{ __html: page.html }}
                  />
                </div>
              )}
            </DocWordPageThumb>
            <DocWordPageLabel>Page {index + 1}</DocWordPageLabel>
          </button>
        ))}
      </DocWordPagesSidebar>

      <DocWordPagesMain>
        <DocWordPageToolbar>
          <span>
            Page {activePage + 1} of {pages.length}
          </span>
        </DocWordPageToolbar>
        <DocWordPageViewport>
          <DocWordPageSheet>
            {current?.isPlainText ? (
              <pre className="doc-word-page-text">{current.html}</pre>
            ) : (
              <DocWordPageContent>
                {docxStyles ? <style>{docxStyles}</style> : null}
                <div dangerouslySetInnerHTML={{ __html: current?.html ?? '' }} />
              </DocWordPageContent>
            )}
          </DocWordPageSheet>
        </DocWordPageViewport>
      </DocWordPagesMain>
    </DocWordPages>
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
        <DocWordPreviewLoading>Loading preview...</DocWordPreviewLoading>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div ref={hiddenRenderRef} className="doc-word-preview-hidden" aria-hidden="true" />
        <DocWordPreviewEmpty>{error}</DocWordPreviewEmpty>
      </>
    );
  }

  if (pages.length === 0) {
    return (
      <>
        <div ref={hiddenRenderRef} className="doc-word-preview-hidden" aria-hidden="true" />
        <DocWordPreviewEmpty>No document content to preview.</DocWordPreviewEmpty>
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
