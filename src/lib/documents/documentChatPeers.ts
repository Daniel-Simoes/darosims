import type { DocumentRecord } from '../../types/documents';
import type { DocumentCommentMessage } from '../../types/documentComments';
import {
  buildDocumentChatParticipants,
  isChatParticipantCurrentUser,
} from './documentChatParticipants';

export type ChatPeer = {
  name: string;
  email: string;
  photoUrl?: string;
};

type TeamUser = { name: string; email: string; photoUrl?: string };

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
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

  function addPeer(name: string, email: string, role?: Parameters<typeof isChatParticipantCurrentUser>[0]['role']) {
    const candidate = withPhoto({ name, email }, teamUsers);
    if (isChatParticipantCurrentUser({ ...candidate, role }, currentUser, document)) return;
    const key = candidate.email || candidate.name.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    peers.push(candidate);
  }

  for (const participant of buildDocumentChatParticipants(document, messages, teamUsers)) {
    addPeer(participant.name, participant.email, participant.role);
  }

  for (const message of messages) {
    addPeer(message.senderName, message.senderEmail, 'chat_starter');
  }

  return peers;
}
