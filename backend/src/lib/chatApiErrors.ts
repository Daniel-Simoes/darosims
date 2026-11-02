import { jsonResponse } from '@/lib/auth';
import { chatStorageHint, isMissingTableError } from '@/lib/supabaseSchemaCheck';

export function chatErrorResponse(err: unknown, fallbackMessage: string) {
  const message = err instanceof Error ? err.message : fallbackMessage;
  if (isMissingTableError(message)) {
    return jsonResponse(
      {
        error: message,
        hint: chatStorageHint(['document_comments']),
        code: 'CHAT_STORAGE_NOT_CONFIGURED',
      },
      503,
    );
  }
  return jsonResponse({ error: message }, 500);
}
