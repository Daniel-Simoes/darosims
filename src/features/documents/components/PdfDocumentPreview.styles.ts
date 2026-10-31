import styled from 'styled-components';

export const DocPdfMainCanvas = styled.div`
  display: block;
  max-width: 100%;
  height: auto;
  background: white;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.22);
  border-radius: 2px;
`;

export const DocPdfPageSheet = styled.div`
  width: auto;
  max-width: none;
  background: transparent;
  box-shadow: none;
  display: inline-flex;
`;

export const DocPdfPageViewport = styled.div`
  background: #525659;
`;

export const DocPdfPages = styled.div`
  & .doc-pdf-page-thumb {
    display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  }
`;

export const DocPdfThumbImage = styled.div`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const DocPdfToolbarTitle = styled.h2`
  margin-left: auto;
  font-weight: 500;
  color: #cbd5e1;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DocWordPageToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

