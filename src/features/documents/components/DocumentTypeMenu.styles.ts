import styled from 'styled-components';

export const DtMenuAddActions = styled.div`
  display: flex;
  gap: 6px;
`;

export const DtMenuAddBtn = styled.button`
  flex: 1;
  padding: 7px 10px;
  border: none;
  border-radius: 6px;
  background: #1a56db;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  background: #1e429f;
`;

export const DtMenuAddBtnGhost = styled.button`
  background: #f1f5f9;
  color: #475569;

  background: #e2e8f0;
`;

export const DtMenuAddError = styled.div`
  font-size: 12px;
  color: #dc2626;
  margin-bottom: 6px;
`;

export const DtMenuAddForm = styled.div`
  padding: 8px 6px 6px;
`;

export const DtMenuAddInput = styled.input`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 6px;

  outline: none;
  border-color: #1a56db;
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.12);
`;

export const DtMenuAddTrigger = styled.div`
  color: #1a56db;
  font-weight: 500;

  background: #eff6ff;
`;

export const DtMenuAddWrapFirst = styled.div`
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 4px;
  padding-bottom: 4px;
`;

export const DtMenuItem = styled.div`
  display: block;
  width: 100%;
  padding: 9px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #334155;
  font-size: 14px;
  text-align: left;
  cursor: pointer;

  background: #f1f5f9;
  color: #0f172a;

  &.selected {
    background: #eff6ff;
  color: #1a56db;
  font-weight: 500;
  }
`;

export const DtMenuList = styled.div`
  list-style: none;
  margin: 0;
  padding: 6px;
  max-height: 280px;
  overflow-y: auto;
`;

export const DtMenuPanel = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 30;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  overflow: hidden;
`;

export const DtMenuPanelHead = styled.div`
  padding: 10px 12px 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
`;

export const DtMenuPlaceholder = styled.div`
  color: #94a3b8;
`;

export const DtMenuStandard = styled.div`
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 4px;
  border-radius: 0;

  &.selected {
    color: #1a56db;
  }
`;

export const DtMenuTrigger = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #0f172a;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;

  border-color: #cbd5e1;

  &.open {
    border-color: #1a56db;
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.12);
  outline: none;
  }
`;

export const DtMenuValue = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DtMenuWrap = styled.div`
  position: relative;
  width: 100%;

  &.disabled {
    opacity: 0.55;
  pointer-events: none;
  }
`;

