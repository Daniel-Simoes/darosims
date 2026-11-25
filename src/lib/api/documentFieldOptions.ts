import { apiFetch } from './client';
import type { DocumentFieldOptionCategory } from '../../data/documentFieldDefaults';

export const documentFieldOptionsApi = {
  list(category: DocumentFieldOptionCategory) {
    return apiFetch<{ category: DocumentFieldOptionCategory; options: string[] }>(
      `/api/document-field-options?category=${encodeURIComponent(category)}`,
    );
  },

  create(category: DocumentFieldOptionCategory, label: string) {
    return apiFetch<{ category: DocumentFieldOptionCategory; options: string[] }>(
      '/api/document-field-options',
      {
        method: 'POST',
        body: JSON.stringify({ category, label }),
      },
    );
  },
};