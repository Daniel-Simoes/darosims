import { useState } from 'react';
import { useDocumentFieldOptions } from '../../../hooks/useDocumentFieldOptions';
import type { DocumentFieldOptionCategory } from '../../../data/documentFieldDefaults';
import './DocumentDetailView.css';

const ADD_VALUE = '__add_new__';

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

interface DocumentFieldSelectWithAddProps {
  category: DocumentFieldOptionCategory;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DocumentFieldSelectWithAdd({
  category,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
}: DocumentFieldSelectWithAddProps) {
  const { options, addOption } = useDocumentFieldOptions(category, value);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState('');

  function handleSelectChange(next: string) {
    if (next === ADD_VALUE) {
      setAdding(true);
      setAddError('');
      return;
    }
    onChange(next);
  }

  async function handleSaveNewOption() {
    const trimmed = newLabel.trim();
    if (!trimmed) {
      setAddError('Enter a name for the new option.');
      return;
    }
    setSaving(true);
    setAddError('');
    try {
      const saved = await addOption(trimmed);
      onChange(saved);
      setNewLabel('');
      setAdding(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Could not save option');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dd-field-select-add">
      <div className="doc-select-wrap">
        <select
          className="dd-input doc-select"
          value={value}
          onChange={(e) => handleSelectChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value={ADD_VALUE}>+ Add new...</option>
        </select>
        <span className="doc-select-chevron">
          <ChevronDown />
        </span>
      </div>

      {adding ? (
        <div className="dd-field-add-row">
          <input
            className="dd-input"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Type the new option..."
            disabled={saving}
          />
          <button
            type="button"
            className="dd-btn dd-btn-outline"
            onClick={() => void handleSaveNewOption()}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Add'}
          </button>
          <button
            type="button"
            className="dd-btn dd-btn-outline"
            onClick={() => {
              setAdding(false);
              setNewLabel('');
              setAddError('');
            }}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      ) : null}
      {addError ? <p className="dd-revision-file-error">{addError}</p> : null}
    </div>
  );
}