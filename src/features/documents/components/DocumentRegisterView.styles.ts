import styled, { css } from 'styled-components';

const badgeStyles: Record<string, ReturnType<typeof css>> = {
  'form': css`
    background: #f3e8ff;
  color: #7c3aed;
  `,
  'sop': css`
    background: #dcfce7;
  color: #16a34a;
  `,
  'wi': css`
    background: #dbeafe;
  color: #2563eb;
  `,
  'policy': css`
    background: #fef9c3;
  color: #ca8a04;
  `,
  'procedure': css`
    background: #e2e8f0;
  color: #475569;
  `,
  'record': css`
    background: #e2e8f0;
  color: #475569;
  `,
  'register': css`
    background: #e2e8f0;
  color: #475569;
  `,
  'checklist': css`
    background: #e2e8f0;
  color: #475569;
  `,
  'flowchart': css`
    background: #e2e8f0;
  color: #475569;
  `,
  'process-map': css`
    background: #e2e8f0;
  color: #475569;
  `,
  'plan': css`
    background: #e2e8f0;
  color: #475569;
  `,
  'report': css`
    background: #e2e8f0;
  color: #475569;
  `,
  'specification': css`
    background: #e2e8f0;
  color: #475569;
  `,
  'catalog': css`
    background: #e2e8f0;
  color: #475569;
  `,
  'default': css`
    background: #e2e8f0;
  color: #475569;
  `,
  'active': css`
    background: #dcfce7;
  color: #16a34a;
  `,
  'draft': css`
    background: #f1f5f9;
  color: #64748b;
  `,
  'pending': css`
    background: #fef9c3;
  color: #ca8a04;
  `,
  'rejected': css`
    background: #fee2e2;
  color: #b91c1c;
  `,
  'obsolete': css`
    background: #fee2e2;
  color: #dc2626;
  `,
};

export function badgeVariantFromClass(className: string): string {
  return className.replace(/^badge-/, '');
}

export const DocBadge = styled.span<{ $variant: string }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  ${({ $variant }) => badgeStyles[$variant] ?? badgeStyles.default}
`;

const regPillStyles: Record<string, ReturnType<typeof css>> = {
  'sent': css`
    background: #38bdf8;
  color: white;
  `,
  'draft': css`
    background: #94a3b8;
  color: white;
  `,
  'pending': css`
    background: #fbbf24;
  color: white;
  `,
  'rejected': css`
    background: #f87171;
  color: white;
  `,
  'obsolete': css`
    background: #cbd5e1;
  color: #475569;
  `,
};

export const DocRegPill = styled.span<{ $variant: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  ${({ $variant }) => regPillStyles[$variant] ?? regPillStyles.draft}
`;

export const DocRegTypePill = styled.span<{ $variant: string }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  ${({ $variant }) => badgeStyles[$variant] ?? badgeStyles.default}
`;

export const DocRegOriginIcon = styled.span<{ $external?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $external }) => ($external ? '#f1f5f9' : '#eff6ff')};
  color: ${({ $external }) => ($external ? '#64748b' : '#2563eb')};
`;

export const DocActionBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f5f9;
  color: #2563eb;
  }

  &:disabled {
    cursor: not-allowed;
  opacity: 0.4;
  }
  &.doc-action-btn-danger:hover {
    background: #fef2f2;
    color: #dc2626;
  }
`;

export const DocActionBtnDanger = styled.button`
  &:hover {
    background: #fef2f2;
  color: #dc2626;
  }
`;

export const DocAlert = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  &.doc-alert-error, &[data-variant='error'] {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
  }
  &.doc-alert-success, &[data-variant='success'] {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #16a34a;
  }
`;

export const DocAlertError = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
`;

export const DocAlertSuccess = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
`;

export const DocBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.15s ease;
  cursor: pointer;
  white-space: nowrap;
  &.doc-btn-outline {
    background: white;
    border: 1px solid #e2e8f0;
    color: #475569;
  }
  &.doc-btn-outline:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }
  &.doc-btn-primary {
    background: #2563eb;
    border: 1px solid #2563eb;
    color: white;
  }
  &.doc-btn-primary:hover {
    background: #1d4ed8;
  }
`;

export const DocBtnOutline = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;

  &:hover {
    border-color: #cbd5e1;
  background: #f8fafc;
  }
`;

export const DocBtnPrimary = styled.button`
  background: #2563eb;
  border: 1px solid #2563eb;
  color: white;

  &:hover {
    background: #1d4ed8;
  }
`;

export const DocCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  overflow: hidden;
`;

export const DocCardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  flex-wrap: wrap;
`;

export const DocCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
`;

export const DocCardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &.doc-card-icon-blue {
    background: #eff6ff;
    color: #2563eb;
  }
`;

export const DocCardIconBlue = styled.div`
  background: #eff6ff;
  color: #2563eb;
`;

export const DocCardSubtitle = styled.div`
  font-size: 12px;
  color: #64748b;
`;

export const DocCardTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
`;

export const DocCardTitleGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

export const DocCardToolbar = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 18px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
`;

