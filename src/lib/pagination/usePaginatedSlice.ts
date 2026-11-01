import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_PAGE_SIZE,
  type PageSizeOption,
} from '../../components/common/ListPaginationFooter';

export function usePaginatedSlice<T>(items: T[], searchQuery: string) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, pageSize]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const safePage = Math.min(Math.max(1, page), totalPages);

  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  return {
    pagedItems,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
  };
}
