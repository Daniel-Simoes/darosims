import { joinPath } from '@/lib/joinPath';

function resolveDataDir() {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  if (process.env.VERCEL === '1') return joinPath('/tmp', 'darosims-data');
  return joinPath(process.cwd(), 'data');
}

/** On Vercel without Supabase, defaults to `/tmp/darosims-data` (ephemeral). */
export const DATA_DIR = resolveDataDir();
export const DOCUMENTS_FILE = joinPath(DATA_DIR, 'documents.json');
export const NOTIFICATIONS_FILE = joinPath(DATA_DIR, 'notifications.json');
export const DOCUMENT_EVENTS_FILE = joinPath(DATA_DIR, 'document_events.json');
export const USERS_FILE = joinPath(DATA_DIR, 'users.json');
export const UPLOAD_DIR = joinPath(DATA_DIR, 'uploads');
export const USER_PHOTOS_DIR = joinPath(DATA_DIR, 'user-photos');
