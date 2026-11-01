import { getDatabaseProvider } from '@/database/provider';
import * as files from '@/repositories/comments/documentCommentRepository.files';
import * as supabase from '@/repositories/comments/documentCommentRepository.supabase';

function repo() {
  return getDatabaseProvider() === 'supabase' ? supabase : files;
}

export async function readAllDocumentComments() {
  return repo().readAllDocumentComments();
}

export async function appendDocumentComment(message: Parameters<typeof files.appendDocumentComment>[0]) {
  return repo().appendDocumentComment(message);
}
