import { DOCUMENT_TYPES } from '../../../data/documentTypes';
import { OptionPickerMenu } from './OptionPickerMenu';

interface DocumentTypeMenuProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  customOptions?: string[];
  onAddCustomOption?: (label: string) => void;
  includeStandardOption?: boolean;
}

export function DocumentTypeMenu({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select document type',
  customOptions = [],
  onAddCustomOption,
  includeStandardOption,
}: DocumentTypeMenuProps) {
  return (
    <OptionPickerMenu
      panelLabel="Document Type"
      value={value}
      onChange={onChange}
      options={DOCUMENT_TYPES}
      customOptions={customOptions}
      onAddCustomOption={onAddCustomOption}
      disabled={disabled}
      placeholder={placeholder}
      includeStandardOption={includeStandardOption}
    />
  );
}
