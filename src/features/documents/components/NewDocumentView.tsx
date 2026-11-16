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
import { formatFileSize, verifyPdfFile } from '../../../lib/documentUpload';
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

const NEW_DOCUMENT_FIELD_HELP = {
  documentStructure:
    'Choose how document codes and titles are managed for internal documents. Select your organisation’s existing structure if you already use your own codes and naming. Choose DAROS to have codes generated automatically from document type and process.',
  documentOrigin:
    'Internal documents are created and owned by your organisation. External documents are issued by another party; here you register a reference copy for control and traceability in DAROS.',
  documentInformation:
    'Fill in the metadata for the active origin (internal or external). Complete every field in this section before you upload a file and submit.',
  documentFile:
    'Attach the controlled PDF that will be stored with this record. The file is checked when uploaded; only valid PDF files are accepted.',
  documentType:
    'The kind of document you are registering (for example Form, Procedure, or Policy). It classifies the record and, when using the DAROS structure, is used to build the document code.',
  process:
    'The process or area this document applies to (for example Quality or Production). It shows where the document is used in the organisation and helps route review to the right person.',
  documentTitle:
    'The name shown in Document Control and across the system. Use a clear title so others can find and recognise the document.',
  documentOwner:
    'The person who will review this document after you submit it. They can approve it or send it back for changes. If you select yourself, you review and approve in one step when you submit.',
  externalReference:
    'The reference or identifier from the external source (for example the supplier’s document number).',
  externalVersion:
    'The version or edition number from the external source, as printed on the original document.',
  externalIssuer:
    'The organisation or party that issued the external document.',
  externalDepartment:
    'The department or function in your organisation that uses or owns this external reference.',
} as const;

