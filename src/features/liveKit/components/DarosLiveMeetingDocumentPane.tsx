import { DocumentFilePreview } from '../../documents/components/DocumentFilePreview';
import type { DocumentRecord } from '../../../types/documents';

interface DarosLiveMeetingDocumentPaneProps {
  document: DocumentRecord | null;
  fileUrl: string | null;
  loading: boolean;
  error: string | null;
  meetingVersion: number;
}

export function DarosLiveMeetingDocumentPane({
  document,
  fileUrl,
  loading,
  error,
  meetingVersion,
}: DarosLiveMeetingDocumentPaneProps) {
  const versionMismatch =
    document &&
    Number.isFinite(document.version) &&
    Math.trunc(document.version) !== meetingVersion;

  return (
    <section className="dl-document-pane" aria-label="Shared document">
      <div className="dl-document-pane-head">
        <div>
          <h2 className="dl-document-pane-title">{document?.title ?? 'Document'}</h2>
          <p className="dl-document-pane-sub">
            Version <strong>v{meetingVersion}</strong>
            {document?.code ? ` · ${document.code}` : ''}
          </p>
        </div>
        {versionMismatch ? (
          <span className="dl-document-version-warn" role="status">
            Document version has changed since this meeting was scheduled.
          </span>
        ) : null}
      </div>

      <div className="dl-document-pane-body">
        {loading ? <p className="dl-document-pane-message">Loading document…</p> : null}
        {error ? <p className="dl-document-pane-error">{error}</p> : null}
        {!loading && !error && !fileUrl ? (
          <p className="dl-document-pane-message">No file attached to this document yet.</p>
        ) : null}
        {fileUrl && document ? (
          <div className="dl-document-preview-wrap">
            <DocumentFilePreview
              fileUrl={fileUrl}
              fileName={document.fileName}
              fileFormat={document.fileFormat}
              title={document.title}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}