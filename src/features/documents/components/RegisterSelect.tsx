import { useMemo } from 'react';
import { buildSelectOptions } from '../utils/selectOptions';
import './DocumentRegisterView.css';

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

interface RegisterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  required?: boolean;
  includeStandard?: boolean;
  disabled?: boolean;
}

export function RegisterSelect({
  value,
  onChange,
  options,
  placeholder,
  required,
  includeStandard = true,
  disabled = false,
}: RegisterSelectProps) {
  const sortedOptions = useMemo(
    () => buildSelectOptions(options, [], value, includeStandard),
    [options, value, includeStandard],
  );

  return (
    <div className="doc-select-wrap">
      <select
        className="doc-input doc-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {sortedOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <span className="doc-select-chevron">
        <ChevronDown />
      </span>
    </div>
  );
}