function FieldHelpButton({ title, message }: { title: string; message: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="nd-field-help"
        aria-label={`What is ${title}?`}
        onClick={() => setOpen(true)}
      >
        ?
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        message={message}
        confirmLabel="Got it"
        cancelLabel=""
        singleAction
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

function Field({
  label,
  required,
  children,
  hint,
  helpMessage,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
  helpMessage?: string;
}) {
  return (
    <div className="nd-field">
      <div className="nd-label-row">
        <label className="nd-label" aria-required={required ? true : undefined}>
          {label}
        </label>
        {helpMessage ? <FieldHelpButton title={label} message={helpMessage} /> : null}
      </div>
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

function getFileCheckingMessage() {
  return {
    title: 'Checking PDF format...',
    subtitle: 'Verifying that the file is a valid PDF document',
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
  const [ownerConfirmMode, setOwnerConfirmMode] = useState<'owner' | 'submit'>('owner');
  const [pendingOwner, setPendingOwner] = useState('');
  const [selfOwnerConfirmed, setSelfOwnerConfirmed] = useState(false);
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
    setSelfOwnerConfirmed(false);
    setPendingOwner('');
  }

  const usesOrganisationStructure = documentStructure === 'organisation';
  const usesDarosStructure = documentStructure === 'daros';
  const internalDetailsEnabled = origin === 'internal' && documentStructure !== '';
  const externalDetailsEnabled = origin === 'external';

  const activeDetailsEnabled =
    origin === 'internal' ? internalDetailsEnabled : externalDetailsEnabled;

  const isNewDocumentReady = useMemo(() => {
    const hasFile = Boolean(selectedFile) && fileUploadStatus === 'success';
    if (!hasFile) return false;

    if (origin === 'internal') {
      if (!documentStructure) return false;
      const form = internalForm;
      if (!form.type.trim() || !form.process.trim() || !form.title.trim() || !form.owner.trim()) {
        return false;
      }
      if (usesOrganisationStructure && !form.documentCode.trim()) return false;
      return true;
    }

    const form = externalForm;
    return Boolean(
      form.type.trim() &&
        form.process.trim() &&
        form.externalRef.trim() &&
        form.externalVersion.trim() &&
        form.title.trim() &&
        form.externalIssuer.trim() &&
        form.department.trim(),
    );
  }, [
    origin,
    documentStructure,
    internalForm,
    externalForm,
    selectedFile,
    fileUploadStatus,
    usesOrganisationStructure,
  ]);

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
    setSelfOwnerConfirmed(false);
    setPendingOwner('');
    setSuccess('');
    setError('');
  }

  async function handleFileSelect(file: File | undefined) {
    if (!file || !activeDetailsEnabled) return;

    setFileCheckingMessage(getFileCheckingMessage());
    setFileUploadStatus('checking');
    setSelectedFile(null);
    setFileError('');

    const validationError = await verifyPdfFile(file);

    if (validationError) {
      setFileError(validationError);
      setFileUploadStatus('error');
      return;
    }

    setSelectedFile(file);
    setFileUploadStatus('success');
  }

  function handleOwnerChange(value: string) {
    if (
      origin === 'internal' &&
      value.trim() &&
      isDocumentOwnerSameAsUser(user, value)
    ) {
      setPendingOwner(value);
      setOwnerConfirmMode('owner');
      setShowOwnerConfirmDialog(true);
      return;
    }

    setSelfOwnerConfirmed(false);
    updateInternalField('owner', value);
  }

  function handleSubmitForReviewClick() {
    if (
      origin === 'internal' &&
      isDocumentOwnerSameAsUser(user, internalForm.owner) &&
      !selfOwnerConfirmed
    ) {
      setOwnerConfirmMode('submit');
      setShowOwnerConfirmDialog(true);
      return;
    }

    void handleSave(false);
  }

  function handleConfirmOwnerDialog() {
    setShowOwnerConfirmDialog(false);

    if (ownerConfirmMode === 'owner') {
      updateInternalField('owner', pendingOwner);
      setSelfOwnerConfirmed(true);
      setPendingOwner('');
      return;
    }

    setSelfOwnerConfirmed(true);
    void handleSave(false);
  }

  function handleCancelOwnerDialog() {
    setShowOwnerConfirmDialog(false);
    setPendingOwner('');

    if (ownerConfirmMode === 'submit') {
      handleChangeDocumentOwner();
      return;
    }
  }

  function handleChangeDocumentOwner() {
    setSelfOwnerConfirmed(false);
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

    const isSelfOwner =
      origin === 'internal' && isDocumentOwnerSameAsUser(user, internalForm.owner.trim());

    if (!asDraft && isSelfOwner && !selectedFile) {
      showFormError('Upload a PDF document before submitting for review.');
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

      if (selectedFile) {
        await api.uploadDocumentFile(document.id, selectedFile);
        const { document: withFile } = await api.updateDocument(document.id, {
          fileFormat: 'pdf',
          fileName: selectedFile.name,
        });
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
        const savedLabel = savedDocument.code || savedDocument.title;
        if (isSelfOwner) {
          await api.updateDocument(savedDocument.id, {
            status: 'Active',
            version: Math.max(Number(savedDocument.version) || 0, 1),
            approvedBy: user?.name,
            fileFormat: 'pdf',
            fileName: savedDocument.fileName ?? selectedFile?.name,
          });
          setSuccess(`Document "${savedLabel}" reviewed and approved.`);
        } else {
          await api.submitDocumentForApproval(savedDocument.id);
          setSuccess(`Document "${savedLabel}" submitted for review.`);
        }
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
          : `Document "${savedLabel}" submitted for review.`,
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
              <div className="nd-section-title-row">
                <h2 className="nd-section-title">Document Structure</h2>
                <FieldHelpButton title="Document Structure" message={NEW_DOCUMENT_FIELD_HELP.documentStructure} />
              </div>
              <p className="nd-section-desc">
                Required first step for internal documents: choose who defines document codes and names—your
                organisation’s rules or automatic DAROS codes from type and process.
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
              <div className="nd-section-title-row">
                <h2 className="nd-section-title">Document Origin</h2>
                <FieldHelpButton title="Document Origin" message={NEW_DOCUMENT_FIELD_HELP.documentOrigin} />
              </div>
              <p className="nd-section-desc">
                Internal = your organisation creates and owns the document. External = another organisation issues it; you keep a controlled reference here.
              </p>
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
              <div className="nd-section-title-row">
                <h2 className="nd-section-title">Document Information</h2>
                <FieldHelpButton title="Document Information" message={NEW_DOCUMENT_FIELD_HELP.documentInformation} />
              </div>
              <p className="nd-section-desc">
                Complete the form for the origin selected in step 2. Use the ? next to each field if you are unsure what to enter.
              </p>
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
                <Field label="Document Type" required helpMessage={NEW_DOCUMENT_FIELD_HELP.documentType}>
                  <DocumentTypeMenu
                    value={internalForm.type}
                    onChange={(v) => updateInternalField('type', v)}
                    disabled={origin !== 'internal' || !internalDetailsEnabled}
                    customOptions={customDocumentTypes}
                    onAddCustomOption={(label) => appendCustomOption(setCustomDocumentTypes, label)}
                  />
                </Field>
                <Field label="Process" required helpMessage={NEW_DOCUMENT_FIELD_HELP.process}>
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
                <Field label="Document Title" required helpMessage={NEW_DOCUMENT_FIELD_HELP.documentTitle}>
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
                    helpMessage={NEW_DOCUMENT_FIELD_HELP.documentOwner}
                  >
                    <OptionPickerMenu
                      panelLabel="Document Owner (Reviewer)"
                      value={internalForm.owner}
                      onChange={handleOwnerChange}
                      options={ownerOptions}
                      customOptions={customOwners}
                      onAddCustomOption={(label) => appendCustomOption(setCustomOwners, label)}
                      placeholder="Select reviewer..."
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
                <Field label="Document Type" required helpMessage={NEW_DOCUMENT_FIELD_HELP.documentType}>
                  <DocumentTypeMenu
                    value={externalForm.type}
                    onChange={(v) => updateExternalField('type', v)}
                    disabled={origin !== 'external' || !externalDetailsEnabled}
                    customOptions={customDocumentTypes}
                    onAddCustomOption={(label) => appendCustomOption(setCustomDocumentTypes, label)}
                  />
                </Field>
                <Field label="Process" required helpMessage={NEW_DOCUMENT_FIELD_HELP.process}>
                  <ProcessMenu
                    value={externalForm.process}
                    onChange={(v) => updateExternalField('process', v)}
                    disabled={origin !== 'external' || !externalDetailsEnabled}
                    customOptions={customProcesses}
                    onAddCustomOption={(label) => appendCustomOption(setCustomProcesses, label)}
                  />
                </Field>
                <Field
                  label="External Document Reference"
                  required
                  helpMessage={NEW_DOCUMENT_FIELD_HELP.externalReference}
                >
                  <input
                    className="nd-input"
                    placeholder="Enter external reference"
                    value={externalForm.externalRef}
                    onChange={(e) => updateExternalField('externalRef', e.target.value)}
                    disabled={origin !== 'external' || !externalDetailsEnabled}
                  />
                </Field>
                <Field
                  label="Version / Edition"
                  required
                  helpMessage={NEW_DOCUMENT_FIELD_HELP.externalVersion}
                >
                  <input
                    className="nd-input"
                    placeholder="e.g. 1.0, Rev 2"
                    value={externalForm.externalVersion}
                    onChange={(e) => updateExternalField('externalVersion', e.target.value)}
                    disabled={origin !== 'external' || !externalDetailsEnabled}
                    required={origin === 'external'}
                  />
                </Field>
                <Field label="Document Title" required helpMessage={NEW_DOCUMENT_FIELD_HELP.documentTitle}>
                  <input
                    className="nd-input"
                    placeholder="Enter document title"
                    value={externalForm.title}
                    onChange={(e) => updateExternalField('title', e.target.value)}
                    disabled={origin !== 'external' || !externalDetailsEnabled}
                  />
                </Field>
                <Field label="External Issuer" required helpMessage={NEW_DOCUMENT_FIELD_HELP.externalIssuer}>
                  <input
                    className="nd-input"
                    placeholder="Organisation name"
                    value={externalForm.externalIssuer}
                    onChange={(e) => updateExternalField('externalIssuer', e.target.value)}
                    disabled={origin !== 'external' || !externalDetailsEnabled}
                  />
                </Field>
                <Field label="Department" required helpMessage={NEW_DOCUMENT_FIELD_HELP.externalDepartment}>
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
              <div className="nd-section-title-row">
                <h2 className="nd-section-title">Document File</h2>
                <FieldHelpButton title="Document File" message={NEW_DOCUMENT_FIELD_HELP.documentFile} />
              </div>
              <p className="nd-section-desc">Upload the controlled document file (PDF only) once the information above is complete.</p>
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
                  {selectedFile ? selectedFile.name : 'Drag and drop your PDF here'}
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
                {selectedFile ? 'Replace File' : 'Browse PDF'}
                <input
                  type="file"
                  hidden
                  disabled={!activeDetailsEnabled || fileUploadStatus === 'checking'}
                  accept=".pdf,application/pdf"
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
            <p className="nd-upload-formats">Accepted format: PDF · Max file size: 50 MB</p>
            {fileError && <p className="nd-upload-error">{fileError}</p>}
          </div>
        </section>

        <div className="nd-form-footer">
          {!isNewDocumentReady && !isSaving ? (
            <p className="nd-form-footer-hint" role="status">
              Enter all source and destination details.
            </p>
          ) : (
            <span className="nd-form-footer-spacer" aria-hidden="true" />
          )}
          <div className="nd-form-footer-actions">
            <button type="button" className="nd-btn nd-btn-ghost" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </button>
            <button
              type="button"
              className="nd-btn nd-btn-outline"
              disabled={isSaving || !isNewDocumentReady}
              onClick={() => handleSave(true)}
            >
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              className="nd-btn nd-btn-primary"
              disabled={isSaving || !isNewDocumentReady}
              onClick={handleSubmitForReviewClick}
            >
              {isSaving ? 'Saving...' : 'Submit for Review'}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={showOwnerConfirmDialog}
        title={
          ownerConfirmMode === 'owner'
            ? 'You are the reviewer'
            : 'Submit for review and approve'
        }
        message={
          ownerConfirmMode === 'owner'
            ? 'You selected yourself as the person who will review this document. When you submit, you will review and approve it in one step—the document becomes active immediately. Continue?'
            : 'You are the document owner and reviewer for this draft. Submitting will review and approve this document immediately with no separate approval step. Continue?'
        }
        confirmLabel="Yes, continue"
        cancelLabel="Choose a different reviewer"
        onConfirm={handleConfirmOwnerDialog}
        onCancel={handleCancelOwnerDialog}
      />
    </div>
  );
}
