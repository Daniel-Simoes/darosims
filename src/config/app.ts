export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  appName: 'Daros IMS',
  /** Default company shown in the header until multi-tenant company API is available */
  company: {
    id: 'daros',
    name: 'Daros',
    logoUrl: undefined as string | undefined,
  },
} as const;
