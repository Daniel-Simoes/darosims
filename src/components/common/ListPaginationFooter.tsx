import './ListPaginationFooter.css';

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_PAGE_SIZE: PageSizeOption = 10;

interface ListPaginationFooterProps {
  total: number;
  page: number;
  pageSize: PageSizeOption;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

function buildPageItems(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 1) return totalPages === 1 ? [1] : [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: (number | 'ellipsis')[] = [1];
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  if (windowStart > 2) items.push('ellipsis');
  for (let page = windowStart; page <= windowEnd; page += 1) {
    items.push(page);
  }
  if (windowEnd < totalPages - 1) items.push('ellipsis');
  items.push(totalPages);

  return items;
}

export function ListPaginationFooter({
  total,
  page,
  pageSize,
  onPageChange,
  itemLabel = 'entries',
}: ListPaginationFooterProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(safePage * pageSize, total);
  const pageItems = buildPageItems(safePage, totalPages);

  return (
    <div className="doc-table-footer list-pagination-footer">
      <span className="doc-table-count">
        {total === 0
          ? `No ${itemLabel}`
          : `Showing ${showingFrom} to ${showingTo} of ${total} ${itemLabel}`}
      </span>

      {total > 0 ? (
        <div className="doc-pagination">
          <button
            type="button"
            className="doc-page-btn"
            disabled={safePage <= 1}
            aria-label="Previous page"
            onClick={() => onPageChange(safePage - 1)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {pageItems.map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="doc-page-ellipsis" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`doc-page-btn ${safePage === item ? 'active' : ''}`}
                aria-current={safePage === item ? 'page' : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            className="doc-page-btn"
            disabled={safePage >= totalPages}
            aria-label="Next page"
            onClick={() => onPageChange(safePage + 1)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
