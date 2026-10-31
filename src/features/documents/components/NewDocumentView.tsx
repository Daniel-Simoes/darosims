import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { api, type CreateDocumentPayload, type DocumentRecord } from '../../../lib/api';
import { generateDocumentCode } from '../../../lib/documentCode';
import {
  formatFileSize,
  getInternalFileKind,
  verifyPdfFile,
  verifyInternalDocumentFile,
} from '../../../lib/documentUpload';
import {
  parseDocxFile,
  parseTextFile,
} from '../../../lib/documentContent';
import { useTeamUsers } from '../../../context/TeamUsersContext';
import { isDocumentOwnerSameAsUser } from '../../../lib/documentUsers';
import { useAuth } from '../../../context/AuthContext';
import { DocumentTypeMenu } from './DocumentTypeMenu';
import { ProcessMenu } from './ProcessMenu';
import { OptionPickerMenu } from './OptionPickerMenu';
import { ConfirmDialog } from '../../../components/dialogs/ConfirmDialog';
import './NewDocumentView.css';

const DEPARTMENTS = ['Quality', 'Production', 'HR', 'Operations', 'Management'];

type DocumentStructure = '' | 'organisation' | 'daros';

const emptyInternalForm = {
  type: '',
  process: '',
  documentCode: '',
  title: '',
  owner: '',
};

const emptyExternalForm = {
  type: '',
  process: '',
  externalRef: '',
  externalVersion: '',
  title: '',
  externalIssuer: '',
  department: '',
};

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="nd-field">
      <label className="nd-label">
        {label}
        {required && <span className="nd-required">*</span>}
      </label>
      {children}
      {hint && <span className="nd-hint">{hint}</span>}
    </div>
  );
}

function appendCustomOption(setter: Dispatch<SetStateAction<string[]>>, label: string) {
  setter((prev) => {
    if (prev.some((item) => item.toLowerCase() === label.toLowerCase())) {
      return prev;
    }
    return [...prev, label];
  });
}

interface NewDocumentViewProps {
  onSavedAsDraft?: () => void;
  onSubmittedForApproval?: () => void;
}

function getFileCheckingMessage(file: File, origin: 'internal' | 'external') {
  if (origin === 'external') {
    return {
      title: 'Checking PDF format...',
      subtitle: 'Verifying that the file is a valid PDF document',
    };
  }

  const kind = getInternalFileKind(file);
  if (kind === 'txt') {
    return {
      title: 'Checking text file...',
      subtitle: 'Verifying that the file is a valid text document',
    };
  }

  return {
    title: 'Checking Word document...',
    subtitle: 'Verifying that the file is a valid Word document',
  };
}

