import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../../lib/api';
import {
  getChatParticipantsForViewer,
  getDocumentChatHeaderCode,
} from '../../../lib/documents/documentChatParticipants';
import type { DocumentRecord } from '../../../types/documents';
import { useAuth } from '../../../context/AuthContext';
import { useTeamUsers } from '../../../context/TeamUsersContext';
import { useDocumentChatMessages } from '../hooks/useDocumentChatMessages';
import { useDocumentChatPresence } from '../hooks/useDocumentChatPresence';
import './DocumentCommentsChat.css';

interface DocumentCommentsChatProps {
  documentRecord: DocumentRecord;
  open: boolean;
  onClose: () => void;
  layout?: 'modal' | 'embedded';
  onMessageSent?: () => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function formatMessageTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DocumentCommentsChat({
  documentRecord,
  open,
  onClose,
  layout = 'modal',
  onMessageSent,
}: DocumentCommentsChatProps) {
  const { user } = useAuth();
  const teamUsers = useTeamUsers();
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  function isNearMessagesBottom(thresholdPx = 80) {
    const el = messagesScrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= thresholdPx;
  }

  const {
    messages,
    appendMessage,
    error,
    setError,
    isLoading,
  } = useDocumentChatMessages(documentRecord.id, open, onMessageSent);

  const currentEmail = user?.email?.trim().toLowerCase() ?? '';

  const participants = useMemo(
    () =>
      getChatParticipantsForViewer(
        documentRecord,
        messages,
        user ? { email: user.email, name: user.name } : null,
        teamUsers,
      ),
    [documentRecord, messages, teamUsers, user],
  );

  const headerCode = getDocumentChatHeaderCode(documentRecord);

  const { typingUsers, isUserOnline, presenceAvailable } = useDocumentChatPresence(
    documentRecord.id,
    open,
    draft,
  );

  const typingLabel =
    typingUsers.length === 0
      ? ''
      : typingUsers.length === 1
        ? `${typingUsers[0].userName} is typing…`
        : `${typingUsers.map((entry) => entry.userName).join(' and ')} are typing…`;

  useEffect(() => {
    if (!open) return;
    setDraft('');
    prevMessageCountRef.current = 0;
  }, [open, documentRecord.id]);

  useEffect(() => {
    if (!open) return;
    const hadMore = messages.length > prevMessageCountRef.current;
    const isInitialLoad = prevMessageCountRef.current === 0 && messages.length > 0;
    if (hadMore && (isInitialLoad || isNearMessagesBottom())) {
      messagesEndRef.current?.scrollIntoView({ behavior: isInitialLoad ? 'auto' : 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, open]);

  useEffect(() => {
    if (!open || layout === 'embedded') return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, layout]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setError('');

    try {
      const { message } = await api.postDocumentComment(documentRecord.id, text);
      appendMessage(message);
      setDraft('');
      onMessageSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void handleSend();
  }

  if (!open) return null;

  const shell = (
      <div
        className={`doc-chat-shell ${layout === 'embedded' ? 'doc-chat-shell-embedded' : ''}`}
        role={layout === 'modal' ? 'dialog' : 'region'}
        aria-modal={layout === 'modal' ? true : undefined}
        aria-label={`Comments for ${documentRecord.title}`}
        onClick={layout === 'modal' ? (event) => event.stopPropagation() : undefined}
      >
        <aside className="doc-chat-participants" aria-label="Chat participants">
          <div className="doc-chat-participants-head">
            People
            {!presenceAvailable ? (
              <span className="doc-chat-presence-hint" title="Online status needs document_chat_presence in Supabase">
                · status off
              </span>
            ) : null}
          </div>
          <div className="doc-chat-participants-list">
            {participants.length === 0 ? (
              <p className="doc-chat-participant-role" style={{ padding: '0 10px' }}>
                No participants yet. Send a message to start the chat.
              </p>
            ) : (
              participants.map((person) => {
                const online = isUserOnline(person.email, person.name);
                return (
                  <div key={person.id} className="doc-chat-participant is-active">
                    <span className="doc-chat-participant-avatar-wrap">
                      <span className="doc-chat-participant-avatar">{getInitials(person.name)}</span>
                      <span
                        className={`doc-chat-status-dot ${online ? 'is-online' : 'is-offline'}`}
                        title={online ? 'Online' : 'Offline'}
                        aria-hidden
                      />
                    </span>
                    <div className="doc-chat-participant-body">
                      <p className="doc-chat-participant-name">{person.name}</p>
                      <p className="doc-chat-participant-role">{person.roleLabel}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <div className="doc-chat-main">
          <header className="doc-chat-topbar">
            <div className="doc-chat-topbar-info">
              <h2>{documentRecord.title}</h2>
              <p>{headerCode}</p>
            </div>
            {layout === 'modal' ? (
              <button type="button" className="doc-chat-close" aria-label="Close chat" onClick={onClose}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </header>

          {error ? <p className="doc-chat-error">{error}</p> : null}

          <div className="doc-chat-messages" ref={messagesScrollRef}>
            {isLoading ? (
              <p className="doc-chat-empty">Loading conversation...</p>
            ) : messages.length === 0 ? (
              <p className="doc-chat-empty">
                Start a conversation about this document with the creator and approver.
              </p>
            ) : (
              messages.map((message) => {
                const isMine = message.senderEmail.toLowerCase() === currentEmail;
                return (
                  <div key={message.id} className={`doc-chat-row ${isMine ? 'is-mine' : ''}`}>
                    <span className="doc-chat-row-avatar">{getInitials(message.senderName)}</span>
                    <div className="doc-chat-bubble-wrap">
                      <div className="doc-chat-bubble">{message.text}</div>
                      <span className="doc-chat-meta">
                        {isMine ? 'You · ' : `${message.senderName} · `}
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {typingLabel ? <p className="doc-chat-typing">{typingLabel}</p> : null}

          <form className="doc-chat-compose" onSubmit={handleSubmit}>
            <input
              className="doc-chat-input"
              placeholder="Message..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={isSending}
            />
            <button
              type="submit"
              className="doc-chat-send"
              disabled={!draft.trim() || isSending}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
  );

  if (layout === 'embedded') {
    return shell;
  }

  return createPortal(
    <div className="doc-chat-overlay" onClick={onClose}>
      {shell}
    </div>,
    document.body,
  );
}
