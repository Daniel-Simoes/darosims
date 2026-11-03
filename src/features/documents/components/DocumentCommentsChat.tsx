import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../../lib/api';
import { ConfirmDialog } from '../../../components/dialogs/ConfirmDialog';
import {
  getChatParticipantsForViewer,
  getDocumentChatHeaderCode,
} from '../../../lib/documents/documentChatParticipants';
import type { DocumentRecord } from '../../../types/documents';
import type { DocumentChatParticipant } from '../../../types/documentComments';
import { useAuth } from '../../../context/AuthContext';
import { useTeamUsers } from '../../../context/TeamUsersContext';
import {
  dateKey,
  formatBubbleTime,
  formatDateSeparator,
  getAvatarTone,
  getChatInitials,
} from '../../chat/lib/chatUiUtils';
import { markChatRead } from '../../chat/lib/chatReadState';
import { notifyChatActivity } from '../../chat/lib/chatUnread';
import { useDocumentChatMessages } from '../hooks/useDocumentChatMessages';
import { useDocumentChatPresence } from '../hooks/useDocumentChatPresence';
import './DocumentCommentsChat.css';

interface DocumentCommentsChatProps {
  documentRecord: DocumentRecord;
  open: boolean;
  onClose: () => void;
  layout?: 'modal' | 'embedded';
  onMessageSent?: () => void;
  onConversationDeleted?: () => void;
}

