/** Map retired / typo domains to current team inboxes. */
const ALIASES: Record<string, string> = {
  'admin@darosims.com': 'admin@daros.com',
  'admins@daros.com': 'admin@daros.com',
  'daniel@darosims.com': 'daniel@daros.com',
  'daniel@darosapp.com': 'daniel@daros.com',
  'rodrigo@darosims.com': 'rodrigo@daros.com',
  'rodrigo@darosapp.com': 'rodrigo@daros.com',
};

export function normalizeTeamEmail(email: string | undefined | null): string | undefined {
  if (!email?.trim()) return undefined;
  const lower = email.trim().toLowerCase();
  return ALIASES[lower] ?? lower;
}