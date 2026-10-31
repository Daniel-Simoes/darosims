import styled from 'styled-components';

export const ConfirmDialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
`;

export const ConfirmDialogPanel = styled.div`
  width: min(100%, 420px);
  padding: 24px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
`;

export const ConfirmDialogTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
`;

export const ConfirmDialogMessage = styled.p`
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 1.5;
  color: #475569;
`;

export const ConfirmDialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
`;

const ConfirmDialogBtnBase = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
`;

export const ConfirmDialogBtnPrimary = styled(ConfirmDialogBtnBase)`
  background: #1a56db;
  color: white;

  &:hover {
    background: #1648b8;
  }
`;

export const ConfirmDialogBtnOutline = styled(ConfirmDialogBtnBase)`
  background: white;
  border-color: #e2e8f0;
  color: #334155;

  &:hover {
    background: #f8fafc;
  }
`;
