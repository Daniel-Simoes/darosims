import { useMemo, useState } from 'react';
import { useDocumentFieldOptions } from '../../../hooks/useDocumentFieldOptions';
import { parseDistributionDepartments } from '../../../data/documentFieldDefaults';
import {
  joinDistributionIndividuals,
  parseDistributionIndividuals,
} from '../../../lib/documents/distributionAccess';
import { AddDistributionRecipientDialog } from '../../../components/dialogs/AddDistributionRecipientDialog';
import './DocumentDetailView.css';

interface DocumentDistributionAccessFieldProps {
  departments: string;
  individuals: string;
  teamNames: string[];
  onDepartmentsChange: (value: string) => void;
  onIndividualsChange: (value: string) => void;
  disabled?: boolean;
}

function joinDepartments(values: string[]): string {
  return values
    .map((v) => v.trim())
    .filter(Boolean)
    .join(', ');
}

export function DocumentDistributionAccessField({
  departments,
  individuals,
  teamNames,
  onDepartmentsChange,
  onIndividualsChange,
  disabled = false,
}: DocumentDistributionAccessFieldProps) {
  const selectedDepartments = useMemo(() => parseDistributionDepartments(departments), [departments]);
  const selectedIndividuals = useMemo(() => parseDistributionIndividuals(individuals), [individuals]);
  const { options } = useDocumentFieldOptions('distribution_department', selectedDepartments[0]);
  const [dialogOpen, setDialogOpen] = useState(false);

  function toggleDepartment(option: string) {
    const next = selectedDepartments.includes(option)
      ? selectedDepartments.filter((item) => item !== option)
      : [...selectedDepartments, option];
    onDepartmentsChange(joinDepartments(next));
  }

  function removeIndividual(name: string) {
    const next = selectedIndividuals.filter((item) => item !== name);
    onIndividualsChange(joinDistributionIndividuals(next));
  }

  function handleAddDepartment(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next = selectedDepartments.includes(trimmed)
      ? selectedDepartments
      : [...selectedDepartments, trimmed];
    onDepartmentsChange(joinDepartments(next));
  }

  function handleAddIndividuals(names: string[]) {
    const merged = [...selectedIndividuals];
    for (const name of names) {
      if (!merged.some((item) => item.toLowerCase() === name.toLowerCase())) {
        merged.push(name);
      }
    }
    onIndividualsChange(joinDistributionIndividuals(merged));
  }

  return (
    <div className="dd-field-multi dd-distribution-access">
      <p className="dd-distribution-section-label">Departments</p>
      <div className="dd-multi-options" role="group" aria-label="Departments">
        {options.map((option) => (
          <label key={option} className="dd-multi-option">
            <input
              type="checkbox"
              checked={selectedDepartments.includes(option)}
              disabled={disabled}
              onChange={() => toggleDepartment(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>

      {selectedIndividuals.length > 0 ? (
        <>
          <p className="dd-distribution-section-label">Individual access</p>
          <ul className="dd-distribution-people">
            {selectedIndividuals.map((person) => (
              <li key={person} className="dd-distribution-person-chip">
                <span>{person}</span>
                {!disabled ? (
                  <button
                    type="button"
                    className="dd-distribution-person-remove"
                    onClick={() => removeIndividual(person)}
                    aria-label={`Remove ${person}`}
                  >
                    ×
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {!disabled ? (
        <button
          type="button"
          className="dd-btn dd-btn-outline dd-multi-add-btn"
          onClick={() => setDialogOpen(true)}
        >
          Add
        </button>
      ) : null}

      <AddDistributionRecipientDialog
        open={dialogOpen}
        teamNames={teamNames}
        onClose={() => setDialogOpen(false)}
        onAddDepartment={handleAddDepartment}
        onAddIndividuals={handleAddIndividuals}
      />
    </div>
  );
}