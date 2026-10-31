import styled from 'styled-components';

export const DashboardAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
`;

export const DashboardCollapseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: white;
  color: #475569;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  border-color: #cbd5e1;
  background: #f8fafc;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);

  display: none;
`;

export const DashboardContent = styled.div`
  padding: 20px;
  flex: 1;
  min-width: 0;
  @media (max-width: 1280px) {
    & {
      padding: 16px;
    }
  }

  @media (max-width: 600px) {
    & {
      padding: 12px;
    }
  }

`;

export const DashboardContentFull = styled.div`
  padding: 0;
`;

export const DashboardHeader = styled.header`
  background: white;
  border-bottom: 1px solid var(--color-border);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 50;
  @media (max-width: 600px) {
    & {
      padding: 10px 12px;
    flex-wrap: wrap;
    }
    &-title {
      white-space: normal;
    font-size: 0.95rem;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    }
    &-actions {
      width: 100%;
    justify-content: flex-end;
    }
  }

`;

export const DashboardHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  @media (max-width: 600px) {
    & {
      width: 100%;
    justify-content: flex-end;
    }
  }

`;

export const DashboardHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const DashboardHeaderTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  @media (max-width: 1280px) {
    & {
      font-size: 1rem;
    }
  }

  @media (max-width: 600px) {
    & {
      white-space: normal;
    font-size: 0.95rem;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    }
  }

`;

export const DashboardLayout = styled.div.attrs<{ $sidebarCollapsed?: boolean }>((p) => ({
  className: `dashboard-layout${p.$sidebarCollapsed ? ' sidebar-collapsed' : ''}`,
}))<{ $sidebarCollapsed?: boolean }>`
  --sidebar-width: 220px;
  --sidebar-collapsed-width: 68px;
  display: flex;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
  background: var(--color-bg-alt);

  &.sidebar-collapsed {
    --sidebar-width: var(--sidebar-collapsed-width);
  }
  @media (max-width: 1280px) {
    & {
      --sidebar-width: 200px;
    }
  }

  @media (max-width: 1024px) {
    &:not(.sidebar-collapsed) {
      --sidebar-width: 200px;
    }
  }

`;

export const DashboardLogout = styled.img`
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  border-color: #cbd5e1;
  color: #334155;
  @media (max-width: 600px) {
    & {
      padding: 7px 10px;
    font-size: 11px;
    }
  }

`;

export const DashboardMain = styled.main.attrs({ className: 'dashboard-main' })`
  flex: 1;
  min-width: 0;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  transition: margin-left 0.2s ease;
  @media (max-width: 1024px) {
    & {
      margin-left: 0 !important;
    }
  }

`;

export const DashboardMenuBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: white;
  color: #475569;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  border-color: #cbd5e1;
  background: #f8fafc;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);

  display: none;
  @media (max-width: 1024px) {
    & {
      display: flex;
    }
  }

`;

export const DashboardUser = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
`;

export const DashboardUserName = styled.div`
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (max-width: 1024px) {
    & {
      display: none;
    }
  }

`;

export const IsoItem = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 1fr) 2fr auto;
  align-items: center;
  gap: 12px;
  @media (max-width: 1024px) {
    & {
      grid-template-columns: 1fr;
    gap: 8px;
    }
    &-status {
      justify-self: start;
    }
  }

`;

export const IsoItemInfo = styled.div`
  min-width: 0;
`;

export const IsoItemLabel = styled.label`
  font-size: 11px;
  color: var(--color-text-muted);
`;

export const IsoItemName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-dark);
`;

export const IsoItemStatus = styled.div`
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 100px;
  white-space: nowrap;

  &.in-progress {
    background: #dbeafe;
  color: #2563eb;
  }

  &.planned {
    background: #fef3c7;
  color: #d97706;
  }

  &.future {
    background: var(--color-bg-alt);
  color: var(--color-text-light);
  }
  @media (max-width: 1024px) {
    & {
      justify-self: start;
    }
  }

`;

export const IsoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const IsoProgressBar = styled.div`
  height: 8px;
  background: var(--color-bg-alt);
  border-radius: 100px;
  overflow: hidden;
  min-width: 0;
`;

export const IsoProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), #6366f1);
  border-radius: 100px;
  transition: width 0.5s ease;
`;

export const IsoSection = styled.section`
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 20px;
`;

export const IsoSectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 16px;
`;

export const ModuleCard = styled.div`
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 18px;
  transition: all 0.2s ease;
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: inherit;

  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
`;

export const ModuleCardHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
`;

export const ModuleCount = styled.div`
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 100px;
  background: var(--color-bg-alt);
  color: var(--color-text-muted);

  &.warning {
    background: #fef3c7;
  color: #d97706;
  }
`;

export const ModuleDescription = styled.div`
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
`;

export const ModuleIcon = styled.span`
  font-size: 24px;
`;

export const ModuleTitle = styled.h2`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 4px;
`;

export const ModulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  @media (max-width: 1280px) {
    & {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 600px) {
    
  }

`;

export const StatCard = styled.div`
  background: white;
  padding: 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
`;

export const StatChange = styled.div`
  font-size: 11px;
  margin-top: 4px;
  color: var(--color-text-light);

  &.up {
    color: var(--color-success);
  }

  &.down {
    color: var(--color-danger);
  }
`;

export const StatLabel = styled.label`
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 500;
  margin-bottom: 6px;
`;

export const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-dark);
  @media (max-width: 600px) {
    & {
      font-size: 1.5rem;
    }
  }

`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  @media (max-width: 1280px) {
    & {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 1024px) {
    & {
      grid-template-columns: repeat(2, 1fr);
    }
  }

`;

