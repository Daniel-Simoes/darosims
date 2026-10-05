import path from 'path';

export const DATA_DIR = path.join(process.cwd(), 'data');
export const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
export const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
export const DOCUMENT_EVENTS_FILE = path.join(DATA_DIR, 'document_events.json');
export const USERS_FILE = path.join(DATA_DIR, 'users.json');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
export const USER_PHOTOS_DIR = path.join(DATA_DIR, 'user-photos');
