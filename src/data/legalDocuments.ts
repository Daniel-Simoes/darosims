import { companyLegal } from './companyLegal';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  summary: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const legalDocumentSlugs = [
  'privacy',
  'terms',
  'cookies',
  'refunds',
  'accessibility',
  'company-data',
  'legal-risks',
] as const;

export type LegalDocumentSlug = (typeof legalDocumentSlugs)[number];

/** Legacy Portuguese URLs → current English slugs */
export const legalSlugRedirects: Record<string, LegalDocumentSlug> = {
  privacidade: 'privacy',
  termos: 'terms',
  reembolso: 'refunds',
  acessibilidade: 'accessibility',
  'dados-empresa': 'company-data',
  'riscos-juridicos': 'legal-risks',
};

const lastUpdated = '21 November 2025';

export const legalDocuments: LegalDocument[] = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    summary:
      'How we process personal data in line with applicable privacy law (including LGPD where relevant) and good data protection practice.',
    lastUpdated,
    sections: [
      {
        heading: '1. Who we are',
        paragraphs: [
          `${companyLegal.tradeName} (${companyLegal.legalName}) is the controller of personal data processed on this website and in the application.`,
          `Privacy contact / DPO: ${companyLegal.privacyEmail}.`,
        ],
      },
      {
        heading: '2. Data minimisation',
        paragraphs: [
          'We collect only what we need for sign-in, document management, system notifications, support, and legal compliance.',
          'We do not sell personal data. We do not use institutional site data for advertising profiling.',
        ],
      },
      {
        heading: '3. Categories of data',
        paragraphs: [
          'Account: name, email, and access credentials (stored securely).',
          'Documents: metadata, uploaded files, approval history, and comments entered by authorised users.',
          'Technical: session records, IP address, and security events when required for service integrity.',
        ],
      },
      {
        heading: '4. Legal bases',
        paragraphs: [
          'Performance of a contract or steps before entering a contract (platform access).',
          'Compliance with legal or regulatory obligations (audit and quality management, where applicable).',
          'Legitimate interests for security, fraud prevention, and service improvement, balanced against your rights.',
          'Consent where we ask for it explicitly (e.g. data subject request form or non-essential cookies if we enable them later).',
        ],
      },
      {
        heading: '5. Sharing',
        paragraphs: [
          'Infrastructure providers (e.g. hosting and database) act as processors under contracts and security measures.',
          'Customer organisation data remains under the customer’s control; we do not use it for our own marketing.',
        ],
      },
      {
        heading: '6. Retention and security',
        paragraphs: [
          companyLegal.dataRetentionSummary,
          'Technical measures include authentication, role-based access, event logging, and encrypted transport (HTTPS).',
        ],
      },
      {
        heading: '7. Your rights',
        paragraphs: [
          'You may request confirmation of processing, access, correction, deletion, portability, information on sharing, and withdrawal of consent where applicable.',
          `Use the form at /legal/data-request or email ${companyLegal.privacyEmail}.`,
        ],
      },
      {
        heading: '8. International transfers',
        paragraphs: [
          'If data is processed outside your country, we use contractual and technical safeguards consistent with applicable law.',
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    summary: 'Conditions for using the Daros IMS platform.',
    lastUpdated,
    sections: [
      {
        heading: '1. Acceptance',
        paragraphs: [
          'By accessing or using the service, you agree to these Terms and the Privacy Policy.',
        ],
      },
      {
        heading: '2. Licence',
        paragraphs: [
          'We grant a limited, non-exclusive, revocable licence for internal use by the contracting organisation.',
          'Reverse engineering, unauthorised sublicensing, or unlawful use is prohibited.',
        ],
      },
      {
        heading: '3. Accounts and responsibility',
        paragraphs: [
          'Users must keep credentials confidential and are responsible for content they add to the platform.',
          'The organisation decides who may create, approve, or delete documents.',
        ],
      },
      {
        heading: '4. Availability',
        paragraphs: [
          'We aim for high availability, but the service is provided “as is” without guaranteeing any specific certification or audit outcome — that depends on the customer’s implementation.',
        ],
      },
      {
        heading: '5. Intellectual property',
        paragraphs: [
          'Software, branding, and site materials belong to Daros or its licensors.',
          'Content uploaded by the customer remains the customer’s property.',
        ],
      },
      {
        heading: '6. Suspension',
        paragraphs: [
          'We may suspend access in case of serious breach of these Terms, legal order, or security risk.',
        ],
      },
      {
        heading: '7. Governing law',
        paragraphs: [
          'Matters not covered by your commercial agreement are resolved under the law stated in that agreement or, if none, the law applicable to the controller’s registered office as listed under Company data.',
        ],
      },
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookie Notice',
    summary: companyLegal.trackingPolicy,
    lastUpdated,
    sections: [
      {
        heading: '1. What we use',
        paragraphs: [
          'Essential cookies: authentication and session security in the application.',
          'Local preference: storage of your choice on the cookie banner (daros_cookie_consent key).',
        ],
      },
      {
        heading: '2. What we do not use (current site)',
        paragraphs: [
          'We do not install Google Analytics, Meta Pixel, or other third-party marketing scripts by default.',
          'We do not show fabricated customer reviews or false satisfaction scores.',
        ],
      },
      {
        heading: '3. Managing consent',
        paragraphs: [
          'You can accept essentials only or read this notice at any time.',
          'Any future non-essential cookies will only be enabled with explicit consent.',
        ],
      },
    ],
  },
  {
    slug: 'refunds',
    title: 'Refund Policy',
    summary: 'Cancellation and refund conditions for subscriptions, where applicable.',
    lastUpdated,
    sections: [
      {
        heading: '1. Scope',
        paragraphs: [
          'This policy applies to commercial subscription agreements. Demo or free pilots are not charged.',
        ],
      },
      {
        heading: '2. Time limits',
        paragraphs: [
          'Refund requests must be sent in writing to the commercial contact within the period defined in your contract or, if none, within 7 days of the first charge where applicable law allows.',
        ],
      },
      {
        heading: '3. Exclusions',
        paragraphs: [
          'No pro-rata refund after the agreed period unless mandatory law or written agreement requires otherwise.',
          'Delivered services (training, dedicated implementation) follow the specific contract.',
        ],
      },
      {
        heading: '4. Processing',
        paragraphs: [
          'Approved refunds are returned via the original payment method within normal banking timeframes.',
        ],
      },
    ],
  },
  {
    slug: 'accessibility',
    title: 'Accessibility Statement',
    summary: 'Commitment to keyboard navigation, contrast, and perceivable content.',
    lastUpdated,
    sections: [
      {
        heading: '1. Goal',
        paragraphs: [
          'We aim to align the site and application with WCAG 2.1 Level AA good practice, as far as reasonable for our team size.',
        ],
      },
      {
        heading: '2. Measures in place',
        paragraphs: [
          'Alternative text (alt) on informative images; decorative images marked accordingly.',
          'Keyboard navigation with visible focus states.',
          'Landmarks (main, nav, footer) and a “skip to main content” link.',
          'Text and control contrast improved on main public areas.',
        ],
      },
      {
        heading: '3. Known limitations',
        paragraphs: [
          'Some complex dashboard components are still evolving; report barriers so we can prioritise fixes.',
        ],
      },
      {
        heading: '4. Contact',
        paragraphs: [
          `Send accessibility feedback to ${companyLegal.supportEmail} with the subject “Accessibility”.`,
        ],
      },
    ],
  },
  {
    slug: 'company-data',
    title: 'Company Information & Data Protection',
    summary: 'Controller identification and protection of corporate and customer data.',
    lastUpdated,
    sections: [
      {
        heading: '1. Identification',
        paragraphs: [
          `Legal name: ${companyLegal.legalName}`,
          `Trade name: ${companyLegal.tradeName}`,
          `Website: ${companyLegal.website}`,
          companyLegal.registrationNote,
          `Address: ${companyLegal.addressLine}`,
        ],
      },
      {
        heading: '2. Contacts',
        paragraphs: [
          `Privacy: ${companyLegal.privacyEmail}`,
          `Support: ${companyLegal.supportEmail}`,
        ],
      },
      {
        heading: '3. Protecting company and customer data',
        paragraphs: [
          'Logical environment separation, role-based access, and logging of sensitive events.',
          'Document data is available only to users authorised by the organisation.',
          'Backups and retention follow the commercial agreement and Privacy Policy.',
        ],
      },
      {
        heading: '4. Image credits',
        paragraphs: [
          'Site images are licensed or produced in-house. Unauthorised reproduction is prohibited.',
        ],
      },
    ],
  },
  {
    slug: 'legal-risks',
    title: 'Privacy & Legal Risk Overview',
    summary: 'High-level risks and mitigations — not legal advice.',
    lastUpdated,
    sections: [
      {
        heading: '1. Privacy (incl. LGPD)',
        paragraphs: [
          'Risk: processing without a legal basis or excessive data. Mitigation: minimal collection, purpose records, and a data-request channel.',
          'Risk: security incident. Mitigation: HTTPS, access control, monitoring, and incident response.',
          'Risk: data subject rights not met in time. Mitigation: request form and internal queue with privacy contact.',
        ],
      },
      {
        heading: '2. Intellectual property',
        paragraphs: [
          'Risk: misuse of brand or images. Mitigation: credits, declared copyright, and stock licensing.',
        ],
      },
      {
        heading: '3. Advertising and marketing',
        paragraphs: [
          'Risk: misleading claims or false metrics. Mitigation: no fake reviews; marketing stats labelled as illustrative where shown.',
        ],
      },
      {
        heading: '4. Contracts and refunds',
        paragraphs: [
          'Risk: commercial dispute. Mitigation: published Terms and Refund Policy aligned with the contract.',
        ],
      },
      {
        heading: '5. Accessibility',
        paragraphs: [
          'Risk: excluding users with disabilities. Mitigation: accessibility statement and continuous improvement.',
        ],
      },
      {
        heading: '6. Disclaimer',
        paragraphs: [
          'This document is informational. Consult qualified counsel for your jurisdiction and sector.',
        ],
      },
    ],
  },
];

export function resolveLegalSlug(slug: string): LegalDocumentSlug | undefined {
  if (isLegalDocumentSlug(slug)) return slug;
  const redirected = legalSlugRedirects[slug];
  if (redirected) return redirected;
  return undefined;
}

export function getLegalDocument(slug: string): LegalDocument | undefined {
  const resolved = resolveLegalSlug(slug);
  if (!resolved) return undefined;
  return legalDocuments.find((doc) => doc.slug === resolved);
}

export function isLegalDocumentSlug(slug: string): slug is LegalDocumentSlug {
  return (legalDocumentSlugs as readonly string[]).includes(slug);
}

export function isLegalSlugRedirectOnly(slug: string): boolean {
  return slug in legalSlugRedirects && !isLegalDocumentSlug(slug);
}