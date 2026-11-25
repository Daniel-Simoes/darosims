import { useEffect, useState } from 'react';
import { api, fetchDocumentFileBlob } from '../../../lib/api';
import type { DocumentRecord } from '../../../types/documents';
export function useMeetingDocumentPreview(documentId: string | undefined) {
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId?.trim()) return;

    let active = true;
    let objectUrl: string | null = null;

    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const { document: doc } = await api.getDocument(documentId);
        if (!active) return;
        setDocument(doc);

        if (doc.fileName) {
          const blob = await fetchDocumentFileBlob(documentId);
          if (!active) return;
          objectUrl = URL.createObjectURL(blob);
          setFileUrl(objectUrl);
        } else {
          setFileUrl(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Could not load document');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentId]);

  return { document, fileUrl, loading, error };
}