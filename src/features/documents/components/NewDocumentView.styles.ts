import styled, { keyframes } from 'styled-components';

export const NdUploadSpin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const NdUploadSuccessPop = keyframes`
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

export const NdUploadCheckDraw = keyframes`
  to {
    stroke-dashoffset: 0;
  }
`;

export const NdUploadSuccessPulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.35);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
`;

export const NdAlertError = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
`;

export const NdAlertSuccess = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
`;

export const NdBackBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  background: white;
  color: #475569;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 4px;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  background: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
`;

export const NdBadge = styled.div`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 100px;
  white-space: nowrap;
`;

export const NdBadgeAmber = styled.div`
  background: #fef3c7;
  color: #b45309;
`;

export const NdBadgeBlue = styled.div`
  background: #dbeafe;
  color: #2563eb;
`;

export const NdBadgeGreen = styled.div`
  background: #dcfce7;
  color: #16a34a;
`;

export const NdBadgeGreenSm = styled.div`
  background: #dcfce7;
  color: #16a34a;
  font-size: 11px;
  padding: 2px 8px;
`;

export const NdBreadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;

  & button {
    background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  }
  @media (max-width: 768px) {
    & {
      flex-wrap: wrap;
    }
  }

`;

export const NdBreadcrumbsCurrent = styled.div`
  color: #334155;
  font-weight: 500;
`;

export const NdBtnCaret = styled.button`
  padding: 8px 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0 8px 8px 0;
`;

export const NdBtnGhost = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;

  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;

  background: #f8fafc;
  color: #334155;
`;

export const NdBtnOutline = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;

  background: #f8fafc;
`;

export const NdBtnPrimary = styled.button`
  background: #2563eb;
  color: white;

  background: #1d4ed8;

  opacity: 0.6;
  cursor: not-allowed;
`;

export const NdCode = styled.div`
  font-weight: 600;
  color: #0f172a;
`;

export const NdEditorActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const NdEditorImportNote = styled.div`
  margin: 0;
  font-size: 13px;
  color: #64748b;
`;

export const NdEditorPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const NdField = styled.div`
  
`;

export const NdFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const NdFilePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const NdFileTab = styled.button`
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &.active {
    background: white;
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  }
`;

export const NdFileTabs = styled.button`
  display: inline-flex;
  gap: 6px;
  padding: 4px;
  border-radius: 10px;
  background: #f1f5f9;
  width: fit-content;
`;

export const NdFormFooter = styled.footer`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding: 16px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
`;

export const NdHint = styled.div`
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
`;

export const NdIconBtn = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const NdInfoPanel = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 18px;
  transition: opacity 0.2s;

  &.active {
    background: white;
  }

  &.inactive {
    background: #f8fafc;
  opacity: 0.55;
  pointer-events: none;
  }
`;

export const NdInfoPanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  & h3 {
    font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  }
`;

export const NdInput = styled.input`
  width: 100%;
  padding: 9px 12px;
  font-size: 13px;
  color: #0f172a;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  font-family: inherit;

  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);

  background: #f8fafc;
  color: #64748b;
`;

export const NdLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
`;

export const NdLockedInput = styled.input`
  position: relative;

  & svg {
    position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  }

  & .nd-input {
    padding-right: 36px;
  }
`;

export const NdNotifBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const NdNotifBtn = styled.button`
  position: relative;
`;

export const NdOriginCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color 0.15s, background 0.15s;

  &.active {
    border-color: #2563eb;
  background: #f0f7ff;
  }

  & strong {
    display: block;
  font-size: 14px;
  color: #0f172a;
  margin-bottom: 4px;
  }

  & p {
    font-size: 12px;
  color: #64748b;
  line-height: 1.4;
  }
  @media (max-width: 480px) {
    & {
      padding: 14px;
    }
  }

`;

export const NdPage = styled.div`
  background: #f4f6f9;
  min-height: 100%;
  padding: 20px 20px 24px;
  @media (max-width: 768px) {
    & {
      padding: 0 12px 20px;
    }
    &-title {
      font-size: 1.25rem;
    }
  }

  @media (max-width: 480px) {
    & {
      padding: 0 8px 16px;
    }
  }

`;

export const NdPageTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  @media (max-width: 768px) {
    & {
      font-size: 1.25rem;
    }
  }

`;

export const NdPagination = styled.div`
  display: flex;
  gap: 4px;

  & button {
    min-width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  cursor: pointer;
  color: #475569;
  }

  & button.active {
    background: #2563eb;
  border-color: #2563eb;
  color: white;
  }

  & button:disabled {
    opacity: 0.4;
  cursor: not-allowed;
  }
`;

export const NdRadio = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
  position: relative;

  &.checked {
    border-color: #2563eb;
  }

  &.checked::after {
    content: '';
  position: absolute;
  inset: 3px;
  background: #2563eb;
  border-radius: 50%;
  }
`;

export const NdRegisterActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const NdRegisterHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

