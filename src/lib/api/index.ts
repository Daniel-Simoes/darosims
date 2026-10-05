import { authApi } from './auth';
import { usersApi } from './users';
import { documentsApi } from './documents';
import { notificationsApi } from './notifications';
import { auditApi } from './audit';
import {
  fetchDocumentFileBlob,
  fetchDocumentSourceBlob,
  storageApi,
  uploadDocumentFile,
  uploadDocumentSourceFile,
} from './storage';

export { getStoredToken, setStoredToken, apiFetch } from './client';

export const api = {
  ...authApi,
  ...usersApi,
  ...documentsApi,
  ...notificationsApi,
  ...auditApi,
  uploadDocumentFile,
  uploadDocumentSourceFile,
};

export { fetchDocumentFileBlob, fetchDocumentSourceBlob, storageApi };

export type * from '../../types';
