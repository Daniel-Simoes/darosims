import styled from 'styled-components';

export const ListSearchBarRoot = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 240px;
  max-width: 360px;
  flex: 1;
  padding: 0 12px;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus-within {
    border-color: #1a56db;
    box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.12);
  }
`;

export const ListSearchBarIcon = styled.svg`
  flex-shrink: 0;
  color: #94a3b8;
`;

export const ListSearchBarInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #0f172a;
  outline: none;

  &::placeholder {
    color: #94a3b8;
  }

  &::-webkit-search-cancel-button {
    cursor: pointer;
  }
`;
