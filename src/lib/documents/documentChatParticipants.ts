import type { DocumentRecord } from '../../types/documents';
import type { DocumentChatParticipant, DocumentCommentMessage } from '../../types/documentComments';

type TeamUser = { name: string; email: string };

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function resolveEmail(value: string | undefined, teamUsers: TeamUser[]): string {
  if (!value?.trim()) return '';
  const byEmail = teamUsers.find((user) => normalizeEmail(user.email) === normalizeEmail(value));
  if (byEmail) return normalizeEmail(byEmail.email);
  const byName = teamUsers.find((user) => user.name.trim().toLowerCase() === value.trim().toLowerCase());
  if (byName) return normalizeEmail(byName.email);
  if (value.includes('@')) return normalizeEmail(value);
  return '';
}

function resolveName(value: string | undefined, teamUsers: TeamUser[]): string {
  if (!value?.trim()) return '';
  const byEmail = teamUsers.find((user) => normalizeEmail(user.email) === normalizeEmail(value));
  if (byEmail) return byEmail.name;
  const byName = teamUsers.find((user) => user.name.trim().toLowerCase() === value.trim().toLowerCase());
  if (byName) return byName.name;
  return value.trim();
}

function participantKey(email: string, name: string) {
  return email || name.trim().toLowerCase();
}

export function buildDocumentChatParticipants(
  document: DocumentRecord,
  messages: DocumentCommentMessage[],
  teamUsers: TeamUser[],
): DocumentChatParticipant[] {
  const participants: DocumentChatParticipant[] = [];
  const seen = new Set<string>();

  function addParticipant(
    emailRaw: string | undefined,
    nameRaw: string | undefined,
    role: DocumentChatParticipant['role'],
    roleLabel: string,
  ) {
    const email = resolveEmail(emailRaw, teamUsers) || resolveEmail(nameRaw, teamUsers);
    const name = resolveName(nameRaw, teamUsers) || resolveName(emailRaw, teamUsers);
    if (!name && !email) return;

    const key = participantKey(email, name);
    if (!key || seen.has(key)) return;
    seen.add(key);

    participants.push({
      id: key,
      name: name || email,
      email,
      role,
      roleLabel,
    });
  }

  const firstMessage = messages[0];
  if (firstMessage) {
    addParticipant(firstMessage.senderEmail, firstMessage.senderName, 'chat_starter', 'Started chat');
  }

  addParticipant(document.createdBy, document.createdBy, 'creator', 'Created document');

  if (document.owner?.trim()) {
    addParticipant(document.owner, document.owner, 'approver', 'Document owner');
  }

  if (document.approvedBy?.trim()) {
    addParticipant(document.approvedBy, document.approvedBy, 'approver', 'Approved document');
  }

  return participants;
}

/** True when this row is the signed-in user (creator by email, approver/owner by name). */
export function isChatParticipantCurrentUser(
  person: { name: string; email: string; role?: DocumentChatParticipant['role'] },
  currentUser: { email: string; name: string },
  document: DocumentRecord,
): boolean {
  const userEmail = normalizeEmail(currentUser.email);
  const userName = currentUser.name.trim().toLowerCase();
  const personEmail = person.email ? normalizeEmail(person.email) : '';
  const personName = person.name.trim().toLowerCase();

  if (personEmail && personEmail === userEmail) return true;
  if (personName && personName === userName) return true;

  const createdBy = document.createdBy?.trim();
  if (createdBy && normalizeEmail(createdBy) === userEmail) {
    if (person.role === 'creator' || personEmail === userEmail) return true;
  }

  const owner = document.owner?.trim().toLowerCase();
  const approvedBy = document.approvedBy?.trim().toLowerCase();
  if (owner === userName && (person.role === 'approver' || personName === owner)) return true;
  if (approvedBy === userName && (person.role === 'approver' || personName === approvedBy)) {
    return true;
  }

  return false;
}

/** People panel: everyone in the thread except the viewer. */
export function getChatParticipantsForViewer(
  document: DocumentRecord,
  messages: DocumentCommentMessage[],
  currentUser: { email: string; name: string } | null | undefined,
  teamUsers: TeamUser[],
): DocumentChatParticipant[] {
  const all = buildDocumentChatParticipants(document, messages, teamUsers);
  if (!currentUser?.email?.trim()) return all;
  return all.filter((person) => !isChatParticipantCurrentUser(person, currentUser, document));
}

export function getDocumentChatHeaderCode(document: DocumentRecord) {
  if (document.documentOrigin === 'External') {
    return document.externalRef?.trim() || 'External';
  }
  return document.code?.trim() || '—';
}
