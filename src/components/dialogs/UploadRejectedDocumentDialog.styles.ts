import styled, { keyframes } from 'styled-components';

export const UploadRejectedSpin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const UploadRejectedActions = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
`;

export const UploadRejectedBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;

  opacity: 0.55;
  cursor: not-allowed;
`;

export const UploadRejectedBtnOutline = styled.button`
  background: white;
  border-color: #e2e8f0;
  color: #334155;

  background: #f8fafc;
`;

export const UploadRejectedBtnPrimary = styled.button`
  background: #2563eb;
  color: white;

  background: #1d4ed8;
`;

export const UploadRejectedDialog = styled.div`
  width: min(100%, 520px);
  padding: 24px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
`;

export const UploadRejectedFileInput = styled.input`
  display: none;
`;

export const UploadRejectedMessage = styled.div`
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #475569;
`;

export const UploadRejectedOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
`;

export const UploadRejectedReason = styled.div`
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;

  & p {
    margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #991b1b;
  white-space: pre-wrap;
  }
`;

export const UploadRejectedReasonLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #b91c1c;
`;

export const UploadRejectedSpinner = styled.div`
  width: 28px;
  height: 28px;
  margin: 0 auto 12px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: upload-rejected-spin 0.8s linear infinite;
`;

export const UploadRejectedTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
`;

export const UploadRejectedZone = styled.div`
  position: relative;
  padding: 28px 20px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;

  border-color: #94a3b8;
  background: #f1f5f9;

  &.has-file {
    border-color: #86efac;
  background: #f0fdf4;
  }

  &.is-error {
    border-color: #fca5a5;
  background: #fef2f2;
  }

  &.is-checking {
    cursor: wait;
  }
`;

export const UploadRejectedZoneSub = styled.div`
  margin: 0;
  font-size: 13px;
  color: #64748b;
`;

export const UploadRejectedZoneTitle = styled.h2`
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
`;

