import { getSupabaseAdmin } from '@/database/supabase/client';

const REQUIRED_TABLES = [
  'users',
  'documents',
  'notifications',
  'document_events',
  'document_comments',
  'document_chat_presence',
] as const;

export type SupabaseSchemaCheckResult = {
  ok: boolean;
  missingTables: string[];
  errors: string[];
};

export async function verifySupabaseSchema(): Promise<SupabaseSchemaCheckResult> {
  const missingTables: string[] = [];
  const errors: string[] = [];

  for (const table of REQUIRED_TABLES) {
    const { error } = await getSupabaseAdmin().from(table).select('*').limit(1);
    if (error) {
      const message = error.message ?? String(error);
      if (
        message.includes('Could not find the table') ||
        message.includes('does not exist') ||
        message.includes('schema cache')
      ) {
        missingTables.push(table);
      } else {
        errors.push(`${table}: ${message}`);
      }
    }
  }

  return {
    ok: missingTables.length === 0 && errors.length === 0,
    missingTables,
    errors,
  };
}

export function chatStorageHint(missingTables: string[]): string | undefined {
  if (missingTables.includes('document_comments')) {
    return 'Run backend/supabase/patch-document-comments.sql (or full schema.sql) in Supabase → SQL Editor, then retry.';
  }
  if (missingTables.includes('document_chat_presence')) {
    return 'Run backend/supabase/patch-document-chat-presence.sql in Supabase → SQL Editor for online/typing indicators.';
  }
  return undefined;
}

export function isMissingTableError(message: string): boolean {
  return (
    message.includes('Could not find the table') ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  );
}