export function DocumentCommentsChat({
  documentRecord,
  open,
  onClose,
  layout = 'modal',
  onMessageSent,
  onConversationDeleted,
}: DocumentCommentsChatProps) {
  const { user } = useAuth();
  const teamUsers = useTeamUsers();
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const groupedMessages = useMemo(() => {
    const groups: { key: string; label: string; items: typeof messages }[] = [];
    for (const message of messages) {
      const key = dateKey(message.createdAt);
      const last = groups[groups.length - 1];
      if (!last || last.key !== key) {
        groups.push({ key, label: formatDateSeparator(message.createdAt), items: [message] });
      } else {
        last.items.push(message);
      }
    }
    return groups;
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    setDraft('');
    setMenuOpen(false);
    prevMessageCountRef.current = 0;
  }, [open, documentRecord.id]);

  useEffect(() => {
    if (!open || messages.length === 0) return;
    const last = messages[messages.length - 1];
    markChatRead(documentRecord.id, last.createdAt);
  }, [open, documentRecord.id, messages]);

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

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [menuOpen]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setError('');

    try {
      const { message } = await api.postDocumentComment(documentRecord.id, text);
      appendMessage(message);
      setDraft('');
      notifyChatActivity();
      onMessageSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }

  async function handleDeleteConversation() {
    setIsDeleting(true);
    setError('');
    try {
      await api.deleteDocumentConversation(documentRecord.id);
      setConfirmDelete(false);
      onConversationDeleted?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
    } finally {
      setIsDeleting(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void handleSend();
  }

  if (!open) return null;

  function renderParticipantChip(person: DocumentChatParticipant) {
    const online = isUserOnline(person.email, person.name);
    const tone = getAvatarTone(person.email || person.name);
    const photoUrl = teamUsers.find(
      (member) =>
        (person.email && member.email.trim().toLowerCase() === person.email.trim().toLowerCase()) ||
        member.name.trim().toLowerCase() === person.name.trim().toLowerCase(),
    )?.photoUrl;

    return (
      <div key={person.id} className="doc-chat-people-chip" title={person.roleLabel}>
        <span className={`doc-chat-people-chip-avatar doc-chat-header-avatar--${tone}`}>
          {photoUrl ? <img src={photoUrl} alt="" /> : getChatInitials(person.name)}
          {presenceAvailable ? (
            <span
              className={`doc-chat-status-dot ${online ? 'is-online' : 'is-offline'}`}
              aria-hidden
            />
          ) : null}
        </span>
        <span className="doc-chat-people-chip-text">
          <span className="doc-chat-people-chip-name">{person.name}</span>
          <span className="doc-chat-people-chip-role">{person.roleLabel}</span>
        </span>
      </div>
    );
  }

  const shell = (
    <div
      className={`doc-chat-shell ${layout === 'embedded' ? 'doc-chat-shell-embedded' : ''}`}
      role={layout === 'modal' ? 'dialog' : 'region'}
      aria-modal={layout === 'modal' ? true : undefined}
      aria-label={`Comments for ${documentRecord.title}`}
      onClick={layout === 'modal' ? (event) => event.stopPropagation() : undefined}
    >
      <div className="doc-chat-main">
        <header className="doc-chat-topbar">
          <div className="doc-chat-topbar-left">
            <div className="doc-chat-topbar-info">
              <h2>{documentRecord.title}</h2>
              <span className="doc-chat-topbar-code">{headerCode}</span>
            </div>
          </div>

          <div className="doc-chat-topbar-actions">
            <div className="doc-chat-menu-wrap" ref={menuRef}>
              <button
                type="button"
                className="doc-chat-icon-btn"
                aria-label="Conversation options"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((value) => !value)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </button>
              {menuOpen ? (
                <div className="doc-chat-menu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    className="doc-chat-menu-item doc-chat-menu-item-danger"
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmDelete(true);
                    }}
                  >
                    Delete conversation
                  </button>
                </div>
              ) : null}
            </div>
            {layout === 'modal' ? (
              <button type="button" className="doc-chat-icon-btn" aria-label="Close chat" onClick={onClose}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </header>

        <div className="doc-chat-people-bar" aria-label="People in this chat">
          {participants.length === 0 ? (
            <p className="doc-chat-people-empty">
              No other participants yet. Messages will show who is in this document chat.
            </p>
          ) : (
            participants.map((person) => renderParticipantChip(person))
          )}
        </div>

        {error ? <p className="doc-chat-error">{error}</p> : null}

        <div className="doc-chat-messages" ref={messagesScrollRef}>
          {isLoading ? (
            <p className="doc-chat-empty">Loading conversation…</p>
          ) : messages.length === 0 ? (
            <p className="doc-chat-empty">
              Start a conversation about this document with the creator and approver.
            </p>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.key} className="doc-chat-day-group">
                <div className="doc-chat-day-separator">{group.label}</div>
                {group.items.map((message) => {
                  const isMine = message.senderEmail.toLowerCase() === currentEmail;
                  const tone = getAvatarTone(message.senderEmail || message.senderName);
                  return (
                    <div key={message.id} className={`doc-chat-row ${isMine ? 'is-mine' : ''}`}>
                      {!isMine ? (
                        <span className={`doc-chat-row-avatar doc-chat-row-avatar--${tone}`}>
                          {getChatInitials(message.senderName)}
                        </span>
                      ) : null}
                      <div className="doc-chat-bubble-wrap">
                        <div className="doc-chat-bubble">{message.text}</div>
                        <span className="doc-chat-meta">
                          {formatBubbleTime(message.createdAt)}
                          {isMine ? (
                            <span className="doc-chat-read" aria-label="Sent">
                              ✓✓
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {typingLabel ? <p className="doc-chat-typing">{typingLabel}</p> : null}

        <form className="doc-chat-compose" onSubmit={handleSubmit}>
          <button type="button" className="doc-chat-compose-icon" aria-label="Attach file" disabled title="Coming soon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49" />
            </svg>
          </button>
          <input
            className="doc-chat-input"
            placeholder="Type your message..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={isSending}
          />
          <button type="button" className="doc-chat-compose-icon" aria-label="Emoji" disabled title="Coming soon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
          <button
            type="submit"
            className="doc-chat-send"
            disabled={!draft.trim() || isSending}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </form>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete conversation?"
        message="All messages in this document chat will be permanently removed for everyone."
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
        cancelLabel="Cancel"
        onConfirm={() => void handleDeleteConversation()}
        onCancel={() => setConfirmDelete(false)}
      />
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
