/**
 * Controller details for legal pages and data-subject requests.
 * Update with official company information before commercial use.
 */
export const companyLegal = {
  legalName: 'Daros Software',
  tradeName: 'Daros IMS',
  domain: 'darosims.com',
  website: 'https://darosims.vercel.app',
  jurisdiction: 'European Union / applicable contract law',
  dpoEmail: 'privacidade@daros.com',
  privacyEmail: 'privacidade@daros.com',
  supportEmail: 'suporte@daros.com',
  addressLine: 'Registered business address — update before publication',
  registrationNote:
    'Tax / VAT / company registration number: publish when available.',
  dataRetentionSummary:
    'We keep only the data needed to provide the service, maintain security, and meet legal obligations, for the periods described in the Privacy Policy.',
  trackingPolicy:
    'We do not use advertising cookies or third-party marketing pixels on the public website. Only essential cookies and your cookie consent preference stored on your device.',
} as const;

export type DataSubjectRequestType =
  | 'access'
  | 'correction'
  | 'deletion'
  | 'portability'
  | 'revoke_consent'
  | 'anonymization'
  | 'information'
  | 'other';

/** @deprecated use DataSubjectRequestType */
export type LgpdRequestType = DataSubjectRequestType;

export const dataSubjectRequestTypeLabels: Record<DataSubjectRequestType, string> = {
  access: 'Confirmation of processing and access to my data',
  correction: 'Correction of incomplete or outdated data',
  deletion: 'Deletion of unnecessary or unlawfully processed data',
  portability: 'Portability of data to another provider',
  revoke_consent: 'Withdrawal of consent',
  anonymization: 'Anonymisation, blocking, or deletion',
  information: 'Information on entities we share data with',
  other: 'Other request under applicable privacy law',
};

export const lgpdRequestTypeLabels = dataSubjectRequestTypeLabels;