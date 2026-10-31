import {
  ListSearchBarIcon,
  ListSearchBarInput,
  ListSearchBarRoot,
} from './ListSearchBar.styles';

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
    <ListSearchBarRoot className={className || undefined}>
      <ListSearchBarIcon
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
      </ListSearchBarIcon>
      <ListSearchBarInput
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </ListSearchBarRoot>
  );
}
