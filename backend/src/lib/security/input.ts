const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

export function parseBoundedString(raw: unknown, maxLen: number): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  const value = String(raw).trim();
  if (!value) return undefined;
  if (value.length > maxLen) {
    throw new Error(`Value exceeds maximum length of ${maxLen}`);
  }
  return value;
}

export function assertHoneypotEmpty(raw: unknown, field = 'website') {
  if (typeof raw === 'string' && raw.trim()) {
    throw new Error(`Invalid ${field}`);
  }
}