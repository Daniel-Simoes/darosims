export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
}

export interface SidebarSection {
  id: string;
  label: string;
  items: SidebarItem[];
}

export const dashboardSidebarSections: SidebarSection[] = [
  {
    id: 'document-control',
    label: 'Document Control',
    items: [
      { id: 'dashboard', label: 'Home', icon: 'home' },
      { id: 'document-register', label: 'New Document', icon: 'file' },
      { id: 'documents', label: 'Document Register', icon: 'clipboard' },
      { id: 'acknowledgements', label: 'My Acknowledgements', icon: 'check-circle' },
      { id: 'my-drafts', label: 'My Drafts', icon: 'file' },
      { id: 'notifications', label: 'Notifications', icon: 'bell' },
      { id: 'notification-history', label: 'Notification History', icon: 'clock' },
    ],
  },
  {
    id: 'quality',
    label: 'Quality',
    items: [
      { id: 'audits', label: 'Audits', icon: 'search' },
      { id: 'nonconformities', label: 'Nonconformities', icon: 'alert' },
      { id: 'capa', label: 'CAPA', icon: 'shield' },
      { id: 'risks', label: 'Risk Management', icon: 'alert-triangle' },
    ],
  },
  {
    id: 'training',
    label: 'Training',
    items: [
      { id: 'training-matrix', label: 'Training Matrix', icon: 'grid' },
      { id: 'training-records', label: 'Training Records', icon: 'book' },
    ],
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    items: [
      { id: 'suppliers', label: 'Suppliers', icon: 'truck' },
      { id: 'evaluations', label: 'Evaluations', icon: 'star' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'reports', label: 'Reports', icon: 'bar-chart' },
      { id: 'dashboards', label: 'Dashboards', icon: 'layout' },
    ],
  },
];

export const documentViews = ['document-register', 'documents', 'my-drafts'];

export const documentPageTitles: Record<string, string> = {
  'document-register': 'New Document',
  documents: 'Document Register',
  'my-drafts': 'My Drafts',
  notifications: 'Notifications',
  'notification-history': 'Notification History',
};
