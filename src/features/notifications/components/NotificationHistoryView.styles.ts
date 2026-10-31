import styled from 'styled-components';

export const NotificationHistoryActionChip = styled.div`
  display: inline-flex;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
`;

export const NotificationHistoryAlert = styled.div`
  padding: 12px 14px;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 14px;
`;

export const NotificationHistoryCard = styled.div`
  padding: 20px;
  border-radius: 12px;
  background: white;
  border: 1px solid #e2e8f0;
`;

export const NotificationHistoryCardHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
`;

export const NotificationHistoryDocMeta = styled.div`
  margin: 0;
  font-size: 13px;
  color: #64748b;
`;

export const NotificationHistoryDocTitle = styled.h2`
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
`;

export const NotificationHistoryEmpty = styled.div`
  text-align: center;
  color: #64748b;

  & h2 {
    margin: 0 0 8px;
  color: #0f172a;
  font-size: 18px;
  }
`;

export const NotificationHistoryHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  & .notification-history-search {
    flex: 1 1 280px;
  max-width: 420px;
  }
`;

export const NotificationHistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const NotificationHistoryOpenBtn = styled.button`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  background: #f8fafc;
`;

export const NotificationHistoryPanel = styled.div`
  padding: 32px 24px;
  border-radius: 12px;
  background: white;
  border: 1px solid #e2e8f0;
`;

export const NotificationHistoryReasonBox = styled.div`
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;

  & span {
    display: block;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #b91c1c;
  }

  & p {
    margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: #991b1b;
  white-space: pre-wrap;
  }
`;

export const NotificationHistoryStep = styled.div`
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 12px;
  @media (max-width: 720px) {
    &-top {
      flex-direction: column;
    align-items: flex-start;
    }
  }

`;

export const NotificationHistoryStepBody = styled.div`
  padding-bottom: 22px;
`;

export const NotificationHistoryStepDot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 2px solid transparent;
  flex-shrink: 0;
`;

export const NotificationHistoryStepLabel = styled.label`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

export const NotificationHistoryStepLine = styled.div`
  width: 2px;
  flex: 1;
  min-height: 24px;
  margin-top: 4px;
  background: #e2e8f0;
`;

export const NotificationHistoryStepText = styled.div`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #334155;
`;

export const NotificationHistoryStepTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;

  & time {
    font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  }
  @media (max-width: 720px) {
    & {
      flex-direction: column;
    align-items: flex-start;
    }
  }

`;

export const NotificationHistoryStepTrack = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const NotificationHistorySubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #64748b;
`;

export const NotificationHistoryTimeline = styled.div`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const NotificationHistoryTitle = styled.h2`
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
`;

export const NotificationHistoryView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ToneApproved = styled.div`
  & .notification-history-step-dot {
    background: #dcfce7;
  color: #15803d;
  border-color: #bbf7d0;
  }

  & .notification-history-step-label {
    color: #15803d;
  }
`;

export const ToneCreated = styled.div`
  & .notification-history-step-dot {
    background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
  }

  & .notification-history-step-label {
    color: #2563eb;
  }
`;

export const ToneEdited = styled.div`
  & .notification-history-step-dot {
    background: #f5f3ff;
  color: #7c3aed;
  border-color: #ddd6fe;
  }

  & .notification-history-step-label {
    color: #7c3aed;
  }
`;

export const ToneRejected = styled.div`
  & .notification-history-step-dot {
    background: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;
  }

  & .notification-history-step-label {
    color: #b91c1c;
  }
`;

export const ToneSubmitted = styled.div`
  & .notification-history-step-dot {
    background: #fef9c3;
  color: #ca8a04;
  border-color: #fde68a;
  }

  & .notification-history-step-label {
    color: #ca8a04;
  }
`;

