import { authApi } from './auth';
import { usersApi } from './users';
import { documentsApi } from './documents';
import { documentFieldOptionsApi } from './documentFieldOptions';
import { documentArchivesApi, fetchArchiveFileBlob } from './documentArchives';
import { notificationsApi } from './notifications';
import { auditApi } from './audit';
import { chatsApi } from './chats';
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
  ...documentFieldOptionsApi,
  ...documentArchivesApi,
  ...notificationsApi,
  ...auditApi,
  ...chatsApi,
  uploadDocumentFile,
  uploadDocumentSourceFile,
};

export { fetchDocumentFileBlob, fetchDocumentSourceBlob, storageApi, fetchArchiveFileBlob };

export type * from '../../types';
