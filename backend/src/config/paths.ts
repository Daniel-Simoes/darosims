import path from 'path';

function resolveDataDir() {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  if (process.env.VERCEL === '1') return path.join('/tmp', 'darosims-data');
  return path.join(process.cwd(), 'data');
}

/** On Vercel without Supabase, defaults to `/tmp/darosims-data` (ephemeral). */
export const DATA_DIR = resolveDataDir();
export const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
export const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
export const DOCUMENT_EVENTS_FILE = path.join(DATA_DIR, 'document_events.json');
export const USERS_FILE = path.join(DATA_DIR, 'users.json');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
export const USER_PHOTOS_DIR = path.join(DATA_DIR, 'user-photos');
