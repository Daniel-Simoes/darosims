import styled from 'styled-components';

export const DocEditor = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  background: white;

  &.disabled {
    opacity: 0.7;
  }
`;

export const DocEditorContent = styled.div`
  min-height: 360px;
  padding: 18px 20px;
  outline: none;
  font-size: 15px;
  line-height: 1.65;
  color: #0f172a;

  content: attr(data-placeholder);
  color: #94a3b8;
  pointer-events: none;
  float: left;
  height: 0;

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
  padding: 0;
  }

  & mark {
    background-color: #fef08a;
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
  }
`;

export const DocEditorContentFullscreen = styled.div`
  min-height: 100%;
`;

export const DocEditorFullscreen = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 0;
  min-height: 0;

  & .doc-editor-toolbar {
    flex-shrink: 0;
  }

  & .doc-editor-content-fullscreen {
    flex: 1;
  min-height: 0;
  max-height: none;
  overflow: auto;
  }
`;

export const DocEditorLoading = styled.div`
  padding: 24px;
  color: #64748b;
  font-size: 14px;
`;

export const DocEditorToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
`;

export const DocEditorToolbarBtn = styled.button`
  padding: 5px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  background: #f1f5f9;

  &.active {
    background: #dbeafe;
  border-color: #93c5fd;
  color: #1d4ed8;
  }

  opacity: 0.45;
  cursor: not-allowed;
`;

export const DocEditorTrackHint = styled.div`
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  color: #92400e;
  background: #fef9c3;
  padding: 4px 10px;
  border-radius: 100px;
`;

