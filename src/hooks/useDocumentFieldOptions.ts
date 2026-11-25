import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  mergeDocumentFieldOptions,
  type DocumentFieldOptionCategory,
} from '../data/documentFieldDefaults';

export function useDocumentFieldOptions(
  category: DocumentFieldOptionCategory,
  currentValue?: string,
) {
  const [options, setOptions] = useState<string[]>(() =>
    mergeDocumentFieldOptions(category, [], currentValue),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { options: fromServer } = await api.list(category);
      setOptions(mergeDocumentFieldOptions(category, fromServer, currentValue));
    } catch {
      setOptions(mergeDocumentFieldOptions(category, [], currentValue));
      setError('Could not load saved options.');
    } finally {
      setLoading(false);
    }
  }, [category, currentValue]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addOption = useCallback(
    async (label: string) => {
      const { options: next } = await api.create(category, label);
      setOptions(mergeDocumentFieldOptions(category, next, label));
      return label.trim();
    },
    [category],
  );

  return { options, loading, error, refresh, addOption };
}