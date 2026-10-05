import { useEffect, useMemo, useRef, useState } from 'react';
import { buildSelectOptions, STANDARD_OPTION } from '../utils/selectOptions';
import './DocumentTypeMenu.css';

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export interface OptionPickerMenuProps {
  panelLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  customOptions?: string[];
  onAddCustomOption?: (label: string) => void;
  disabled?: boolean;
  placeholder?: string;
  allowCustom?: boolean;
  addCustomLabel?: string;
  includeStandardOption?: boolean;
}

export function OptionPickerMenu({
  panelLabel,
  value,
  onChange,
  options,
  customOptions = [],
  onAddCustomOption,
  disabled = false,
  placeholder = 'Select…',
  allowCustom = true,
  addCustomLabel = 'Add your own…',
  includeStandardOption = true,
}: OptionPickerMenuProps) {
  const [open, setOpen] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customDraft, setCustomDraft] = useState('');
  const [customError, setCustomError] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const sortedOptions = useMemo(
    () => buildSelectOptions(options, customOptions, value, includeStandardOption),
    [options, customOptions, value, includeStandardOption],
  );

  const listOptions = useMemo(
    () =>
      includeStandardOption
        ? sortedOptions.filter((opt) => opt !== STANDARD_OPTION)
        : sortedOptions,
    [sortedOptions, includeStandardOption],
  );

  useEffect(() => {
    if (!open) {
      setAddingCustom(false);
      setCustomDraft('');
      setCustomError('');
      return;
    }

    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (addingCustom) {
      customInputRef.current?.focus();
    }
  }, [addingCustom]);

  function commitCustomOption() {
    const label = customDraft.trim();
    if (!label) {
      setCustomError('Enter a name.');
      return;
    }

    const exists = [...listOptions, ...(includeStandardOption ? [STANDARD_OPTION] : [])].some(
      (opt) => opt.toLowerCase() === label.toLowerCase(),
    );
    if (exists) {
      setCustomError('This option already exists.');
      return;
    }

    onAddCustomOption?.(label);
    onChange(label);
    setOpen(false);
  }

  return (
    <div className={`dt-menu-wrap ${disabled ? 'disabled' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className={`dt-menu-trigger ${open ? 'open' : ''}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? 'dt-menu-value' : 'dt-menu-placeholder'}>
          {value || placeholder}
        </span>
        <ChevronDown />
      </button>

      {open && (
        <div className="dt-menu-panel" role="listbox" aria-label={panelLabel}>
          <div className="dt-menu-panel-head">{panelLabel}</div>
          <ul className="dt-menu-list">
            {allowCustom && onAddCustomOption ? (
              <li className="dt-menu-add-wrap dt-menu-add-wrap-first">
                {!addingCustom ? (
                  <button
                    type="button"
                    className="dt-menu-item dt-menu-add-trigger"
                    onClick={() => {
                      setAddingCustom(true);
                      setCustomError('');
                    }}
                  >
                    {addCustomLabel}
                  </button>
                ) : (
                  <div className="dt-menu-add-form">
                    <input
                      ref={customInputRef}
                      type="text"
                      className="dt-menu-add-input"
                      value={customDraft}
                      placeholder="Type new option"
                      onChange={(e) => {
                        setCustomDraft(e.target.value);
                        setCustomError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          commitCustomOption();
                        }
                      }}
                    />
                    {customError ? <p className="dt-menu-add-error">{customError}</p> : null}
                    <div className="dt-menu-add-actions">
                      <button type="button" className="dt-menu-add-btn" onClick={commitCustomOption}>
                        Add
                      </button>
                      <button
                        type="button"
                        className="dt-menu-add-btn dt-menu-add-btn-ghost"
                        onClick={() => {
                          setAddingCustom(false);
                          setCustomDraft('');
                          setCustomError('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ) : null}
            {includeStandardOption ? (
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === STANDARD_OPTION}
                  className={`dt-menu-item dt-menu-standard ${value === STANDARD_OPTION ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(STANDARD_OPTION);
                    setOpen(false);
                  }}
                >
                  {STANDARD_OPTION}
                </button>
              </li>
            ) : null}
            {listOptions.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === option}
                  className={`dt-menu-item ${value === option ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
