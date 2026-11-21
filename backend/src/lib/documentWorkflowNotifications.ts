import { resolveDesignatedApproverEmail } from '@/lib/documentApproval';
import { resolveDocumentOwnerEmail } from '@/lib/documentOwnership';
import { normalizeTeamEmail } from '@/lib/legacyEmails';
import type { DocumentRecord } from '@/types';

export function normalizedUserEmail(email: string | null | undefined): string | undefined {
  if (!email?.trim()) return undefined;
  return normalizeTeamEmail(email.trim()) ?? email.trim().toLowerCase();
}

export function isSameUserEmail(
  left: string | undefined,
  right: string | undefined,
): boolean {
  const a = normalizedUserEmail(left);
  const b = normalizedUserEmail(right);
  return Boolean(a && b && a === b);
}

/** Creator is both reviewer (owner) and final approver — no outbound notifications. */
export async function isSelfServiceDocumentWorkflow(
  document: Pick<DocumentRecord, 'createdBy' | 'owner' | 'approver'>,
): Promise<boolean> {
  const creator = normalizedUserEmail(document.createdBy);
  if (!creator) return false;

  const ownerEmail = normalizedUserEmail(await resolveDocumentOwnerEmail(document.owner));
  const approverEmail = normalizedUserEmail(await resolveDesignatedApproverEmail(document));

  if (!ownerEmail || !approverEmail) return false;
  return creator === ownerEmail && ownerEmail === approverEmail;
}

export function shouldNotifyUser(
  recipientEmail: string | undefined,
  actorEmail: string | undefined,
): recipientEmail is string {
  if (!recipientEmail?.trim()) return false;
  return !isSameUserEmail(recipientEmail, actorEmail);
}