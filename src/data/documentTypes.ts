export const DOCUMENT_TYPES = [
  'Policy Manual',
  'Procedure',
  'Standard Operating Procedure (SOP)',
  'Work Instruction',
  'Form',
  'Record',
  'Register',
  'Checklist',
  'FlowChart',
  'Process Map',
  'Plan',
  'Report',
  'Specification',
  'Catalog',
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export function isDocumentType(value: string): value is DocumentType {
  return (DOCUMENT_TYPES as readonly string[]).includes(value);
}

/** Prefix used in document codes, e.g. Policy Manual → PM */
export const TYPE_PREFIX: Record<string, string> = {
  'Policy Manual': 'PM',
  Procedure: 'PR',
  'Standard Operating Procedure (SOP)': 'SOP',
  'Work Instruction': 'WI',
  Form: 'FR',
  Record: 'REC',
  Register: 'REG',
  Checklist: 'CHK',
  FlowChart: 'FC',
  'Process Map': 'PMAP',
  Plan: 'PL',
  Report: 'RP',
  Specification: 'SP',
  Catalog: 'CAT',
  Standard: 'STD',
  SOP: 'SOP',
  Policy: 'PM',
};

const legacyBadgeClass: Record<string, string> = {
  SOP: 'badge-sop',
  Policy: 'badge-policy',
};

export function documentTypeBadgeClass(type: string): string {
  const map: Partial<Record<DocumentType, string>> = {
    'Policy Manual': 'badge-policy',
    Procedure: 'badge-procedure',
    'Standard Operating Procedure (SOP)': 'badge-sop',
    'Work Instruction': 'badge-wi',
    Form: 'badge-form',
    Record: 'badge-record',
    Register: 'badge-register',
    Checklist: 'badge-checklist',
    FlowChart: 'badge-flowchart',
    'Process Map': 'badge-process-map',
    Plan: 'badge-plan',
    Report: 'badge-report',
    Specification: 'badge-specification',
    Catalog: 'badge-catalog',
  };

  return map[type as DocumentType] ?? legacyBadgeClass[type] ?? 'badge-default';
}
