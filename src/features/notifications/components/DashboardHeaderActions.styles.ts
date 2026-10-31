import styled from 'styled-components';

export const DhaCompanyHead = styled.div`
  align-items: center;
  gap: 10px;
`;

export const DhaCompanyLogo = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
`;

export const DhaCompanyLogoBtn = styled.button`
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  background: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.12);
`;

export const DhaCompanyLogoFallback = styled.img`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f766e;
  color: white;
  font-size: 13px;
  font-weight: 700;
`;

export const DhaCompanyLogoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const DhaCompanyLogoSm = styled.img`
  width: 32px;
  height: 32px;
`;

export const DhaCompanyMenuName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
`;

export const DhaCompanyMenuSubtitle = styled.p`
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
`;

export const DhaDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 240px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  z-index: 200;
  overflow: hidden;
`;

export const DhaDropdownCompany = styled.div`
  min-width: 240px;
  @media (max-width: 640px) {
    
  }

`;

export const DhaDropdownDivider = styled.div`
  height: 1px;
  margin: 4px 0;
  background: #f1f5f9;
`;

export const DhaDropdownHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
`;

export const DhaDropdownItem = styled.div`
  display: block;
  width: 100%;
  padding: 11px 14px;
  border: none;
  background: none;
  text-align: left;
  font-size: 13px;
  color: #334155;
  cursor: pointer;

  background: #f8fafc;

  &.danger {
    color: #dc2626;
  }
`;

export const DhaDropdownNotifications = styled.div`
  top: calc(100% + 6px);
  right: 50%;
  transform: translateX(50%);
  width: 300px;
  min-width: 0;
  pointer-events: auto;
  overflow: visible;
  border-radius: 14px;
  box-shadow:
    0 4px 6px rgba(15, 23, 42, 0.04),
    0 12px 28px rgba(15, 23, 42, 0.12);

  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 10px;
  height: 10px;
  background: white;
  border-top: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  z-index: 1;

  & .dha-dropdown-head {
    position: relative;
  z-index: 2;
  border-radius: 14px 14px 0 0;
  background: white;
  }

  & .dha-notification-list {
    position: relative;
  z-index: 2;
  background: white;
  border-radius: 0 0 14px 14px;
  }
  @media (max-width: 640px) {
    & {
      width: min(280px, calc(100vw - 32px));
    right: 0;
    transform: none;
    }
    &::before {
      left: auto;
    right: 10px;
    transform: rotate(45deg);
    }
  }

`;

export const DhaDropdownUser = styled.div`
  min-width: 240px;
`;

export const DhaIconBtn = styled.button`
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  background: white;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  background: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
`;

export const DhaMenuTrigger = styled.div`
  cursor: default;
  pointer-events: none;

  &.active {
    background: #f8fafc;
  border-color: #cbd5e1;
  }
`;

export const DhaMenuWrap = styled.div`
  position: relative;
`;

export const DhaMenuWrapCompany = styled.div`
  position: relative;

  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 8px;

  background: #f8fafc;
  border-color: #cbd5e1;
`;

export const DhaMenuWrapNotifications = styled.div`
  position: relative;

  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 8px;

  background: #f8fafc;
  border-color: #cbd5e1;
`;

export const DhaMenuWrapUser = styled.div`
  position: relative;

  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 8px;

  background: #f8fafc;
  border-color: #cbd5e1;
`;

export const DhaNotifBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DhaNotifBtn = styled.button`
  position: relative;
`;

export const DhaNotificationEmpty = styled.div`
  padding: 20px 16px;
  text-align: center;
  font-size: 13px;
  color: #64748b;
`;

export const DhaNotificationFooter = styled.footer`
  position: relative;
  z-index: 2;
  padding: 10px 14px 12px;
  border-top: 1px solid #f1f5f9;
  background: white;
  border-radius: 0 0 14px 14px;
`;

export const DhaNotificationItem = styled.div`
  display: flex;
  align-items: stretch;
  gap: 0;
  border-bottom: 1px solid #f8fafc;
  background: white;

  border-bottom: none;

  &.unread .dha-notification-item-body {
    background: #f8fbff;
  }
`;

export const DhaNotificationItemBody = styled.div`
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;

  background: #f8fafc;
`;

export const DhaNotificationList = styled.div`
  max-height: 320px;
  overflow-y: auto;
`;

export const DhaNotificationMarkRead = styled.div`
  flex-shrink: 0;
  align-self: center;
  margin-right: 10px;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;

  background: #f8fafc;
  border-color: #cbd5e1;

  opacity: 0.6;
  cursor: default;
`;

export const DhaNotificationMessage = styled.div`
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
`;

export const DhaNotificationTime = styled.div`
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
`;

export const DhaNotificationTitle = styled.h2`
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 2px;
`;

export const DhaNotificationViewAll = styled.div`
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  background: #dbeafe;
`;

export const DhaRoot = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  @media (max-width: 640px) {
    & {
      gap: 6px;
    }
  }

`;

export const DhaUnreadPill = styled.div`
  background: #eff6ff;
  color: #2563eb;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
`;

export const DhaUserAvatar = styled.div`
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
  flex-shrink: 0;
`;

export const DhaUserHead = styled.div`
  align-items: center;
  gap: 10px;
`;

export const DhaUserLogoBtn = styled.button`
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  background: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
`;

export const DhaUserLogoFallback = styled.img`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2563eb;
  color: white;
  font-size: 13px;
  font-weight: 700;
`;

export const DhaUserMenuEmail = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
`;

export const DhaUserMenuName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
`;

