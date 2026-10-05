import { createUserIfMissing } from '@/repositories/users/userRepository';

const DEFAULT_SEED_USERS = [
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
];

export async function ensureDefaultSeedUsers(): Promise<void> {
  for (const seed of DEFAULT_SEED_USERS) {
    await createUserIfMissing(seed);
  }
}
