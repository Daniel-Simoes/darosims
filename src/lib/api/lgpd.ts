import { apiFetch } from './client';
import type { DataSubjectRequestType } from '../../data/companyLegal';

export interface SubmitLgpdRequestPayload {
  name: string;
  email: string;
  requestType: DataSubjectRequestType;
  message?: string;
}

export function submitLgpdRequest(payload: SubmitLgpdRequestPayload) {
  return apiFetch<{ ok: boolean }>('/api/lgpd/requests', {
    method: 'POST',
    body: JSON.stringify({ ...payload, website: '' }),
  });
}