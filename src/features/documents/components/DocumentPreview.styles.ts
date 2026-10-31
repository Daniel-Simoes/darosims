import styled from 'styled-components';

export const DocPreview = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  position: sticky;
  top: 16px;
  display: flex;
  flex-direction: column;
  min-height: 640px;
  @media (max-width: 1024px) {
    & {
      position: static;
    min-height: auto;
    }
    &-frame-wrap,
  .doc-preview-frame,
  .doc-preview-empty {
      min-height: 360px;
    }
  }

`;

export const DocPreviewBtn = styled.button`
  width: 100%;
  padding: 8px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  background: #f8fafc;

  opacity: 0.5;
  cursor: not-allowed;
`;

export const DocPreviewDesc = styled.div`
  margin: 0 0 10px;
  font-size: 12px;
  color: #64748b;
`;

export const DocPreviewDraft = styled.div`
  min-height: 460px;

  & .doc-preview-frame-wrap {
    min-height: 320px;
  height: 320px;
  padding: 0;
  overflow: hidden;
  }

  & .doc-preview-empty {
    min-height: 320px;
  }
`;

export const DocPreviewEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 480px;
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  @media (max-width: 1024px) {
    
  }

`;

export const DocPreviewEmptyError = styled.div`
  color: #b91c1c;
`;

export const DocPreviewEmptyHint = styled.div`
  margin-top: 6px;
  font-size: 12px;
  color: #94a3b8;
`;

export const DocPreviewEmptyIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-bottom: 12px;
  border-radius: 14px;
  background: #eff6ff;
  color: #2563eb;
`;

export const DocPreviewEmptyIconWord = styled.span`
  background: #dbeafe;
  color: #2563eb;
`;

export const DocPreviewFooter = styled.footer`
  padding: 14px 18px;
`;

export const DocPreviewFormat = styled.div`
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
`;

export const DocPreviewFormatPdf = styled.div`
  background: #fee2e2;
  color: #b91c1c;
`;

export const DocPreviewFormatWord = styled.div`
  background: #dbeafe;
  color: #1d4ed8;
`;

export const DocPreviewFrame = styled.div`
  width: 100%;
  height: 100%;
  min-height: 480px;
  border: none;
  background: white;
`;

export const DocPreviewFrameWrap = styled.div`
  flex: 1;
  min-height: 480px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
`;

export const DocPreviewFullscreen = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  background: #0f172a;

  & .doc-editor {
    flex: 1;
  min-height: 0;
  border-radius: 0;
  }
`;

export const DocPreviewFullscreenAction = styled.div`
  padding: 6px 12px;
  border: 1px solid #475569;
  border-radius: 8px;
  background: transparent;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  background: #334155;
`;

export const DocPreviewFullscreenActionPrimary = styled.div`
  background: #2563eb !important;
  border-color: #2563eb !important;
  color: white !important;

  background: #1d4ed8 !important;
`;

export const DocPreviewFullscreenActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const DocPreviewFullscreenBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
`;

export const DocPreviewFullscreenClose = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #475569;
  border-radius: 8px;
  background: transparent;
  color: #e2e8f0;
  cursor: pointer;

  background: #334155;
`;

export const DocPreviewFullscreenDraft = styled.div`
  background: #f8fafc;

  & .doc-preview-fullscreen-bar {
    background: white;
  border-bottom: 1px solid #e2e8f0;
  }

  & .doc-preview-fullscreen-title {
    color: #0f172a;
  }

  & .doc-preview-fullscreen-file {
    color: #64748b;
  }

  & .doc-preview-fullscreen-close {
    border-color: #e2e8f0;
  color: #334155;
  }

  & .doc-preview-fullscreen-close:hover {
    background: #f1f5f9;
  }
`;

export const DocPreviewFullscreenEditHint = styled.div`
  font-size: 12px;
  color: #92400e;
  background: #fef9c3;
  padding: 4px 10px;
  border-radius: 100px;
  white-space: nowrap;
`;

export const DocPreviewFullscreenFile = styled.div`
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DocPreviewFullscreenFrame = styled.div`
  flex: 1;
  width: 100%;
  border: none;
  background: white;
`;

export const DocPreviewFullscreenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

export const DocPreviewFullscreenTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DocPreviewFullscreenWord = styled.div`
  flex: 1;
  overflow: auto;
  padding: 32px 48px;
  background: white;
  font-size: 15px;
  line-height: 1.65;
  color: #0f172a;
`;

export const DocPreviewFullsizeBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 100px;
  background: white;
  color: #334155;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;

  background: #f8fafc;
  border-color: #cbd5e1;

  opacity: 0.45;
  cursor: not-allowed;
`;

export const DocPreviewHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid #f1f5f9;

  & h2 {
    margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  }
`;

export const DocPreviewHeadActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const DocPreviewMeta = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
`;

export const DocPreviewPdf = styled.div`
  & .doc-preview-frame-wrap {
    min-height: 480px;
  height: 480px;
  padding: 0;
  overflow: hidden;
  }

  & .doc-preview-empty {
    min-height: 480px;
  }
`;

export const DocPreviewSaveMsg = styled.div`
  font-size: 13px;
  color: #16a34a;

  &.error {
    color: #f87171;
  }
`;

export const DocPreviewStatus = styled.div`
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
`;

export const DocPreviewStatusActive = styled.div`
  background: #dcfce7;
  color: #16a34a;
`;

export const DocPreviewStatusDraft = styled.div`
  background: #fef9c3;
  color: #ca8a04;
`;

export const DocPreviewStatusObsolete = styled.div`
  background: #f1f5f9;
  color: #64748b;
`;

export const DocPreviewSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
  word-break: break-word;
`;

export const DocPreviewTag = styled.div`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11px;
  background: #f1f5f9;
  color: #475569;
`;

export const DocPreviewTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const DocPreviewTitle = styled.h2`
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
`;

export const DocPreviewWordContent = styled.div`
  min-height: 480px;
  padding: 24px 28px;
  overflow: auto;
  background: white;
  font-size: 15px;
  line-height: 1.65;
  color: #0f172a;

  & h1 {
    font-size: 1.6rem;
  margin: 0 0 0.75rem;
  }

  & h2 {
    font-size: 1.25rem;
  margin: 1rem 0 0.5rem;
  }

  & p {
    margin: 0 0 0.75rem;
  }

  & ul {
    margin: 0 0 0.75rem 1.25rem;
  }

  & mark {
    background-color: #fef08a;
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
  }
`;

