import type { DocumentRecord } from '../../types/documents';
import type { DocumentCommentMessage } from '../../types/documentComments';
import { buildDocumentChatParticipants } from './documentChatParticipants';

export type ChatPeer = {
  name: string;
  email: string;
  photoUrl?: string;
};

type TeamUser = { name: string; email: string; photoUrl?: string };

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isCurrentUser(
  peer: { name: string; email: string },
  current: { email: string; name: string },
): boolean {
  const currentEmail = normalizeEmail(current.email);
  if (peer.email && normalizeEmail(peer.email) === currentEmail) return true;
  return peer.name.trim().toLowerCase() === current.name.trim().toLowerCase();
}

function withPhoto(peer: { name: string; email: string }, teamUsers: TeamUser[]): ChatPeer {
  const match = teamUsers.find(
    (user) =>
      (peer.email && normalizeEmail(user.email) === normalizeEmail(peer.email)) ||
      user.name.trim().toLowerCase() === peer.name.trim().toLowerCase(),
  );
  return {
    name: match?.name ?? peer.name,
    email: match?.email ?? peer.email,
    photoUrl: match?.photoUrl,
  };
}

/** Other people in the thread (excluding the signed-in user). */
export function getOtherChatPeers(
  document: DocumentRecord,
  messages: DocumentCommentMessage[],
  currentUser: { email: string; name: string },
  teamUsers: TeamUser[],
): ChatPeer[] {
  const peers: ChatPeer[] = [];
  const seen = new Set<string>();

  function addPeer(name: string, email: string) {
    const candidate = withPhoto({ name, email }, teamUsers);
    if (isCurrentUser(candidate, currentUser)) return;
    const key = candidate.email || candidate.name.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    peers.push(candidate);
  }

  for (const participant of buildDocumentChatParticipants(document, messages, teamUsers)) {
    addPeer(participant.name, participant.email);
  }

  for (const message of messages) {
    addPeer(message.senderName, message.senderEmail);
  }

  return peers;
}
