import { getSupabaseAdmin } from '@/database/supabase/client';

type JsonTableName = 'documents' | 'notifications' | 'document_events' | 'document_comments';

export async function fetchAllBodies<T>(table: JsonTableName): Promise<T[]> {
  const { data, error } = await getSupabaseAdmin().from(table).select('body');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.body as T);
}

export async function fetchBodyById<T>(
  table: JsonTableName,
  id: string,
): Promise<T | null> {
  const { data, error } = await getSupabaseAdmin().from(table).select('body').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (data.body as T) : null;
}

export async function upsertBody<T extends { id: string }>(
  table: JsonTableName,
  record: T,
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from(table)
    .upsert({ id: record.id, body: record }, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function deleteById(
  table: JsonTableName,
  id: string,
): Promise<boolean> {
  const { error, count } = await getSupabaseAdmin().from(table).delete({ count: 'exact' }).eq('id', id);
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

/** Mirrors JSON file rewrite: replace table contents with the given list. */
export async function replaceAllBodies<T extends { id: string }>(
  table: JsonTableName,
  records: T[],
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: existing, error: readError } = await supabase.from(table).select('id');
  if (readError) throw new Error(readError.message);

  const nextIds = new Set(records.map((record) => record.id));
  const toRemove = (existing ?? []).map((row) => row.id as string).filter((id) => !nextIds.has(id));

  if (toRemove.length > 0) {
    const { error: deleteError } = await supabase.from(table).delete().in('id', toRemove);
    if (deleteError) throw new Error(deleteError.message);
  }

  if (records.length === 0) return;

  const { error: upsertError } = await supabase
    .from(table)
    .upsert(records.map((record) => ({ id: record.id, body: record })), { onConflict: 'id' });
  if (upsertError) throw new Error(upsertError.message);
}
