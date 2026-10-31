import styled from 'styled-components';

export const DocReviewHistoryClose = styled.div`
  border: none;
  background: #f1f5f9;
  color: #475569;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;

  background: #e2e8f0;
`;

export const DocReviewHistoryCloseBtn = styled.button`
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;

  background: #f8fafc;
`;

export const DocReviewHistoryDialog = styled.div`
  width: min(100%, 960px);
  max-height: min(90vh, 720px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.2);
  overflow: hidden;
`;

export const DocReviewHistoryError = styled.div`
  margin: 0;
  padding: 12px 24px;
  color: #b91c1c;
  font-size: 14px;
  background: #fef2f2;
`;

export const DocReviewHistoryFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  padding: 12px 24px 20px;
  border-top: 1px solid #e2e8f0;
`;

export const DocReviewHistoryHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px 12px;
  border-bottom: 1px solid #e2e8f0;
`;

export const DocReviewHistoryLoading = styled.div`
  padding: 32px 24px;
  margin: 0;
  text-align: center;
  color: #64748b;
  font-size: 14px;
`;

export const DocReviewHistoryMeta = styled.div`
  margin: 0;
  font-size: 13px;
  color: #64748b;
`;

export const DocReviewHistoryOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.5);
`;

export const DocReviewHistoryTable = styled.button`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 820px;

  & thead th {
    background: #e8e8e8;
  border: 1px solid #cfcfcf;
  padding: 10px 8px;
  text-align: center;
  font-weight: 700;
  color: #1a1a1a;
  vertical-align: middle;
  }

  & tbody td {
    border: 1px solid #cfcfcf;
  padding: 10px 8px;
  text-align: center;
  vertical-align: middle;
  color: #1a1a1a;
  line-height: 1.45;
  }

  & tbody td:nth-child(4) {
    text-align: left;
  }
`;

export const DocReviewHistoryTableWrap = styled.button`
  overflow: auto;
  padding: 0 16px 16px;
  flex: 1;
`;

export const DocReviewHistoryTitle = styled.h2`
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
`;

