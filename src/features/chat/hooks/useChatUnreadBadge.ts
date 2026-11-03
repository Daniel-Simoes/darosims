import { useCallback, useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { CHAT_ACTIVITY_EVENT, CHAT_READ_EVENT } from '../lib/chatReadState';
import { countUnreadChatMessages } from '../lib/chatUnread';

export function useChatUnreadBadge(refreshKey = 0) {
  const { user } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);

  const refresh = useCallback(async () => {
    const email = user?.email?.trim().toLowerCase();
    if (!email) {
      setTotalUnread(0);
      return;
    }

    try {
      const { chats } = await api.getDocumentChats();
      if (chats.length === 0) {
        setTotalUnread(0);
        return;
      }

      const counts = await Promise.all(
        chats.map(async (chat) => {
          try {
            const { messages } = await api.getDocumentComments(chat.documentId);
            return countUnreadChatMessages(messages, chat.documentId, email);
          } catch {
            return 0;
          }
        }),
      );

      setTotalUnread(counts.reduce((sum, value) => sum + value, 0));
    } catch {
      setTotalUnread(0);
    }
  }, [user?.email]);

  useEffect(() => {
    void refresh();
  }, [refresh, refreshKey]);

  useEffect(() => {
    const pollId = window.setInterval(() => {
      void refresh();
    }, 8_000);

    function handleActivity() {
      void refresh();
    }

    window.addEventListener(CHAT_READ_EVENT, handleActivity);
    window.addEventListener(CHAT_ACTIVITY_EVENT, handleActivity);

    return () => {
      window.clearInterval(pollId);
      window.removeEventListener(CHAT_READ_EVENT, handleActivity);
      window.removeEventListener(CHAT_ACTIVITY_EVENT, handleActivity);
    };
  }, [refresh]);

  return totalUnread;
}
