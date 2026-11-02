import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../../lib/api';
import type { DocumentChatSummary } from '../../../types/documentComments';
import type { DocumentRecord } from '../../../types/documents';
import { DocumentCommentsChat } from '../../documents/components/DocumentCommentsChat';
import { useAuth } from '../../../context/AuthContext';
import { useTeamUsers } from '../../../context/TeamUsersContext';
import { getOtherChatPeers } from '../../../lib/documents/documentChatPeers';
import { ChatAvatarStack } from './ChatAvatarStack';
import './DocumentChatsView.css';

function formatListTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

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

  const selectedSummary = useMemo(
    () => chats.find((chat) => chat.documentId === selectedId) ?? null,
    [chats, selectedId],
  );

  return (
    <div className="doc-chats-page">
      <aside className="doc-chats-list-panel">
        <div className="doc-chats-list-head">
          <h2>Conversations</h2>
          <p>Document chats you are part of</p>
        </div>

        {error ? <p className="doc-chats-list-error">{error}</p> : null}

        {loading ? (
          <p className="doc-chats-list-empty">Loading chats…</p>
        ) : chats.length === 0 ? (
          <p className="doc-chats-list-empty">
            No conversations yet. Open a document in Document Control and send a message to start a
            chat.
          </p>
        ) : (
          <ul className="doc-chats-list">
            {chats.map((chat) => {
              const peers = peerCache[chat.documentId] ?? [];
              const isActive = chat.documentId === selectedId;
              return (
                <li key={chat.documentId}>
                  <button
                    type="button"
                    className={`doc-chats-list-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => setSelectedId(chat.documentId)}
                  >
                    <ChatAvatarStack peers={peers} />
                    <div className="doc-chats-list-body">
                      <div className="doc-chats-list-top">
                        <span className="doc-chats-list-title">{chat.documentTitle}</span>
                        <span className="doc-chats-list-time">{formatListTime(chat.lastMessageAt)}</span>
                      </div>
                      <p className="doc-chats-list-preview">
                        {chat.lastSenderName}: {truncate(chat.lastMessageText, 72)}
                      </p>
                      <span className="doc-chats-list-code">{chat.documentCode}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <section className="doc-chats-thread-panel">
        {selectedDocument ? (
          <DocumentCommentsChat
            key={selectedDocument.id}
            documentRecord={selectedDocument}
            open
            layout="embedded"
            onClose={() => setSelectedId(null)}
            onMessageSent={() => void loadChats({ silent: true })}
          />
        ) : (
          <div className="doc-chats-thread-placeholder">
            <h3>
              {selectedId
                ? selectedSummary?.documentTitle ?? 'Document chat'
                : 'Select a conversation'}
            </h3>
            <p>
              {selectedId
                ? 'Loading document chat…'
                : 'Choose a document chat on the left to read and reply.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
