import styled from 'styled-components';

export const DocWordPageContent = styled.div`
  & > div {
    overflow: auto;
  }

  & section.docx {
    margin: 0 auto;
  box-shadow: none;
  }

  & mark {
    background-color: #fef08a;
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
  }
`;

export const DocWordPageLabel = styled.label`
  font-size: 10px;
  font-weight: 600;
  color: #e2e8f0;
`;

export const DocWordPageSheet = styled.div`
  width: 100%;
  max-width: 100%;
  background: white;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.22);
  border-radius: 2px;
  overflow: hidden;
`;

export const DocWordPageText = styled.div`
  margin: 0;
  padding: 28px 32px;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  color: #0f172a;
`;

export const DocWordPageThumb = styled.div`
  width: 68px;
  height: 88px;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 4px;
  background: white;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.2);
  position: relative;
  @media (max-width: 1024px) {
    & {
      width: 56px;
    height: 72px;
    }
  }

`;

export const DocWordPageThumbBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  &.active .doc-word-page-thumb {
    border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.35);
  }

  &.active .doc-word-page-label {
    color: #93c5fd;
  }
`;

export const DocWordPageThumbContent = styled.div`
  transform: scale(0.18);
  transform-origin: top left;
  width: 555%;
  pointer-events: none;
`;

export const DocWordPageThumbText = styled.div`
  margin: 0;
  padding: 6px;
  font-size: 7px;
  line-height: 1.3;
  white-space: pre-wrap;
  color: #0f172a;
  overflow: hidden;
  height: 100%;
`;

export const DocWordPageToolbar = styled.div`
  flex-shrink: 0;
  padding: 6px 12px;
  background: #334155;
  color: #f8fafc;
  font-size: 11px;
  font-weight: 600;
`;

export const DocWordPageViewport = styled.div`
  flex: 1;
  overflow: auto;
  padding: 14px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

export const DocWordPages = styled.div`
  display: grid;
  grid-template-columns: 92px 1fr;
  height: 100%;
  min-height: 320px;
  background: #525659;
  @media (max-width: 1024px) {
    & {
      grid-template-columns: 76px 1fr;
    }
  }

`;

export const DocWordPagesMain = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
`;

export const DocWordPagesSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 8px;
  overflow-y: auto;
  background: #475569;
  border-right: 1px solid #334155;
`;

export const DocWordPreviewEmpty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 24px;
  color: #64748b;
  font-size: 14px;
  background: #f8fafc;
`;

export const DocWordPreviewHidden = styled.div`
  position: fixed;
  left: -10000px;
  top: 0;
  visibility: hidden;
  pointer-events: none;

  & .docx-wrapper {
    background: transparent;
  padding: 0;
  }
`;

export const DocWordPreviewLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 24px;
  color: #64748b;
  font-size: 14px;
  background: #f8fafc;
`;

