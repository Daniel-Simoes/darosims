import { images } from './images';

/** Image attribution for the marketing site (no fabricated ratings or metrics). */
export const imageCredits = [
  {
    id: 'hero-dashboard',
    src: images.heroDashboard,
    alt: 'Illustrative preview of the Daros dashboard',
    credit: 'Licensed stock image / internal Daros use',
    copyright: `© ${new Date().getFullYear()} Daros Software. All rights reserved.`,
  },
  {
    id: 'compliance-planning',
    src: images.compliancePlanning,
    alt: 'Team planning compliance activities',
    credit: 'Licensed stock image / internal Daros use',
    copyright: `© ${new Date().getFullYear()} Daros Software. All rights reserved.`,
  },
  {
    id: 'analytics',
    src: images.analytics,
    alt: 'Operational metrics analysis',
    credit: 'Licensed stock image / internal Daros use',
    copyright: `© ${new Date().getFullYear()} Daros Software. All rights reserved.`,
  },
  {
    id: 'modern-office',
    src: images.modernOffice,
    alt: 'Modern workplace',
    credit: 'Licensed stock image / internal Daros use',
    copyright: `© ${new Date().getFullYear()} Daros Software. All rights reserved.`,
  },
  {
    id: 'team-collaboration',
    src: images.teamCollaboration,
    alt: 'Collaboration on compliance work',
    credit: 'Licensed stock image / internal Daros use',
    copyright: `© ${new Date().getFullYear()} Daros Software. All rights reserved.`,
  },
  {
    id: 'workspace',
    src: images.workspace,
    alt: 'Workspace environment',
    credit: 'Licensed stock image / internal Daros use',
    copyright: `© ${new Date().getFullYear()} Daros Software. All rights reserved.`,
  },
] as const;