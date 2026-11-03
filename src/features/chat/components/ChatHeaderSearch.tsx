import './ChatHeaderSearch.css';

interface ChatHeaderSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ChatHeaderSearch({ value, onChange }: ChatHeaderSearchProps) {
  return (
    <div className="chat-header-search-wrap">
      <svg className="chat-header-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        className="chat-header-search"
        placeholder="Search conversations..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Search conversations"
      />
      <button type="button" className="chat-header-filter-btn" aria-label="Filter" title="Filter">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        </svg>
      </button>
    </div>
  );
}
