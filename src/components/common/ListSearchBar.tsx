import './ListSearchBar.css';

interface ListSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function ListSearchBar({
  value,
  onChange,
  placeholder = 'Search by title or code…',
  className = '',
  id,
}: ListSearchBarProps) {
  return (
    <div className={`list-search-bar ${className}`.trim()}>
      <svg
        className="list-search-bar-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        id={id}
        type="search"
        className="list-search-bar-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
