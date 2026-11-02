import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../lib/api';
import type { DocumentCommentMessage } from '../../../types/documentComments';

const POLL_MS = 3_000;

function sameMessageList(
  a: DocumentCommentMessage[],
  b: DocumentCommentMessage[],
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) return false;
  }
  return true;
}

export function useDocumentChatMessages(
  documentId: string,
  open: boolean,
  onMessagesChanged?: () => void,
) {
  const [messages, setMessages] = useState<DocumentCommentMessage[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const onMessagesChangedRef = useRef(onMessagesChanged);
  onMessagesChangedRef.current = onMessagesChanged;

  const refreshMessages = useCallback(
    async (opts?: { silent?: boolean; initial?: boolean }) => {
      const silent = opts?.silent ?? false;
      const initial = opts?.initial ?? false;

      if (!silent) {
        setError('');
        setIsLoading(true);
      }

      try {
        const { messages: data } = await api.getDocumentComments(documentId);
        setMessages((prev) => {
          if (sameMessageList(prev, data)) return prev;
          if (!initial && data.length > prev.length) {
            onMessagesChangedRef.current?.();
          }
          return data;
        });
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : 'Failed to load chat');
        }
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [documentId],
  );

  const appendMessage = useCallback((message: DocumentCommentMessage) => {
    setMessages((prev) => {
      if (prev.some((item) => item.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setMessages([]);
      return;
    }

    setMessages([]);
    void refreshMessages({ initial: true });

    const pollId = window.setInterval(() => {
      void refreshMessages({ silent: true });
    }, POLL_MS);

    function handleRefresh() {
      void refreshMessages({ silent: true });
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        handleRefresh();
      }
    }

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleRefresh);

    return () => {
      window.clearInterval(pollId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleRefresh);
    };
  }, [open, documentId, refreshMessages]);

  return {
    messages,
    setMessages,
    appendMessage,
    error,
    setError,
    isLoading,
    refreshMessages,
  };
}
