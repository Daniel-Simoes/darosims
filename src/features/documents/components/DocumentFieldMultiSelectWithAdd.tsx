import { useMemo, useState } from 'react';
import { useDocumentFieldOptions } from '../../../hooks/useDocumentFieldOptions';
import {
  joinDistributionDepartments,
  parseDistributionDepartments,
  type DocumentFieldOptionCategory,
} from '../../../data/documentFieldDefaults';
import './DocumentDetailView.css';

interface DocumentFieldMultiSelectWithAddProps {
  category: DocumentFieldOptionCategory;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function DocumentFieldMultiSelectWithAdd({
  category,
  value,
  onChange,
  disabled = false,
}: DocumentFieldMultiSelectWithAddProps) {
  const selected = useMemo(() => parseDistributionDepartments(value), [value]);
  const { options, addOption } = useDocumentFieldOptions(
    category,
    selected[0],
  );
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState('');

  function toggleOption(option: string) {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onChange(joinDistributionDepartments(next));
  }

  async function handleSaveNewOption() {
    const trimmed = newLabel.trim();
    if (!trimmed) {
      setAddError('Enter a department name.');
      return;
    }
    setSaving(true);
    setAddError('');
    try {
      await addOption(trimmed);
      const next = selected.includes(trimmed) ? selected : [...selected, trimmed];
      onChange(joinDistributionDepartments(next));
      setNewLabel('');
      setAdding(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Could not save option');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dd-field-multi">
      <div className="dd-multi-options" role="group" aria-label="Departments">
        {options.map((option) => (
          <label key={option} className="dd-multi-option">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              disabled={disabled}
              onChange={() => toggleOption(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>

      {!adding ? (
        <button
          type="button"
          className="dd-btn dd-btn-outline dd-multi-add-btn"
          onClick={() => setAdding(true)}
          disabled={disabled}
        >
          + Add department
        </button>
      ) : (
        <div className="dd-field-add-row">
          <input
            className="dd-input"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Department name..."
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
      )}
      {addError ? <p className="dd-revision-file-error">{addError}</p> : null}
    </div>
  );
}