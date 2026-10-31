import styled from 'styled-components';

export const NotificationsActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  background: #f8fafc;
  border-color: #cbd5e1;

  opacity: 0.6;
  cursor: not-allowed;
  @media (max-width: 820px) {
    & {
      flex: 1;
    min-width: 88px;
    }
  }

`;

export const NotificationsActionDanger = styled.div`
  color: #dc2626;
  border-color: #fecaca;

  background: #fef2f2;
  border-color: #fca5a5;
`;

export const NotificationsActionPrimary = styled.div`
  background: #1a56db;
  border-color: #1a56db;
  color: white;

  background: #1648b8;
  border-color: #1648b8;
`;

export const NotificationsAlert = styled.div`
  padding: 12px 14px;
  border-radius: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 13px;
`;

export const NotificationsCard = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: start;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  border-color: #cbd5e1;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);

  &.unread {
    background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  border-color: #bfdbfe;
  }
  @media (max-width: 820px) {
    & {
      grid-template-columns: auto 1fr;
    }
    &-actions {
      grid-column: 1 / -1;
    flex-direction: row;
    flex-wrap: wrap;
    min-width: 0;
    }
  }

`;

export const NotificationsCardActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  min-width: 92px;
  @media (max-width: 820px) {
    & {
      grid-column: 1 / -1;
    flex-direction: row;
    flex-wrap: wrap;
    min-width: 0;
    }
  }

`;

export const NotificationsCardBody = styled.div`
  min-width: 0;
`;

export const NotificationsCardDate = styled.div`
  margin: 8px 0 0;
  font-size: 12px;
  color: #94a3b8;
`;

export const NotificationsCardIcon = styled.span`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.approval_request {
    background: #fef3c7;
  color: #b45309;
  }

  &.document_approved {
    background: #dcfce7;
  color: #15803d;
  }

  &.document_rejected {
    background: #fee2e2;
  color: #b91c1c;
  }

  &.default {
    background: #eff6ff;
  color: #2563eb;
  }
`;

export const NotificationsCardMessage = styled.div`
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: #475569;
`;

export const NotificationsCardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const NotificationsCardTime = styled.div`
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
`;

export const NotificationsCardTitle = styled.h2`
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
`;

export const NotificationsCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
  @media (max-width: 520px) {
    & {
      flex-direction: column;
    align-items: flex-start;
    }
  }

`;

export const NotificationsEmptyIcon = styled.span`
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 16px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const NotificationsEmptyState = styled.div`
  padding: 56px 24px;
  text-align: center;

  & h2 {
    margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  }

  & p {
    margin: 0;
  font-size: 14px;
  color: #64748b;
  max-width: 360px;
  margin-inline: auto;
  }
`;

export const NotificationsHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  & .notifications-search {
    flex: 1 1 280px;
  max-width: 420px;
  }
`;

export const NotificationsList = styled.div`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
`;

export const NotificationsPageSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #64748b;
`;

export const NotificationsPageTitle = styled.h2`
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  @media (max-width: 520px) {
    & {
      font-size: 20px;
    }
  }

`;

export const NotificationsPanel = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  overflow: hidden;
`;

export const NotificationsStat = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 999px;
  background: white;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;

  & strong {
    color: #0f172a;
  font-weight: 700;
  }
`;

export const NotificationsStatUnread = styled.div`
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;

  & strong {
    color: #1d4ed8;
  }
`;

export const NotificationsStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const NotificationsTypeLabel = styled.label`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #64748b;
`;

export const NotificationsUnreadDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563eb;
  flex-shrink: 0;
`;

export const NotificationsView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #f4f6f9;
  min-height: 100%;
  @media (max-width: 520px) {
    & {
      padding: 14px;
    }
  }

`;

