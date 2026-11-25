import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDocumentFieldOptions } from '../../hooks/useDocumentFieldOptions';
import './ConfirmDialog.css';
import './AddDistributionRecipientDialog.css';

type RecipientMode = 'choose' | 'department' | 'individual';

interface AddDistributionRecipientDialogProps {
  open: boolean;
  teamNames: string[];
  onClose: () => void;
  onAddDepartment: (name: string) => Promise<void> | void;
  onAddIndividuals: (names: string[]) => void;
}

export function AddDistributionRecipientDialog({
  open,
  teamNames,
  onClose,
  onAddDepartment,
  onAddIndividuals,
}: AddDistributionRecipientDialogProps) {
  const [mode, setMode] = useState<RecipientMode>('choose');
  const [departmentName, setDepartmentName] = useState('');
  const [savingDept, setSavingDept] = useState(false);
  const [deptError, setDeptError] = useState('');
  const [individualRows, setIndividualRows] = useState<string[]>(['']);
  const [individualError, setIndividualError] = useState('');
  const { addOption } = useDocumentFieldOptions('distribution_department');

  useEffect(() => {
    if (!open) return;
    setMode('choose');
    setDepartmentName('');
    setDeptError('');
    setIndividualRows(['']);
    setIndividualError('');
    setSavingDept(false);
  }, [open]);

  if (!open) return null;

  function handleClose() {
    onClose();
  }

  async function handleConfirmDepartment() {
    const trimmed = departmentName.trim();
    if (!trimmed) {
      setDeptError('Enter a department name.');
      return;
    }
    setSavingDept(true);
    setDeptError('');
    try {
      await addOption(trimmed);
      await onAddDepartment(trimmed);
      handleClose();
    } catch (err) {
      setDeptError(err instanceof Error ? err.message : 'Could not save department');
    } finally {
      setSavingDept(false);
    }
  }

  function handleConfirmIndividuals() {
    const names = individualRows.map((row) => row.trim()).filter(Boolean);
    const unique = names.filter(
      (name, index) => names.findIndex((n) => n.toLowerCase() === name.toLowerCase()) === index,
    );
    if (unique.length === 0) {
      setIndividualError('Add at least one person.');
      return;
    }
    onAddIndividuals(unique);
    handleClose();
  }

  return createPortal(
    <div className="confirm-dialog-overlay" onClick={handleClose}>
      <div
        className="confirm-dialog add-recipient-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-recipient-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-recipient-title" className="confirm-dialog-title">
          {mode === 'choose'
            ? 'Add recipient'
            : mode === 'department'
              ? 'Add department'
              : 'Add individual access'}
        </h2>

        {mode === 'choose' ? (
          <>
            <p className="confirm-dialog-message">
              Who should receive this document?
            </p>
            <div className="add-recipient-choices">
              <button
                type="button"
                className="confirm-dialog-btn confirm-dialog-btn-primary add-recipient-choice"
                onClick={() => setMode('department')}
              >
                Department
              </button>
              <button
                type="button"
                className="confirm-dialog-btn confirm-dialog-btn-outline add-recipient-choice"
                onClick={() => setMode('individual')}
              >
                Individual access
              </button>
            </div>
            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="confirm-dialog-btn confirm-dialog-btn-outline"
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </>
        ) : null}

        {mode === 'department' ? (
          <>
            <p className="confirm-dialog-message">Enter the department name to add.</p>
            <input
              className="dd-input add-recipient-input"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="Department name..."
              disabled={savingDept}
            />
            {deptError ? <p className="dd-revision-file-error">{deptError}</p> : null}
            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="confirm-dialog-btn confirm-dialog-btn-outline"
                onClick={() => setMode('choose')}
                disabled={savingDept}
              >
                Back
              </button>
              <button
                type="button"
                className="confirm-dialog-btn confirm-dialog-btn-primary"
                onClick={() => void handleConfirmDepartment()}
                disabled={savingDept}
              >
                {savingDept ? 'Saving...' : 'Add'}
              </button>
            </div>
          </>
        ) : null}

        {mode === 'individual' ? (
          <>
            <p className="confirm-dialog-message">
              Select or type one or more people with individual access.
            </p>
            <div className="add-recipient-individuals">
              {individualRows.map((row, index) => (
                <div key={index} className="add-recipient-individual-row">
                  <input
                    className="dd-input"
                    list="add-recipient-team-names"
                    value={row}
                    onChange={(e) => {
                      setIndividualRows((prev) => {
                        const next = [...prev];
                        next[index] = e.target.value;
                        return next;
                      });
                    }}
                    placeholder="Person name..."
                  />
                  {individualRows.length > 1 ? (
                    <button
                      type="button"
                      className="add-recipient-remove"
                      onClick={() =>
                        setIndividualRows((prev) => prev.filter((_, i) => i !== index))
                      }
                      aria-label="Remove person"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <datalist id="add-recipient-team-names">
              {teamNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <button
              type="button"
              className="dd-btn dd-btn-outline add-recipient-more"
              onClick={() => setIndividualRows((prev) => [...prev, ''])}
            >
              + Add another person
            </button>
            {individualError ? <p className="dd-revision-file-error">{individualError}</p> : null}
            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="confirm-dialog-btn confirm-dialog-btn-outline"
                onClick={() => setMode('choose')}
              >
                Back
              </button>
              <button
                type="button"
                className="confirm-dialog-btn confirm-dialog-btn-primary"
                onClick={handleConfirmIndividuals}
              >
                Add
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}