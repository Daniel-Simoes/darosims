import styled from 'styled-components';

export const RejectDialog = styled.div`
  width: min(100%, 480px);
  padding: 24px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
`;

export const RejectDialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

export const RejectDialogBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;

  opacity: 0.6;
  cursor: not-allowed;
`;

export const RejectDialogBtnDanger = styled.button`
  background: #dc2626;
  color: white;

  background: #b91c1c;
`;

export const RejectDialogBtnOutline = styled.button`
  background: white;
  border-color: #e2e8f0;
  color: #334155;

  background: #f8fafc;
`;

export const RejectDialogError = styled.div`
  margin: 8px 0 0;
  font-size: 13px;
  color: #dc2626;
`;

export const RejectDialogField = styled.div`
  display: block;
`;

export const RejectDialogLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
`;

export const RejectDialogMessage = styled.div`
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #475569;
`;

export const RejectDialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
`;

export const RejectDialogTextarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  min-height: 96px;

  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
`;

export const RejectDialogTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
`;