export const DocCode = styled.div`
  font-weight: 600;
  color: #1e293b;
`;

export const DocDate = styled.div`
  padding-right: 34px;
`;

export const DocDateCell = styled.td`
  color: #64748b;
  font-size: 12px;
`;

export const DocDateIcon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
`;

export const DocDateWrap = styled.div`
  position: relative;
`;

export const DocFormField = styled.div`
  &.wide {
    grid-column: span 2;
  }

  &:last-child.wide {
    grid-column: span 3;
  }
  &.wide {
    grid-column: span 2;
  }
  &:last-child.wide {
    grid-column: span 3;
  }
`;

export const DocFormHint = styled.div`
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
`;

export const DocFormLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
`;

export const DocHiddenFileInput = styled.input`
  display: none;
`;

export const DocInput = styled.input`
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  color: #1e293b;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s ease;
  font-family: inherit;

  &:focus {
    border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }

  &[readonly] {
    background: #f8fafc;
  color: #64748b;
  }
  &.doc-date {
    padding-right: 34px;
  }
  &.doc-textarea {
    resize: vertical;
    min-height: 72px;
  }
`;

export const DocPageBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled):not(.active) {
    border-color: #cbd5e1;
  background: #f8fafc;
  }

  &.active {
    background: #2563eb;
  border-color: #2563eb;
  color: white;
  }

  &:disabled {
    opacity: 0.4;
  cursor: not-allowed;
  }
  &.active {
    background: #2563eb;
    border-color: #2563eb;
    color: white;
  }
`;

export const DocPageEllipsis = styled.div`
  padding: 0 4px;
  color: #94a3b8;
  font-size: 13px;
`;

export const DocPagination = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const DocRegActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 36px);
  gap: 6px;
  justify-content: end;
`;

export const DocRegAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const DocRegBookmark = styled.div`
  color: #94a3b8;
  display: flex;
`;

export const DocRegCheckCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DocRegCheckbox = styled.input`
  width: 15px;
  height: 15px;
  accent-color: #2563eb;
  cursor: pointer;
`;

export const DocRegCodeCell = styled.td`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 140px;
`;

export const DocRegCodeLink = styled.button`
  border: none;
  background: none;
  padding: 0;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  text-align: left;

  &:hover {
    color: #2563eb;
  }
`;

export const DocRegCodeText = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

export const DocRegColActions = styled.th`
  width: 132px;
`;

export const DocRegColCheck = styled.th`
  width: 56px;
`;

export const DocRegColInfo = styled.th`
  width: 44px;
  text-align: center;
`;

export const DocRegCopyBtn = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f1f5f9;
  color: #475569;
  }
`;

export const DocRegInfoBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #e2e8f0;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #cbd5e1;
  color: #334155;
  }
`;

export const DocRegRoundBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #e2e8f0;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: #cbd5e1;
  color: #334155;
  }
  &.doc-reg-round-btn-primary {
    background: #bfdbfe;
    color: #1d4ed8;
  }
  &.doc-reg-round-btn-primary:hover {
    background: #93c5fd;
  }
  &.doc-reg-round-btn-danger {
    background: #fecdd3;
    color: #be123c;
  }
  &.doc-reg-round-btn-danger:hover {
    background: #fda4af;
  }
`;

export const DocRegRoundBtnDanger = styled.button`
  background: #fecdd3;
  color: #be123c;

  &:hover {
    background: #fda4af;
  }
`;

export const DocRegRoundBtnPrimary = styled.button`
  background: #bfdbfe;
  color: #1d4ed8;

  &:hover {
    background: #93c5fd;
  }
`;

export const DocRegRoundSpacer = styled.div`
  width: 36px;
  height: 36px;
`;

export const DocRegRow = styled.tr`
  &:hover td {
    background: #fafbfc;
  }

  &.selected td {
    background: #f8fbff;
  }
  &.selected td {
    background: #f8fbff;
  }
  &:hover td {
    background: #fafbfc;
  }
`;

export const DocRegStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
`;

export const DocRegStackPrimary = styled.div`
  font-size: 13px;
  color: #334155;
`;

export const DocRegStackSecondary = styled.div`
  font-size: 11px;
  color: #94a3b8;
`;

export const DocRegTable = styled.table`
  width: 100%;
  min-width: 960px;
  border-collapse: collapse;
  font-size: 13px;

  & thead tr {
    border-bottom: 1px solid #e2e8f0;
  }

  & th {
    padding: 14px 12px;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
  white-space: nowrap;
  vertical-align: bottom;
  background: white;
  }

  & th svg {
    display: inline-block;
  vertical-align: middle;
  margin-left: 2px;
  opacity: 0.45;
  }

  & td {
    padding: 14px 12px;
  color: #334155;
  border-bottom: 1px solid #eef2f7;
  vertical-align: middle;
  background: white;
  }
`;

export const DocRegTitleCell = styled.td`
  font-weight: 500;
  color: #0f172a;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DocRegisterEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px 56px;
  text-align: center;
`;

