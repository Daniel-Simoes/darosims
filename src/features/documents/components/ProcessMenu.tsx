import { PROCESSES } from '../../../data/processes';
import { OptionPickerMenu } from './OptionPickerMenu';

interface ProcessMenuProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  customOptions?: string[];
  onAddCustomOption?: (label: string) => void;
  includeStandardOption?: boolean;
}

export function ProcessMenu({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select process',
  customOptions = [],
  onAddCustomOption,
  includeStandardOption,
}: ProcessMenuProps) {
  return (
    <OptionPickerMenu
      panelLabel="Process"
      value={value}
      onChange={onChange}
      options={PROCESSES}
      customOptions={customOptions}
      onAddCustomOption={onAddCustomOption}
      disabled={disabled}
      placeholder={placeholder}
      includeStandardOption={includeStandardOption}
    />
  );
}
