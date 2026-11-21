import { TYPE_PREFIX } from '../../../data/documentTypes';

const TYPE_AVATAR_CLASS: Record<string, string> = {
  Report: 'doc-reg-avatar-report',
  Procedure: 'doc-reg-avatar-procedure',
  Checklist: 'doc-reg-avatar-checklist',
  Record: 'doc-reg-avatar-record',
  Form: 'doc-reg-avatar-form',
  'Standard Operating Procedure (SOP)': 'doc-reg-avatar-sop',
  'Work Instruction': 'doc-reg-avatar-wi',
  'Policy Manual': 'doc-reg-avatar-policy',
};

export function getRegisterTypeAvatarClass(type: string | undefined): string {
  if (!type) return 'doc-reg-avatar-default';
  return TYPE_AVATAR_CLASS[type] ?? 'doc-reg-avatar-default';
}

export function getTypeAvatarLetterForType(type: string | undefined): string {
  const prefix = type ? TYPE_PREFIX[type] : undefined;
  if (prefix?.trim()) return prefix.trim().charAt(0).toUpperCase();
  const trimmed = type?.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

export function DocumentTypeIcon({ type }: { type: string }) {
  if (type === 'Report') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </svg>
    );
  }
  if (type === 'Procedure') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}