import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../../lib/api';
import type { DocumentChatSummary } from '../../../types/documentComments';
import type { DocumentRecord } from '../../../types/documents';
import { DocumentCommentsChat } from '../../documents/components/DocumentCommentsChat';
import { useAuth } from '../../../context/AuthContext';
import { useTeamUsers } from '../../../context/TeamUsersContext';
import { getOtherChatPeers } from '../../../lib/documents/documentChatPeers';
import { clearChatRead, getChatLastRead } from '../lib/chatReadState';
import { formatChatListTime, getAvatarTone, getChatInitials } from '../lib/chatUiUtils';
import { ChatAvatarStack } from './ChatAvatarStack';
import './DocumentChatsView.css';

function truncate(text: string, max: number) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

interface DocumentChatsViewProps {
  refreshKey: number;
  initialDocumentId?: string | null;
  onConversationOpened?: () => void;
}

export function DocumentChatsView({
  refreshKey,
  initialDocumentId,
  onConversationOpened,
}: DocumentChatsViewProps) {
  const { user } = useAuth();
  const teamUsers = useTeamUsers();
  const [chats, setChats] = useState<DocumentChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [openTabIds, setOpenTabIds] = useState<string[]>(() =>
    initialDocumentId ? [initialDocumentId] : [],
  );
  const [selectedId, setSelectedId] = useState<string | null>(initialDocumentId ?? null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);
  const [peerCache, setPeerCache] = useState<Record<string, ReturnType<typeof getOtherChatPeers>>>({});

  const loadChats = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) {
      setError('');
      setLoading(true);
    }
    try {
      const { chats: data } = await api.getDocumentChats();
      setChats(data);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : 'Failed to load chats');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadChats();
  }, [loadChats, refreshKey]);

  useEffect(() => {
    const pollId = window.setInterval(() => {
      void loadChats({ silent: true });
    }, 8_000);
    return () => window.clearInterval(pollId);
  }, [loadChats]);

  useEffect(() => {
    if (!initialDocumentId) return;
    setSelectedId(initialDocumentId);
    setOpenTabIds((prev) =>
      prev.includes(initialDocumentId) ? prev : [...prev, initialDocumentId],
    );
    onConversationOpened?.();
  }, [initialDocumentId, onConversationOpened]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedDocument(null);
      return;
    }

    let active = true;
    void api
      .getDocument(selectedId)
      .then(({ document }) => {
        if (active) setSelectedDocument(document);
      })
      .catch(() => {
        if (active) setSelectedDocument(null);
      });

    return () => {
      active = false;
    };
  }, [selectedId, refreshKey]);

  useEffect(() => {
    if (!user || chats.length === 0) return;

    let cancelled = false;

    async function loadPeers() {
      const next: Record<string, ReturnType<typeof getOtherChatPeers>> = {};
      await Promise.all(
        chats.map(async (chat) => {
          try {
            const [{ document }, { messages }] = await Promise.all([
              api.getDocument(chat.documentId),
              api.getDocumentComments(chat.documentId),
            ]);
            next[chat.documentId] = getOtherChatPeers(
              document,
              messages,
              { email: user!.email, name: user!.name },
              teamUsers,
            );
          } catch {
            next[chat.documentId] = [];
          }
        }),
      );
      if (!cancelled) setPeerCache(next);
    }

    void loadPeers();
    return () => {
      cancelled = true;
    };
  }, [chats, teamUsers, user]);

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return chats;
    return chats.filter((chat) => {
      const haystack = [
        chat.documentTitle,
        chat.documentCode,
        chat.lastMessageText,
        chat.lastSenderName,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [chats, search]);

  const tabSummaries = useMemo(
    () =>
      openTabIds
        .map((id) => chats.find((chat) => chat.documentId === id))
        .filter((item): item is DocumentChatSummary => Boolean(item)),
    [chats, openTabIds],
  );

  const currentEmail = user?.email?.trim().toLowerCase() ?? '';

  function selectConversation(documentId: string) {
    setSelectedId(documentId);
    setOpenTabIds((prev) => (prev.includes(documentId) ? prev : [...prev, documentId]));
  }

  function closeTab(documentId: string) {
    setOpenTabIds((prev) => {
      const next = prev.filter((id) => id !== documentId);
      if (selectedId === documentId) {
        const fallback = next[next.length - 1] ?? null;
        setSelectedId(fallback);
      }
      return next;
    });
  }

  function handleConversationDeleted(documentId: string) {
    clearChatRead(documentId);
    closeTab(documentId);
    void loadChats({ silent: true });
  }

  function isUnread(chat: DocumentChatSummary) {
    const lastRead = getChatLastRead(chat.documentId);
    if (!lastRead) return true;
    if (chat.lastMessageAt <= lastRead) return false;
    const sender = chat.lastSenderName.trim().toLowerCase();
    const me = user?.name?.trim().toLowerCase() ?? '';
    return sender !== me && !sender.includes(currentEmail.split('@')[0]);
  }

  return (
    <div className="doc-chats-page">
      <aside className="doc-chats-list-panel">
        <div className="doc-chats-list-head">
          <div className="doc-chats-list-head-row">
            <h2>Conversations</h2>
            <span className="doc-chats-count-badge">{chats.length}</span>
          </div>
          <div className="doc-chats-search-wrap">
            <svg className="doc-chats-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              className="doc-chats-search"
              placeholder="Search conversations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="button" className="doc-chats-filter-btn" aria-label="Filter" title="Filter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
            </button>
          </div>
        </div>

        {error ? <p className="doc-chats-list-error">{error}</p> : null}

        {loading ? (
          <p className="doc-chats-list-empty">Loading chats…</p>
        ) : filteredChats.length === 0 ? (
          <p className="doc-chats-list-empty">
            {chats.length === 0
              ? 'No conversations yet. Open a document in Document Control and send a message to start a chat.'
              : 'No conversations match your search.'}
          </p>
        ) : (
          <ul className="doc-chats-list">
            {filteredChats.map((chat) => {
              const peers = peerCache[chat.documentId] ?? [];
              const isActive = chat.documentId === selectedId;
              const unread = isUnread(chat);
              const primaryPeer = peers[0];
              const tone = getAvatarTone(primaryPeer?.email || primaryPeer?.name || chat.documentTitle);
              return (
                <li key={chat.documentId}>
                  <button
                    type="button"
                    className={`doc-chats-list-item ${isActive ? 'is-active' : ''} ${unread ? 'is-unread' : ''}`}
                    onClick={() => selectConversation(chat.documentId)}
                  >
                    {peers.length > 1 ? (
                      <ChatAvatarStack peers={peers} />
                    ) : (
                      <span className={`doc-chats-list-avatar doc-chats-list-avatar--${tone}`}>
                        {primaryPeer?.photoUrl ? (
                          <img src={primaryPeer.photoUrl} alt="" />
                        ) : (
                          getChatInitials(primaryPeer?.name ?? chat.documentTitle)
                        )}
                      </span>
                    )}
                    <div className="doc-chats-list-body">
                      <div className="doc-chats-list-top">
                        <span className="doc-chats-list-title">{chat.documentTitle}</span>
                        <span className="doc-chats-list-time">{formatChatListTime(chat.lastMessageAt)}</span>
                      </div>
                      <p className="doc-chats-list-preview">
                        {chat.lastSenderName}: {truncate(chat.lastMessageText, 72)}
                      </p>
                      <span className="doc-chats-list-code">{chat.documentCode}</span>
                    </div>
                    {unread ? <span className="doc-chats-unread-dot" aria-label="Unread" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <section className="doc-chats-thread-panel">
        <div className="doc-chat-tabbar">
          {tabSummaries.map((chat) => {
            const peers = peerCache[chat.documentId] ?? [];
            const isActive = chat.documentId === selectedId;
            return (
              <button
                key={chat.documentId}
                type="button"
                className={`doc-chat-tab ${isActive ? 'is-active' : ''}`}
                onClick={() => setSelectedId(chat.documentId)}
              >
                <ChatAvatarStack peers={peers.length ? peers : [{ name: chat.documentTitle, email: '' }]} size="md" />
                <span className="doc-chat-tab-label">
                  {peers.length > 0
                    ? truncate(peers.map((peer) => peer.name).join(', '), 32)
                    : truncate(chat.documentTitle, 28)}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  className="doc-chat-tab-close"
                  aria-label={`Close ${chat.documentTitle}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    closeTab(chat.documentId);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      closeTab(chat.documentId);
                    }
                  }}
                >
                  ×
                </span>
              </button>
            );
          })}
          <button
            type="button"
            className="doc-chat-tab-add"
            aria-label="Open another conversation"
            title="Pick a conversation from the list"
            onClick={() => setSelectedId(null)}
          >
            +
          </button>
        </div>

        {selectedDocument ? (
          <DocumentCommentsChat
            key={selectedDocument.id}
            documentRecord={selectedDocument}
            open
            layout="embedded"
            onClose={() => closeTab(selectedDocument.id)}
            onMessageSent={() => void loadChats({ silent: true })}
            onConversationDeleted={() => handleConversationDeleted(selectedDocument.id)}
          />
        ) : (
          <div className="doc-chats-thread-placeholder">
            <h3>Select a conversation</h3>
            <p>Choose a document chat on the left or open a tab to read and reply.</p>
          </div>
        )}
      </section>
    </div>
  );
}
