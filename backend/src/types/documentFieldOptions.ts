import type { DocumentFieldOptionCategory } from '@/data/documentFieldDefaults';

export interface DocumentFieldOptionRecord {
  id: string;
  category: DocumentFieldOptionCategory;
  label: string;
  createdAt: string;
  createdBy?: string;
}