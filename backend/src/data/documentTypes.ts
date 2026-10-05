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
  SOP: 'SOP',
  Policy: 'PM',
};
