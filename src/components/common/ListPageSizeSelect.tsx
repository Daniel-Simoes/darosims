import {
  PAGE_SIZE_OPTIONS,
  type PageSizeOption,
} from './ListPaginationFooter';
import './ListPaginationFooter.css';

interface ListPageSizeSelectProps {
  pageSize: PageSizeOption;
  onPageSizeChange: (size: PageSizeOption) => void;
}

export function ListPageSizeSelect({ pageSize, onPageSizeChange }: ListPageSizeSelectProps) {
  return (
    <label className="list-pagination-size">
      <span className="list-pagination-size-label">Rows per page</span>
      <select
        className="list-pagination-size-select"
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSizeOption)}
        aria-label="Rows per page"
      >
        {PAGE_SIZE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