export const NdRequired = styled.div`
  color: #ef4444;
  margin-left: 2px;
`;

export const NdRowActions = styled.tr`
  display: flex;
  gap: 2px;

  & button {
    background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 4px;
  opacity: 0.7;
  }

  & button:hover {
    opacity: 1;
  }

  & button.nd-action-delete:hover {
    opacity: 1;
  color: #dc2626;
  }

  & button:disabled {
    cursor: not-allowed;
  opacity: 0.4;
  }
`;

export const NdSaveMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 50;
  overflow: hidden;

  & button {
    display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  text-align: left;
  }

  & button:hover {
    background: #f8fafc;
  }
`;

export const NdSaveMenuUp = styled.div`
  top: auto;
  bottom: calc(100% + 4px);
`;

export const NdSection = styled.section`
  &.nd-section-locked .nd-upload-zone {
    opacity: 0.55;
  pointer-events: none;
  user-select: none;
  }
  @media (max-width: 768px) {
    & {
      padding: 16px;
    }
    &-actions {
      flex-wrap: wrap;
    }
  }

`;

export const NdSectionActions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  @media (max-width: 1024px) {
    & {
      width: 100%;
    margin-left: 0;
    margin-top: 8px;
    justify-content: flex-end;
    }
  }

  @media (max-width: 768px) {
    & {
      flex-wrap: wrap;
    }
  }

`;

export const NdSectionDesc = styled.div`
  font-size: 13px;
  color: #64748b;
`;

export const NdSectionHead = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 20px;
`;

export const NdSectionNum = styled.div`
  width: 28px;
  height: 28px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
`;

export const NdSectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
`;

export const NdSelect = styled.select`
  appearance: none;
  padding-right: 32px;
  cursor: pointer;
`;

export const NdSelectChevron = styled.select`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
`;

export const NdSelectWrap = styled.div`
  position: relative;
`;

export const NdSplitBtnWrap = styled.button`
  position: relative;
  display: flex;

  & > .nd-btn-primary:first-child {
    border-radius: 8px 0 0 8px;
  }
  @media (max-width: 768px) {
    & {
      width: 100%;
    }
    & > .nd-btn-primary:first-child {
      flex: 1;
    }
  }

`;

export const NdTable = styled.button`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  & thead tr {
    background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  }

  & th {
    padding: 10px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
  }

  & td {
    padding: 11px 12px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
  }

  & tbody tr:hover {
    background: #fafbfc;
  }
`;

export const NdTableEmpty = styled.button`
  padding: 32px;
  text-align: center;
  color: #64748b;
`;

export const NdTableFooter = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  font-size: 12px;
  color: #64748b;
  flex-wrap: wrap;
  gap: 10px;
`;

export const NdTableWrap = styled.button`
  overflow-x: auto;
`;

export const NdTag = styled.div`
  display: inline-block;
  padding: 2px 8px;
  background: #f1f5f9;
  border-radius: 4px;
  font-size: 11px;
  color: #475569;
`;

export const NdTopbarLeft = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

export const NdTopbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  @media (max-width: 768px) {
    & .nd-user-chip span:not(.nd-user-avatar) {
      display: none;
    }
  }

`;

export const NdUploadBtn = styled.button`
  &.disabled {
    opacity: 0.5;
  pointer-events: none;
  }

  cursor: pointer;
  margin-bottom: 12px;
`;

export const NdUploadCheckPath = styled.div`
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: nd-upload-check-draw 0.45s ease 0.15s forwards;
`;

export const NdUploadError = styled.div`
  margin: 10px 0 0;
  font-size: 13px;
  color: #dc2626;
`;

export const NdUploadFormats = styled.div`
  font-size: 11px;
  color: #94a3b8;
`;

export const NdUploadIcon = styled.span`
  color: #94a3b8;
  margin-bottom: 12px;
`;

export const NdUploadSpinner = styled.div`
  width: 44px;
  height: 44px;
  margin: 0 auto 14px;
  border: 3px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: nd-upload-spin 0.8s linear infinite;
`;

export const NdUploadSub = styled.div`
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 16px;
`;

export const NdUploadSuccessIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  animation: nd-upload-success-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.35);
`;

export const NdUploadSuccessTitle = styled.h2`
  color: #15803d;
`;

export const NdUploadTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 4px;
`;

export const NdUploadZone = styled.div`
  border-color: #2563eb;
  background: #f0f7ff;

  &.has-file {
    border-color: #86efac;
  background: #f0fdf4;
  }

  &.is-checking {
    border-color: #93c5fd;
  background: #eff6ff;
  pointer-events: none;
  }

  &.is-success {
    border-color: #22c55e;
  background: linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%);
  animation: nd-upload-success-pulse 0.6s ease;
  }

  &.is-error {
    border-color: #fca5a5;
  background: #fef2f2;
  }
`;

export const NdUserAvatar = styled.div`
  width: 28px;
  height: 28px;
  background: #2563eb;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
`;

export const NdUserChip = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  @media (max-width: 768px) {
    
  }

`;