export const DocRegisterEmptyText = styled.div`
  margin: 8px 0 0;
  max-width: 360px;
  font-size: 14px;
  line-height: 1.5;
  color: #64748b;
`;

export const DocRegisterEmptyTitle = styled.div`
  margin: 8px 0 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
`;

export const DocRejectionHint = styled.div`
  margin: 0;
  max-width: 140px;
  font-size: 10px;
  line-height: 1.35;
  color: #b91c1c;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const DocRequired = styled.div`
  color: #ef4444;
  margin-left: 2px;
`;

export const DocResubmitActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 108px;
`;

export const DocResubmitBtn = styled.button`
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #334155;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: #f8fafc;
  border-color: #cbd5e1;
  }

  &:disabled {
    cursor: not-allowed;
  opacity: 0.55;
  }
  &.doc-resubmit-btn-primary {
    background: #2563eb;
    border-color: #2563eb;
    color: white;
  }
  &.doc-resubmit-btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
    border-color: #1d4ed8;
  }
`;

export const DocResubmitBtnPrimary = styled.button`
  background: #2563eb;
  border-color: #2563eb;
  color: white;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  border-color: #1d4ed8;
  }
`;

export const DocRowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

export const DocSelect = styled.select`
  appearance: none;
  padding-right: 30px;
  cursor: pointer;
`;

export const DocSelectChevron = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
`;

export const DocSelectWrap = styled.div`
  position: relative;
`;

export const DocTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  & thead tr {
    background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  }

  & th {
    padding: 10px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
  text-transform: capitalize;
  }

  & th svg {
    display: inline-block;
  vertical-align: middle;
  margin-left: 2px;
  opacity: 0.4;
  }

  & td {
    padding: 12px 14px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
  }

  & tbody tr:hover {
    background: #fafbfc;
  }
`;

export const DocTableCount = styled.div`
  font-size: 12px;
  color: #64748b;
`;

export const DocTableLoading = styled.div`
  padding: 32px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
`;

export const DocTableRowClickable = styled.tr`
  &:hover {
    background: #f8fafc;
  }
`;

export const DocTextarea = styled.textarea`
  resize: vertical;
  min-height: 72px;
`;

export const DocFormGrid = styled.div.attrs({ className: 'doc-form-grid' })`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px 12px;
  padding: 16px 18px 18px;
`;

export const DocRegTableWrap = styled.div.attrs({ className: 'doc-reg-table-wrap' })`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  max-width: 100%;
  background: white;
`;

export const DocTableWrap = styled.div.attrs({ className: 'doc-table-wrap' })`
  overflow-x: auto;
`;

export const DocTableFooter = styled.div.attrs({ className: 'doc-table-footer' })`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
`;

export const MyDrafts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MyDraftsEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px 56px;
  text-align: center;
`;

export const MyDraftsEmptyTitle = styled.h3`
  margin: 8px 0 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
`;

export const MyDraftsEmptyText = styled.p`
  margin: 8px 0 0;
  max-width: 360px;
  font-size: 14px;
  line-height: 1.5;
  color: #64748b;
`;

export function pillVariantFromClass(className: string): string {
  return className.replace(/^doc-reg-pill-/, '');
}

export const DocRegister = styled.div.attrs({ className: 'doc-register' })`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f1f5f9;
  min-height: 100%;
  min-width: 0;

  @media (max-width: 900px) {
    .doc-form-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    
      .doc-form-field.wide {
        grid-column: span 2;
      }
    
      .doc-form-field:last-child.wide {
        grid-column: span 2;
      }
    
      .doc-btn {
        padding: 6px 10px;
        font-size: 12px;
      }
    
      .doc-card-title {
        font-size: 15px;
      }
  }

  @media (max-width: 900px) {
    .doc-form-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    
      .doc-form-field:last-child.wide {
        grid-column: span 2;
      }
  }

  @media (max-width: 900px) {
    .doc-register {
        padding: 12px;
        gap: 12px;
      }
    
      .doc-reg-table {
        min-width: 720px;
      }
    
      .doc-form-grid {
        grid-template-columns: 1fr;
        padding: 14px;
      }
    
      .doc-form-field.wide,
      .doc-form-field:last-child.wide {
        grid-column: span 1;
      }
    
      .doc-card-header {
        flex-direction: column;
        align-items: stretch;
      }
    
      .doc-card-actions {
        width: 100%;
      }
    
      .doc-card-actions .doc-btn {
        flex: 1;
        justify-content: center;
      }
    
      .doc-table-footer {
        flex-direction: column;
        align-items: stretch;
      }
    
      .doc-pagination {
        justify-content: center;
      }
  }

  @media (max-width: 900px) {
    .doc-register {
        padding: 8px;
      }
    
      .doc-card-header,
      .doc-card-toolbar,
      .doc-form-grid {
        padding-left: 12px;
        padding-right: 12px;
      }
    
      .doc-btn {
        white-space: normal;
        text-align: center;
      }
    
      .doc-reg-table {
        min-width: 640px;
      }
  }

`;
