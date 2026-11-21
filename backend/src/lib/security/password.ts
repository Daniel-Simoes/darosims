import bcrypt from 'bcryptjs';

const BCRYPT_PREFIX = '$2';
const ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

export function isPasswordHash(value: string): boolean {
  return value.startsWith(BCRYPT_PREFIX);
}

export async function hashPassword(plain: string): Promise<string> {
  if (plain.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  return bcrypt.hash(plain, ROUNDS);
}

/** @internal Dev seed may use shorter passwords; not for user-facing changes. */
export async function hashPasswordDev(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (isPasswordHash(stored)) {
    return bcrypt.compare(plain, stored);
  }
  // Legacy plaintext (local JSON / old Supabase rows) — compare then caller should rehash.
  return stored === plain;
}

export function assertPasswordPolicy(plain: string) {
  if (plain.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
}