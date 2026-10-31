import styled from 'styled-components';

export const DdAlert = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

export const DdAlertError = styled.div`
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
`;

export const DdAlertSuccess = styled.div`
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
`;

export const DdBackBtn = styled.button`
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
  margin-top: 4px;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  background: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
`;

export const DdBreadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;

  & button {
    background: none;
  border: none;
  padding: 0;
  color: #2563eb;
  cursor: pointer;
  font-size: 12px;
  }
`;

export const DdBreadcrumbsCurrent = styled.div`
  color: #334155;
`;

export const DdBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;

  opacity: 0.6;
  cursor: not-allowed;
`;

export const DdBtnBlock = styled.button`
  width: 100%;
`;

export const DdBtnDanger = styled.button`
  background: white;
  border-color: #fecaca;
  color: #dc2626;

  background: #fef2f2;
`;

export const DdBtnOutline = styled.button`
  background: white;
  border-color: #e2e8f0;
  color: #334155;

  background: #f8fafc;
`;

export const DdBtnPrimary = styled.button`
  background: #1a56db;
  color: white;

  background: #1648b8;
`;

export const DdCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 20px;
`;

export const DdCardTitle = styled.h2`
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
`;

export const DdDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const DdDraftEditor = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
`;

export const DdDraftEditorNote = styled.div`
  margin: 0 0 12px;
  font-size: 13px;
  color: #64748b;
`;

export const DdDraftEditorTitle = styled.h2`
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
`;

export const DdEditField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.wide {
    grid-column: 1 / -1;
  }
`;

export const DdEditGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  @media (max-width: 768px) {
    & {
      grid-template-columns: 1fr;
    }
  }

`;

export const DdEditLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #475569;
`;

export const DdErrorState = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: #64748b;
`;

export const DdInfoLabel = styled.label`
  color: #64748b;
`;

export const DdInfoRow = styled.tr`
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f8fafc;
  font-size: 14px;

  border-bottom: none;
  @media (max-width: 768px) {
    & {
      grid-template-columns: 1fr;
    gap: 4px;
    }
  }

`;

export const DdInfoValue = styled.div`
  color: #0f172a;
  word-break: break-word;
`;

export const DdInput = styled.input`
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #0f172a;
  background: white;

  outline: none;
  border-color: #1a56db;
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.12);
`;

export const DdLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(360px, 480px) minmax(360px, 1fr);
  gap: 20px;
  align-items: start;
  @media (max-width: 1024px) {
    & {
      grid-template-columns: 1fr;
    }
  }

`;

export const DdLoading = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: #64748b;
`;

export const DdPage = styled.div`
  background: #f4f6f9;
  min-height: 100%;
  padding: 0 20px 24px;
  @media (max-width: 768px) {
    & {
      padding: 0 12px 20px;
    }
    &-title {
      font-size: 1.25rem;
    }
  }

`;

export const DdPageTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  @media (max-width: 768px) {
    & {
      font-size: 1.25rem;
    }
  }

`;

export const DdPreviewBody = styled.div`
  padding: 28px 18px;
  text-align: center;
`;

export const DdPreviewFooter = styled.footer`
  padding: 16px 18px;
  border-top: 1px solid #f1f5f9;
`;

export const DdPreviewHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid #f1f5f9;

  & h2 {
    margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  }
`;

export const DdPreviewIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  margin: 0 auto 16px;
  border-radius: 16px;
  background: #eff6ff;
  color: #2563eb;
`;

export const DdPreviewMeta = styled.div`
  margin: 0 0 16px;
  font-size: 13px;
  color: #64748b;
`;

export const DdPreviewTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
`;

export const DdPreviewTitle = styled.h2`
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
`;

export const DdRejectionMeta = styled.div`
  font-size: 12px;
  color: #b91c1c;
`;

export const DdRejectionNotice = styled.div`
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;

  & strong {
    display: block;
  margin-bottom: 6px;
  font-size: 14px;
  }

  & p {
    margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  }
`;

export const DdStatusActive = styled.div`
  background: #dcfce7;
  color: #16a34a;
`;

export const DdStatusBadge = styled.div`
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
`;

export const DdStatusDraft = styled.div`
  background: #fef9c3;
  color: #ca8a04;
`;

export const DdStatusObsolete = styled.div`
  background: #f1f5f9;
  color: #64748b;
`;

export const DdTag = styled.div`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11px;
  background: #f1f5f9;
  color: #475569;
`;

export const DdTextarea = styled.textarea`
  min-height: 88px;
  resize: vertical;
`;

export const DdTopbar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0 20px;
  flex-wrap: wrap;
`;

export const DdTopbarActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const DdTopbarLeft = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

