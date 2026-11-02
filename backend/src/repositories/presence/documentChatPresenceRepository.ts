import { getDatabaseProvider } from '@/database/provider';
import * as files from '@/repositories/presence/documentChatPresenceRepository.files';
import * as supabase from '@/repositories/presence/documentChatPresenceRepository.supabase';

function repo() {
  return getDatabaseProvider() === 'supabase' ? supabase : files;
}

export async function readAllChatPresence() {
  return repo().readAllChatPresence();
}

export async function upsertChatPresence(record: Parameters<typeof files.upsertChatPresence>[0]) {
  return repo().upsertChatPresence(record);
}
