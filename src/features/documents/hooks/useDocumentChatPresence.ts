import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../lib/api';
import type { DocumentChatPresenceView } from '../../../types/documentChatPresence';

const POLL_MS = 3_000;
const HEARTBEAT_MS = 20_000;
const TYPING_DEBOUNCE_MS = 400;

export function useDocumentChatPresence(
  documentId: string,
  open: boolean,
  draft: string,
) {
  const [presence, setPresence] = useState<DocumentChatPresenceView[]>([]);
  const typingTimerRef = useRef<number | null>(null);
  const lastTypingRef = useRef(false);

  const refreshPresence = useCallback(async () => {
    try {
      const { presence: data } = await api.getDocumentChatPresence(documentId);
      setPresence(data);
    } catch {
      /* optional until Supabase table exists */
    }
  }, [documentId]);

  const sendPresence = useCallback(
    async (isTyping: boolean) => {
      try {
        await api.postDocumentChatPresence(documentId, isTyping);
      } catch {
        /* ignore */
      }
    },
    [documentId],
  );

  useEffect(() => {
    if (!open) return;

    void refreshPresence();
    void sendPresence(false);

    const pollId = window.setInterval(() => {
      void refreshPresence();
    }, POLL_MS);

    const heartbeatId = window.setInterval(() => {
      void sendPresence(lastTypingRef.current);
    }, HEARTBEAT_MS);

    return () => {
      window.clearInterval(pollId);
      window.clearInterval(heartbeatId);
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
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim().toLowerCase();
    return presence.some(
      (entry) =>
        entry.online &&
        (entry.userEmail === normalizedEmail ||
          entry.userName.trim().toLowerCase() === normalizedName),
    );
  }

  return { presence, typingUsers, isUserOnline, refreshPresence };
}