export function NewDocumentView({
  onSavedAsDraft,
  onSubmittedForApproval,
}: NewDocumentViewProps) {
  const { user } = useAuth();
  const teamUsers = useTeamUsers();
  const ownerOptions = teamUsers.map((entry) => entry.name);
  const pageTopRef = useRef<HTMLDivElement>(null);
  const ownerFieldRef = useRef<HTMLDivElement>(null);
  const [documentStructure, setDocumentStructure] = useState<DocumentStructure>('');
  const [origin, setOrigin] = useState<'internal' | 'external'>('internal');
  const [internalForm, setInternalForm] = useState(emptyInternalForm);
  const [externalForm, setExternalForm] = useState(emptyExternalForm);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [fileUploadStatus, setFileUploadStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [fileCheckingMessage, setFileCheckingMessage] = useState({ title: '', subtitle: '' });
  const [showOwnerConfirmDialog, setShowOwnerConfirmDialog] = useState(false);
  const [customDocumentTypes, setCustomDocumentTypes] = useState<string[]>([]);
  const [customProcesses, setCustomProcesses] = useState<string[]>([]);
  const [customOwners, setCustomOwners] = useState<string[]>([]);
  const [customDepartments, setCustomDepartments] = useState<string[]>([]);

  const loadDocuments = useCallback(async () => {
    try {
      const { documents: data } = await api.getDocuments();
      setDocuments(data);
    } catch {
      // Code preview still works without the full register list.
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const scrollToFormMessage = useCallback(() => {
    pageTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelector('.dashboard-main')?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  function showFormError(message: string) {
    setSuccess('');
    setError(message);
    requestAnimationFrame(() => {
      scrollToFormMessage();
    });
  }

  function updateInternalField<K extends keyof typeof emptyInternalForm>(
    key: K,
    value: (typeof emptyInternalForm)[K],
  ) {
    setInternalForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateExternalField<K extends keyof typeof emptyExternalForm>(
    key: K,
    value: (typeof emptyExternalForm)[K],
  ) {
    setExternalForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleDocumentStructureChange(value: DocumentStructure) {
    setDocumentStructure(value);
    setInternalForm({
      ...emptyInternalForm,
      type: value === 'daros' ? 'Form' : '',
    });
    resetFileState();
  }

  const usesOrganisationStructure = documentStructure === 'organisation';
  const usesDarosStructure = documentStructure === 'daros';
  const internalDetailsEnabled = origin === 'internal' && documentStructure !== '';
  const externalDetailsEnabled = origin === 'external';

  const activeDetailsEnabled =
    origin === 'internal' ? internalDetailsEnabled : externalDetailsEnabled;

  function resetFileState() {
    setSelectedFile(null);
    setFileError('');
    setFileUploadStatus('idle');
  }

  function handleCancel() {
    setDocumentStructure('');
    setInternalForm(emptyInternalForm);
    setExternalForm(emptyExternalForm);
    setOrigin('internal');
    resetFileState();
    setSuccess('');
    setError('');
  }

  async function handleFileSelect(file: File | undefined) {
    if (!file || !activeDetailsEnabled) return;

    setFileCheckingMessage(getFileCheckingMessage(file, origin));
    setFileUploadStatus('checking');
    setSelectedFile(null);
    setFileError('');

    const validationError =
      origin === 'external'
        ? await verifyPdfFile(file)
        : await verifyInternalDocumentFile(file);

    if (validationError) {
      setFileError(validationError);
      setFileUploadStatus('error');
      return;
    }

    setSelectedFile(file);
    setFileUploadStatus('success');
  }

  function handleSubmitForApprovalClick() {
    if (origin === 'internal' && isDocumentOwnerSameAsUser(user, internalForm.owner)) {
      setShowOwnerConfirmDialog(true);
      return;
    }

    void handleSave(false);
  }

  function handleConfirmSubmitForApproval() {
    setShowOwnerConfirmDialog(false);
    void handleSave(false);
  }

  function handleChangeDocumentOwner() {
    setShowOwnerConfirmDialog(false);
    window.setTimeout(() => {
      ownerFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ownerFieldRef.current?.querySelector<HTMLElement>('.dt-menu-trigger')?.focus();
    }, 0);
  }

  async function handleSave(asDraft = true) {
    setError('');
    setSuccess('');

    const activeForm = origin === 'internal' ? internalForm : externalForm;
    if (origin === 'external' && !externalForm.externalVersion.trim()) {
      showFormError('Version / Edition is required for external documents.');
      return;
    }

    if (origin === 'internal' && !documentStructure) {
      showFormError('Please select a document structure option.');
      return;
    }

    if (origin === 'internal' && !internalForm.owner.trim()) {
      showFormError('Document owner is required.');
      return;
    }

    if (!activeForm.type.trim()) {
      showFormError('Document type is required.');
      return;
    }

    if (!activeForm.process.trim()) {
      showFormError('Process is required.');
      return;
    }

    if (!activeForm.title.trim()) {
      showFormError('Document title is required.');
      return;
    }

    if (origin === 'internal' && usesOrganisationStructure && !internalForm.documentCode.trim()) {
      showFormError('Document code is required when using your organisation’s structure.');
      return;
    }

    const internalCodesInUse = documents
      .filter((doc) => doc.documentOrigin !== 'External')
      .map((doc) => doc.code)
      .filter(Boolean);
    if (
      origin === 'internal' &&
      usesOrganisationStructure &&
      internalCodesInUse.some(
        (code) => code.toLowerCase() === internalForm.documentCode.trim().toLowerCase(),
      )
    ) {
      showFormError('This document code is already in use.');
      return;
    }

    setIsSaving(true);

    try {
      const payload: CreateDocumentPayload = {
        type: activeForm.type.trim(),
        hasIso: origin === 'internal' && usesOrganisationStructure,
        ...(origin === 'internal' && usesOrganisationStructure
          ? { code: internalForm.documentCode.trim() }
          : {}),
        process: activeForm.process.trim(),
        title: activeForm.title.trim(),
        ...(origin === 'internal' ? { version: 0 } : {}),
        documentOrigin: origin === 'internal' ? 'Internal' : 'External',
        status: origin === 'internal' ? 'Draft' : 'Active',
        owner: origin === 'internal' ? internalForm.owner.trim() : undefined,
        department: origin === 'external' ? externalForm.department || undefined : undefined,
        externalRef:
          origin === 'external' ? externalForm.externalRef.trim() || undefined : undefined,
        externalVersion:
          origin === 'external' ? externalForm.externalVersion.trim() : undefined,
      };

      const { document } = await api.createDocument(payload);
      let savedDocument = document;

      if (origin === 'internal' && selectedFile) {
        const kind = getInternalFileKind(selectedFile);
        try {
          const sourceContent =
            kind === 'docx'
              ? await parseDocxFile(selectedFile)
              : kind === 'txt'
                ? await parseTextFile(selectedFile)
                : '';

          await api.uploadDocumentSourceFile(document.id, selectedFile);

          const { document: withContent } = await api.updateDocument(document.id, {
            sourceContent,
            fileFormat: 'word',
            fileName: selectedFile.name,
            sourceModified: false,
          });
          savedDocument = withContent;
        } catch {
          showFormError('Unable to read the uploaded file. Please try another document.');
          setIsSaving(false);
          return;
        }
      } else if (origin === 'external' && selectedFile) {
        const { document: withFile } = await api.uploadDocumentFile(document.id, selectedFile);
        savedDocument = withFile;
      }

      setDocuments((prev) => [savedDocument, ...prev]);
      setDocumentStructure('');
      setInternalForm(emptyInternalForm);
      setExternalForm(emptyExternalForm);
      resetFileState();

      if (asDraft && origin === 'internal') {
        onSavedAsDraft?.();
        return;
      }

      if (!asDraft && origin === 'internal') {
        await api.submitDocumentForApproval(savedDocument.id);
        onSubmittedForApproval?.();
        return;
      }

      const savedLabel =
        origin === 'external'
          ? document.externalRef || document.title
          : document.code;
      setSuccess(
        asDraft
          ? `Document "${savedLabel}" saved as draft.`
          : `Document "${savedLabel}" submitted for approval.`,
      );
    } catch (err) {
      showFormError(err instanceof Error ? err.message : 'Failed to save document');
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    handleSave(true);
  }

  const existingCodes = documents
    .filter((doc) => doc.documentOrigin !== 'External')
    .map((doc) => doc.code);
  const previewCode = useMemo(
    () =>
      usesDarosStructure && internalForm.type && internalForm.process
        ? generateDocumentCode(
            internalForm.type,
            internalForm.process,
            existingCodes.filter(Boolean),
          )
        : '',
    [usesDarosStructure, internalForm.type, internalForm.process, existingCodes],
  );

  return (
    <div className="nd-page" ref={pageTopRef}>
      {(error || success) && (
        <div className={`nd-alert ${error ? 'nd-alert-error' : 'nd-alert-success'}`}>
          {error || success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="nd-form">
        {/* Section 1: Document Structure */}
        <section className="nd-section">
          <div className="nd-section-head">
            <div className="nd-section-num">1</div>
            <div>
              <h2 className="nd-section-title">
                Document Structure <span className="nd-required">*</span>
              </h2>
              <p className="nd-section-desc">
                Choose how document codes and naming are managed for internal documents.
              </p>
            </div>
          </div>

          <div className="nd-origin-cards">
            <button
              type="button"
              className={`nd-origin-card ${documentStructure === 'organisation' ? 'active' : ''}`}
              onClick={() => handleDocumentStructureChange('organisation')}
            >
              <span className={`nd-radio ${documentStructure === 'organisation' ? 'checked' : ''}`} />
              <div>
                <strong>Use my organisation&apos;s existing structure</strong>
                <p>I already have document codes and naming conventions.</p>
              </div>
            </button>
            <button
              type="button"
              className={`nd-origin-card ${documentStructure === 'daros' ? 'active' : ''}`}
              onClick={() => handleDocumentStructureChange('daros')}
            >
              <span className={`nd-radio ${documentStructure === 'daros' ? 'checked' : ''}`} />
              <div>
                <strong>Create a structure with DAROS</strong>
                <p>DAROS will generate document codes automatically based on document type and process.</p>
              </div>
            </button>
          </div>
        </section>

        {/* Section 2: Document Origin */}
        <section className="nd-section">
          <div className="nd-section-head">
            <div className="nd-section-num">2</div>
            <div>
              <h2 className="nd-section-title">Document Origin</h2>
              <p className="nd-section-desc">Choose whether the document is created internally or comes from an external source.</p>
            </div>
          </div>

          <div className="nd-origin-cards">
            <button
              type="button"
              className={`nd-origin-card ${origin === 'internal' ? 'active' : ''}`}
              onClick={() => {
                setOrigin('internal');
                resetFileState();
              }}
            >
              <span className={`nd-radio ${origin === 'internal' ? 'checked' : ''}`} />
              <div>
                <strong>Internal</strong>
                <p>Document created within the organisation.</p>
              </div>
            </button>
            <button
              type="button"
              className={`nd-origin-card ${origin === 'external' ? 'active' : ''}`}
              onClick={() => {
                setOrigin('external');
                resetFileState();
              }}
            >
              <span className={`nd-radio ${origin === 'external' ? 'checked' : ''}`} />
              <div>
                <strong>External</strong>
                <p>Document created and controlled by an external organisation.</p>
              </div>
            </button>
          </div>
        </section>

        {/* Section 3: Document Information */}
        <section className={`nd-section ${origin === 'internal' && !documentStructure ? 'nd-section-locked' : ''}`}>
          <div className="nd-section-head">
            <div className="nd-section-num">3</div>
            <div>
              <h2 className="nd-section-title">Document Information</h2>
              <p className="nd-section-desc">Provide the document details based on the selected origin.</p>
            </div>
          </div>

          <div className="nd-info-grid">
            {/* Internal panel */}
            <div className={`nd-info-panel ${origin === 'internal' ? 'active' : 'inactive'}`}>
              <div className="nd-info-panel-head">
                <h3>Document Information (Internal)</h3>
                <span
                  className={`nd-badge ${
                    usesOrganisationStructure
                      ? 'nd-badge-amber'
                      : usesDarosStructure
                        ? 'nd-badge-green'
                        : 'nd-badge-blue'
                  }`}
                >
                  {usesOrganisationStructure
                    ? 'Your organisation’s codes and naming'
                    : usesDarosStructure
                      ? 'Auto-controlled by DAROS'
                      : 'Select document structure first'}
                </span>
              </div>
              <div className="nd-fields">
                <Field label="Document Type" required>
                  <DocumentTypeMenu
                    value={internalForm.type}
                    onChange={(v) => updateInternalField('type', v)}
                    disabled={origin !== 'internal' || !internalDetailsEnabled}
                    customOptions={customDocumentTypes}
                    onAddCustomOption={(label) => appendCustomOption(setCustomDocumentTypes, label)}
                  />
                </Field>
                <Field label="Process" required>
                  <ProcessMenu
                    value={internalForm.process}
                    onChange={(v) => updateInternalField('process', v)}
                    disabled={origin !== 'internal' || !internalDetailsEnabled}
                    customOptions={customProcesses}
                    onAddCustomOption={(label) => appendCustomOption(setCustomProcesses, label)}
                  />
                </Field>
                {internalDetailsEnabled ? (
                  <Field
                    label="Document Code"
                    required={usesOrganisationStructure}
                    hint={
                      usesOrganisationStructure
                        ? 'Enter the code from your document control system'
                        : 'Automatically generated from document type and process'
                    }
                  >
                    {usesOrganisationStructure ? (
                      <input
                        className="nd-input"
                        placeholder="e.g. QMS-PR-0042"
                        value={internalForm.documentCode}
                        onChange={(e) => updateInternalField('documentCode', e.target.value)}
                        disabled={origin !== 'internal'}
                        required
                      />
                    ) : (
                      <div className="nd-locked-input">
                        <input className="nd-input" value={previewCode || '—'} readOnly />
                        <LockIcon />
                      </div>
                    )}
                  </Field>
                ) : null}
                <Field label="Document Title" required>
                  <input
                    className="nd-input"
                    placeholder="Enter document title"
                    value={internalForm.title}
                    onChange={(e) => updateInternalField('title', e.target.value)}
                    disabled={origin !== 'internal' || !internalDetailsEnabled}
                    required={origin === 'internal'}
                  />
                </Field>
                <div ref={ownerFieldRef}>
                  <Field
                    label="Document Owner"
                    required
                    hint="Person responsible for approving this document"
                  >
                    <OptionPickerMenu
                      panelLabel="Document Owner"
                      value={internalForm.owner}
                      onChange={(v) => updateInternalField('owner', v)}
                      options={ownerOptions}
                      customOptions={customOwners}
                      onAddCustomOption={(label) => appendCustomOption(setCustomOwners, label)}
                      placeholder="Select document owner..."
                      disabled={origin !== 'internal' || !internalDetailsEnabled}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* External panel */}
            <div className={`nd-info-panel ${origin === 'external' ? 'active' : 'inactive'}`}>
              <div className="nd-info-panel-head">
                <h3>Document Information (External)</h3>
                <span className="nd-badge nd-badge-blue">Control reference only</span>
              </div>
              <div className="nd-fields">
                <Field label="Document Type" required>
                  <DocumentTypeMenu
                    value={externalForm.type}
                    onChange={(v) => updateExternalField('type', v)}
                    disabled={origin !== 'external' || !externalDetailsEnabled}
                    customOptions={customDocumentTypes}
                    onAddCustomOption={(label) => appendCustomOption(setCustomDocumentTypes, label)}
                  />
                </Field>
                <Field label="Process" required>
                  <ProcessMenu
                    value={externalForm.process}
                    onChange={(v) => updateExternalField('process', v)}
                    disabled={origin !== 'external' || !externalDetailsEnabled}
                    customOptions={customProcesses}
                    onAddCustomOption={(label) => appendCustomOption(setCustomProcesses, label)}
                  />
                </Field>
                <Field label="External Document Reference" required>
                  <input
                    className="nd-input"
                    placeholder="Enter external reference"
                    value={externalForm.externalRef}
                    onChange={(e) => updateExternalField('externalRef', e.target.value)}
                    disabled={origin !== 'external' || !externalDetailsEnabled}
                  />
                </Field>
                <Field label="Version / Edition" required hint="Enter the version or edition from the external source">
                  <input
                    className="nd-input"
                    placeholder="e.g. 1.0, Rev 2"
                    value={externalForm.externalVersion}
                    onChange={(e) => updateExternalField('externalVersion', e.target.value)}
                    disabled={origin !== 'external' || !externalDetailsEnabled}
                    required={origin === 'external'}
                  />
                </Field>
                <Field label="Document Title" required>
                  <input
                    className="nd-input"
                    placeholder="Enter document title"
                    value={externalForm.title}
                    onChange={(e) => updateExternalField('title', e.target.value)}
                    disabled={origin !== 'external' || !externalDetailsEnabled}
                  />
                </Field>
                <Field label="External Issuer" required>
                  <input
                    className="nd-input"
                    placeholder="Organisation name"
                    value={externalForm.externalIssuer}
                    onChange={(e) => updateExternalField('externalIssuer', e.target.value)}
                    disabled={origin !== 'external' || !externalDetailsEnabled}
                  />
                </Field>
                <Field label="Department" required>
                  <OptionPickerMenu
                    panelLabel="Department"
                    value={externalForm.department}
                    onChange={(v) => updateExternalField('department', v)}
                    options={DEPARTMENTS}
                    customOptions={customDepartments}
                    onAddCustomOption={(label) => appendCustomOption(setCustomDepartments, label)}
                    placeholder="Select department"
                    disabled={origin !== 'external' || !externalDetailsEnabled}
                  />
                </Field>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Document File */}
        <section className={`nd-section ${!activeDetailsEnabled ? 'nd-section-locked' : ''}`}>
          <div className="nd-section-head">
            <div className="nd-section-num">4</div>
            <div>
              <h2 className="nd-section-title">Document File</h2>
              <p className="nd-section-desc">
                {origin === 'internal'
                  ? 'Upload a Word or text file. Unapproved documents stay as Word; PDF is created on approval.'
                  : 'Upload the controlled document file (PDF only).'}
              </p>
            </div>
          </div>

          <div
            className={`nd-upload-zone ${
              fileUploadStatus === 'checking'
                ? 'is-checking'
                : fileUploadStatus === 'success' && selectedFile
                  ? 'is-success has-file'
                  : selectedFile
                    ? 'has-file'
                    : fileUploadStatus === 'error'
                      ? 'is-error'
                      : ''
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (activeDetailsEnabled && fileUploadStatus !== 'checking') {
                void handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
          >
            {fileUploadStatus === 'checking' ? (
              <>
                <div className="nd-upload-spinner" aria-hidden="true" />
                <p className="nd-upload-title">{fileCheckingMessage.title}</p>
                <p className="nd-upload-sub">{fileCheckingMessage.subtitle}</p>
              </>
            ) : fileUploadStatus === 'success' && selectedFile ? (
              <>
                <div className="nd-upload-success-icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path className="nd-upload-check-path" d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <p className="nd-upload-title nd-upload-success-title">Document uploaded successfully</p>
                <p className="nd-upload-sub">{selectedFile.name} · {formatFileSize(selectedFile.size)}</p>
              </>
            ) : (
              <>
                <div className="nd-upload-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <p className="nd-upload-title">
                  {selectedFile
                    ? selectedFile.name
                    : origin === 'internal'
                      ? 'Drag and drop Word or text file here'
                      : 'Drag and drop your PDF here'}
                </p>
                <p className="nd-upload-sub">
                  {selectedFile
                    ? `${formatFileSize(selectedFile.size)} · Ready to upload`
                    : 'or click to browse from your computer'}
                </p>
              </>
            )}
            <div className="nd-upload-actions">
              <label
                className={`nd-btn nd-btn-outline nd-upload-btn ${
                  !activeDetailsEnabled || fileUploadStatus === 'checking' ? 'disabled' : ''
                }`}
              >
                {selectedFile
                  ? 'Replace File'
                  : origin === 'internal'
                    ? 'Browse Word / Text'
                    : 'Browse PDF'}
                <input
                  type="file"
                  hidden
                  disabled={!activeDetailsEnabled || fileUploadStatus === 'checking'}
                  accept={
                    origin === 'internal'
                      ? '.docx,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'
                      : '.pdf,application/pdf'
                  }
                  onChange={(e) => {
                    void handleFileSelect(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
              {selectedFile && fileUploadStatus !== 'checking' && (
                <button
                  type="button"
                  className="nd-btn nd-btn-ghost"
                  onClick={() => {
                    resetFileState();
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            <p className="nd-upload-formats">
              {origin === 'internal'
                ? 'Accepted formats: Word (.docx), text (.txt) · Max file size: 50 MB · No PDF until approved'
                : 'Accepted format: PDF · Max file size: 50 MB'}
            </p>
            {fileError && <p className="nd-upload-error">{fileError}</p>}
          </div>
        </section>

        <div className="nd-form-footer">
          <button type="button" className="nd-btn nd-btn-ghost" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </button>
          <button
            type="button"
            className="nd-btn nd-btn-outline"
            disabled={isSaving}
            onClick={() => handleSave(true)}
          >
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            className="nd-btn nd-btn-primary"
            disabled={isSaving}
            onClick={handleSubmitForApprovalClick}
          >
            {isSaving ? 'Saving...' : 'Submit for Approval'}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={showOwnerConfirmDialog}
        title="Confirm submission"
        message="You are both the document creator and the document owner. Are you sure this document can be approved?"
        confirmLabel="Yes"
        cancelLabel="Change document owner"
        onConfirm={handleConfirmSubmitForApproval}
        onCancel={handleChangeDocumentOwner}
      />
    </div>
  );
}
