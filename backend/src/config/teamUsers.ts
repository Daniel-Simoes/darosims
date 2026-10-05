/** Emails allowed to approve / reject internal documents (matches seeded demo users). */
export const TEAM_APPROVER_EMAILS = ['daniel@daros.com', 'rodrigo@daros.com'] as const;

export function isTeamApproverEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return TEAM_APPROVER_EMAILS.some((entry) => entry === normalized);
}
