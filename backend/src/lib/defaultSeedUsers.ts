export const DEFAULT_SEED_USERS = [
  {
    email: 'daniel@daros.com',
    password: '1234',
    role: 'admin' as const,
    firstName: 'Daniel',
    lastName: '',
  },
  {
    email: 'rodrigo@daros.com',
    password: '1234',
    role: 'admin' as const,
    firstName: 'Rodrigo',
    lastName: '',
  },
  {
    email: 'admin@daros.com',
    password: '1234',
    role: 'admin' as const,
    firstName: 'Admin',
    lastName: '',
  },
] as const;
