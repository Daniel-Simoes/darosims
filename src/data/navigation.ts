export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavSection {
  title: string;
  links: NavLink[];
}

export interface NavItem {
  label: string;
  href?: string;
  sections?: NavSection[];
}

export const mainNavigation: NavItem[] = [
  {
    label: 'Platform',
    sections: [
      {
        title: 'Core Modules',
        links: [
          {
            label: 'Process Management',
            href: '/platform/process-management',
            description: 'Map and monitor business workflows',
          },
          {
            label: 'Document Management',
            href: '/platform/document-management',
            description: 'Centralised document control',
          },
          {
            label: 'Risk Management',
            href: '/platform/risk-management',
            description: 'Identify and mitigate risks',
          },
          {
            label: 'Audits',
            href: '/platform/audits',
            description: 'Plan and track internal audits',
          },
        ],
      },
      {
        title: 'Compliance',
        links: [
          {
            label: 'Nonconformities',
            href: '/platform/nonconformities',
            description: 'Track issues and corrective actions',
          },
          {
            label: 'Supplier Management',
            href: '/platform/supplier-management',
            description: 'Manage third-party compliance',
          },
          {
            label: 'KPIs & Analytics',
            href: '/platform/kpis-analytics',
            description: 'Measure operational performance',
          },
          {
            label: 'Continual Improvement',
            href: '/platform/continual-improvement',
            description: 'Drive ongoing enhancements',
          },
        ],
      },
    ],
  },
  {
    label: 'Solutions',
    sections: [
      {
        title: 'By Standard',
        links: [
          {
            label: 'ISO 9001',
            href: '/solutions/iso-9001',
            description: 'Quality management systems',
          },
          {
            label: 'ISO 14001',
            href: '/solutions/iso-14001',
            description: 'Environmental management',
          },
          {
            label: 'ISO 45001',
            href: '/solutions/iso-45001',
            description: 'Occupational health & safety',
          },
          {
            label: 'ISO 22000',
            href: '/solutions/iso-22000',
            description: 'Food safety management',
          },
        ],
      },
      {
        title: 'By Industry',
        links: [
          {
            label: 'Manufacturing',
            href: '/solutions/manufacturing',
            description: 'Quality and process control',
          },
          {
            label: 'Food & Beverage',
            href: '/solutions/food-beverage',
            description: 'HACCP and food safety',
          },
          {
            label: 'Professional Services',
            href: '/solutions/professional-services',
            description: 'Compliance for SMEs',
          },
          {
            label: 'Healthcare',
            href: '/solutions/healthcare',
            description: 'Safety and quality standards',
          },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    sections: [
      {
        title: 'Learn',
        links: [
          {
            label: 'Documentation',
            href: '/resources/documentation',
            description: 'Platform guides and API reference',
          },
          { label: 'Blog', href: '/resources/blog', description: 'Compliance insights and updates' },
          {
            label: 'Webinars',
            href: '/resources/webinars',
            description: 'Live sessions and recordings',
          },
          {
            label: 'Case Studies',
            href: '/resources/case-studies',
            description: 'Customer success stories',
          },
        ],
      },
      {
        title: 'Support',
        links: [
          {
            label: 'Help Centre',
            href: '/resources/help-centre',
            description: 'FAQs and troubleshooting',
          },
          {
            label: 'Community',
            href: '/resources/community',
            description: 'Connect with other users',
          },
          {
            label: 'Training',
            href: '/resources/training',
            description: 'Onboarding and certification',
          },
          { label: 'Status', href: '/resources/status', description: 'Platform uptime and incidents' },
        ],
      },
    ],
  },
  {
    label: 'Company',
    sections: [
      {
        title: 'About Daros',
        links: [
          {
            label: 'Our Mission',
            href: '/company/our-mission',
            description: 'Why we built Daros',
          },
          {
            label: 'Core Values',
            href: '/company/core-values',
            description: 'What drives our team',
          },
          { label: 'Careers', href: '/company/careers', description: 'Join our growing team' },
          { label: 'Contact', href: '/company/contact', description: 'Get in touch with us' },
        ],
      },
      {
        title: 'Roadmap',
        links: [
          {
            label: 'Product Updates',
            href: '/company/product-updates',
            description: 'Latest features and releases',
          },
          {
            label: 'Beta Programme',
            href: '/company/beta-programme',
            description: 'Early access for pilot customers',
          },
          {
            label: 'Partners',
            href: '/company/partners',
            description: 'Integration and reseller network',
          },
          { label: 'Press', href: '/company/press', description: 'News and media resources' },
        ],
      },
    ],
  },
];

export const footerNavigation = {
  platform: [
    { label: 'Process Management', href: '/platform/process-management' },
    { label: 'Document Management', href: '/platform/document-management' },
    { label: 'Risk Management', href: '/platform/risk-management' },
    { label: 'Audits', href: '/platform/audits' },
  ],
  solutions: [
    { label: 'ISO 9001', href: '/solutions/iso-9001' },
    { label: 'ISO 14001', href: '/solutions/iso-14001' },
    { label: 'ISO 45001', href: '/solutions/iso-45001' },
    { label: 'ISO 22000', href: '/solutions/iso-22000' },
  ],
  resources: [
    { label: 'Documentation', href: '/resources/documentation' },
    { label: 'Blog', href: '/resources/blog' },
    { label: 'Help Centre', href: '/resources/help-centre' },
    { label: 'Training', href: '/resources/training' },
  ],
  company: [
    { label: 'About', href: '/company/our-mission' },
    { label: 'Careers', href: '/company/careers' },
    { label: 'Contact', href: '/company/contact' },
    { label: 'Press', href: '/company/press' },
  ],
};
