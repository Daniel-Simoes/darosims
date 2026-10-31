import styled from 'styled-components';

export const ProfileActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
  @media (max-width: 720px) {
    & {
      flex-direction: column-reverse;
    }
    & .profile-btn {
      width: 100%;
    }
  }

`;

export const ProfileAlert = styled.div`
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
`;

export const ProfileAlertError = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
`;

export const ProfileAlertSuccess = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
`;

export const ProfileBackBtn = styled.button`
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
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  background: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
`;

export const ProfileBtn = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;

  opacity: 0.6;
  cursor: default;
  @media (max-width: 720px) {
    
  }

`;

export const ProfileBtnGhost = styled.button`
  background: transparent;
  border-color: #e2e8f0;
  color: #64748b;

  background: #f8fafc;
`;

export const ProfileBtnOutline = styled.button`
  background: white;
  border-color: #e2e8f0;
  color: #334155;

  background: #f8fafc;
`;

export const ProfileBtnPrimary = styled.button`
  background: #2563eb;
  color: white;

  background: #1d4ed8;
`;

export const ProfileCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
`;

export const ProfileContent = styled.div`
  width: 50%;
  min-width: 320px;
  max-width: 100%;
  @media (max-width: 900px) {
    & {
      width: 100%;
    }
  }

`;

export const ProfileField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #334155;

  & input {
    width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #0f172a;
  background: white;
  }

  & input:focus {
    outline: none;
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }
`;

export const ProfileFieldFull = styled.div`
  grid-column: 1 / -1;
`;

export const ProfileForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

export const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
`;

export const ProfileLoading = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
`;

export const ProfilePage = styled.div`
  background: #f4f6f9;
  min-height: 100%;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 720px) {
    & {
      padding: 16px;
    }
  }

`;

export const ProfilePermissionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;

  & input {
    accent-color: #2563eb;
  }
`;

export const ProfilePermissions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  @media (max-width: 720px) {
    
  }

`;

export const ProfilePhotoActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const ProfilePhotoFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2563eb;
  color: white;
  font-size: 28px;
  font-weight: 700;
`;

export const ProfilePhotoImage = styled.div`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const ProfilePhotoInput = styled.input`
  display: none;
`;

export const ProfilePhotoPreview = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  background: #eff6ff;
  flex-shrink: 0;
`;

export const ProfilePhotoRow = styled.tr`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

export const ProfileSectionDesc = styled.div`
  font-size: 13px;
  color: #64748b;
  margin: -6px 0 14px;
`;

export const ProfileSectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 14px;
`;

export const ProfileTopbar = styled.div`
  margin-bottom: 16px;
`;

