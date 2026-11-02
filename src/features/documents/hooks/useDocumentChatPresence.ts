import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../lib/api';
import { chatPresenceMatchesParticipant } from '../../../lib/documents/documentChatParticipants';
import type { DocumentChatPresenceView } from '../../../types/documentChatPresence';

const POLL_MS = 3_000;
const TYPING_DEBOUNCE_MS = 400;

export function useDocumentChatPresence(
  documentId: string,
  open: boolean,
  draft: string,
) {
  const [presence, setPresence] = useState<DocumentChatPresenceView[]>([]);
  const [presenceAvailable, setPresenceAvailable] = useState(true);
  const typingTimerRef = useRef<number | null>(null);
  const lastTypingRef = useRef(false);

  const refreshPresence = useCallback(async () => {
    try {
      const { presence: data, available } = await api.getDocumentChatPresence(documentId);
      setPresence(data);
      if (available === false) {
        setPresenceAvailable(false);
      } else {
        setPresenceAvailable(true);
      }
    } catch {
      setPresenceAvailable(false);
    }
  }, [documentId]);

  const sendPresence = useCallback(
    async (isTyping: boolean) => {
      try {
        const result = await api.postDocumentChatPresence(documentId, isTyping);
        if (result.available === false) {
          setPresenceAvailable(false);
        }
      } catch {
        setPresenceAvailable(false);
      }
    },
    [documentId],
  );

  useEffect(() => {
    if (!open) return;

    void sendPresence(false);
    void refreshPresence();

    const pollId = window.setInterval(() => {
      void sendPresence(lastTypingRef.current);
      void refreshPresence();
    }, POLL_MS);

    return () => {
      window.clearInterval(pollId);
      void sendPresence(false);
    };
  }, [open, documentId, refreshPresence, sendPresence]);

  useEffect(() => {
    if (!open) return;

    const isTyping = draft.trim().length > 0;
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = window.setTimeout(() => {
      lastTypingRef.current = isTyping;
      void sendPresence(isTyping);
      void refreshPresence();
    }, TYPING_DEBOUNCE_MS);

    return () => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, [draft, open, sendPresence, refreshPresence]);

  const typingUsers = presence.filter((entry) => entry.isTyping);

  function isUserOnline(email: string, name: string): boolean {
    const person = { email, name };
    return presence.some((entry) => chatPresenceMatchesParticipant(entry, person));
  }

  return { presence, typingUsers, isUserOnline, presenceAvailable, refreshPresence };
}
