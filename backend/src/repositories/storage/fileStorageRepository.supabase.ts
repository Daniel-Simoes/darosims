import { getSupabaseAdmin } from '@/database/supabase/client';

const BUCKET = 'darosims-files';

export const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_SOURCE_SIZE_BYTES = 50 * 1024 * 1024;

export async function ensureUploadDir() {
  /* no-op — Supabase Storage */
}

export function getDocumentFilePath(documentId: string) {
  return `${documentId}.pdf`;
}

export function getDocumentSourcePath(documentId: string, extension: string) {
  const safeExt = extension.replace(/^\./, '').toLowerCase();
  return `${documentId}.source.${safeExt}`;
}

export async function savePdfFile(documentId: string, data: Buffer) {
  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(getDocumentFilePath(documentId), data, { upsert: true, contentType: 'application/pdf' });
  if (error) throw new Error(error.message);
}

export async function saveSourceFile(documentId: string, data: Buffer, extension: string) {
  await deleteSourceFiles(documentId);
  const path = getDocumentSourcePath(documentId, extension);
  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(path, data, { upsert: true, contentType: 'application/octet-stream' });
  if (error) throw new Error(error.message);
}

export async function readPdfFile(documentId: string): Promise<Buffer | null> {
  const { data, error } = await getSupabaseAdmin().storage.from(BUCKET).download(getDocumentFilePath(documentId));
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

async function listBucketFiles() {
  const { data, error } = await getSupabaseAdmin().storage.from(BUCKET).list('', { limit: 1000 });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function readSourceFile(
  documentId: string,
): Promise<{ buffer: Buffer; extension: string } | null> {
  const supabase = getSupabaseAdmin();
  let listed;
  try {
    listed = await listBucketFiles();
  } catch {
    return null;
  }
  if (!listed.length) return null;

  const match = listed.find((item) => item.name.startsWith(`${documentId}.source.`));
  if (!match) return null;

  const extension = match.name.slice(`${documentId}.source.`.length);
  const { data, error } = await supabase.storage.from(BUCKET).download(match.name);
  if (error || !data) return null;
  return { buffer: Buffer.from(await data.arrayBuffer()), extension };
}

export async function deletePdfFile(documentId: string) {
  await getSupabaseAdmin().storage.from(BUCKET).remove([getDocumentFilePath(documentId)]);
}

export async function deleteSourceFiles(documentId: string) {
  const supabase = getSupabaseAdmin();
  let listed;
  try {
    listed = await listBucketFiles();
  } catch {
    return;
  }
  if (!listed.length) return;
  const paths = listed.filter((item) => item.name.startsWith(`${documentId}.source.`)).map((item) => item.name);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
}

export async function deleteAllDocumentFiles(documentId: string) {
  await deletePdfFile(documentId);
  await deleteSourceFiles(documentId);
}
