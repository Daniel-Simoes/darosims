import { getSupabaseAdmin } from '@/database/supabase/client';
import {
  getFileExtension,
  isMainDocumentStorageObject,
  MAX_DOCUMENT_FILE_SIZE_BYTES,
  storedDocumentObjectName,
} from '@/lib/documentFileMeta';

const BUCKET = 'darosims-files';

export const MAX_PDF_SIZE_BYTES = MAX_DOCUMENT_FILE_SIZE_BYTES;
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

async function listBucketFiles() {
  const { data, error } = await getSupabaseAdmin().storage.from(BUCKET).list('', { limit: 1000 });
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function deleteStoredMainDocumentObjects(documentId: string) {
  const supabase = getSupabaseAdmin();
  let listed;
  try {
    listed = await listBucketFiles();
  } catch {
    return;
  }

  const paths = listed
    .filter((item) => isMainDocumentStorageObject(item.name, documentId))
  .map((item) => item.name);

  if (!paths.includes(`${documentId}.pdf`)) {
    paths.push(`${documentId}.pdf`);
  }

  const uniquePaths = [...new Set(paths)];
  if (uniquePaths.length) {
    await supabase.storage.from(BUCKET).remove(uniquePaths);
  }
}

export async function savePdfFile(documentId: string, data: Buffer, fileName: string) {
  await deleteStoredMainDocumentObjects(documentId);
  const objectName = storedDocumentObjectName(documentId, fileName);
  const contentType =
    getFileExtension(fileName) === 'pdf' ? 'application/pdf' : 'application/octet-stream';
  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(objectName, data, { upsert: true, contentType });
  if (error) throw new Error(error.message);
}

export async function saveSourceFile(documentId: string, data: Buffer, extension: string) {
  await deleteSourceFiles(documentId);
  const storagePath = getDocumentSourcePath(documentId, extension);
  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(storagePath, data, { upsert: true, contentType: 'application/octet-stream' });
  if (error) throw new Error(error.message);
}

export async function readPdfFile(
  documentId: string,
  fileName?: string,
): Promise<Buffer | null> {
  const supabase = getSupabaseAdmin();

  const objectCandidates = [
    getDocumentFilePath(documentId),
    ...(fileName ? [storedDocumentObjectName(documentId, fileName)] : []),
  ];

  for (const objectName of objectCandidates) {
    const { data, error } = await supabase.storage.from(BUCKET).download(objectName);
    if (!error && data) {
      return Buffer.from(await data.arrayBuffer());
    }
  }

  let listed;
  try {
    listed = await listBucketFiles();
  } catch {
    return null;
  }

  const match = listed.find((item) => isMainDocumentStorageObject(item.name, documentId));
  if (!match) return null;

  const { data, error } = await supabase.storage.from(BUCKET).download(match.name);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
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
  await deleteStoredMainDocumentObjects(documentId);
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
  const paths = listed
    .filter((item) => item.name.startsWith(`${documentId}.source.`))
    .map((item) => item.name);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
}

export async function deleteAllDocumentFiles(documentId: string) {
  await deletePdfFile(documentId);
  await deleteSourceFiles(documentId);
}

function revisionBaselineObjectName(documentId: string, version: number, fileName: string) {
  const safeName = fileName.replace(/[/\\]/g, '_');
  const versionKey = String(version).replace('.', '_');
  return `revision-baseline/${documentId}/v${versionKey}-${safeName}`;
}

function revisionBaselinePrefix(documentId: string, version: number) {
  const versionKey = String(version).replace('.', '_');
  return `revision-baseline/${documentId}/v${versionKey}-`;
}

export async function stageRevisionBaselineFile(
  documentId: string,
  version: number,
  data: Buffer,
  fileName: string,
) {
  const objectName = revisionBaselineObjectName(documentId, version, fileName);
  const contentType =
    getFileExtension(fileName) === 'pdf' ? 'application/pdf' : 'application/octet-stream';
  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(objectName, data, { upsert: true, contentType });
  if (error) throw new Error(error.message);
}

export async function readRevisionBaselineFile(
  documentId: string,
  version: number,
  fileName?: string,
): Promise<Buffer | null> {
  const supabase = getSupabaseAdmin();
  if (fileName?.trim()) {
    const objectName = revisionBaselineObjectName(documentId, version, fileName);
    const { data, error } = await supabase.storage.from(BUCKET).download(objectName);
    if (!error && data) return Buffer.from(await data.arrayBuffer());
  }

  const prefix = revisionBaselinePrefix(documentId, version);
  try {
    const folder = `revision-baseline/${documentId}`;
    const { data, error } = await supabase.storage.from(BUCKET).list(folder, { limit: 1000 });
    if (error || !data) return null;
    const suffix = prefix.slice(prefix.lastIndexOf('/') + 1);
    const match = data.find((item) => item.name.startsWith(suffix));
    if (!match) return null;
    const objectPath = `${folder}/${match.name}`;
    const download = await supabase.storage.from(BUCKET).download(objectPath);
    if (download.error || !download.data) return null;
    return Buffer.from(await download.data.arrayBuffer());
  } catch {
    return null;
  }
}

function archiveObjectName(archiveId: string, fileName: string) {
  const safeName = fileName.replace(/[/\\]/g, '_');
  return `archives/${archiveId}/${safeName}`;
}

export async function writeArchiveStoredFile(
  archiveId: string,
  fileName: string,
  data: Buffer,
) {
  const objectName = archiveObjectName(archiveId, fileName);
  const contentType =
    getFileExtension(fileName) === 'pdf' ? 'application/pdf' : 'application/octet-stream';
  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(objectName, data, { upsert: true, contentType });
  if (error) throw new Error(error.message);
}

export async function readArchiveStoredFile(
  archiveId: string,
  fileName: string,
): Promise<Buffer | null> {
  const objectName = archiveObjectName(archiveId, fileName);
  const { data, error } = await getSupabaseAdmin().storage.from(BUCKET).download(objectName);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}