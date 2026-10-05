import { getDatabaseProvider } from '@/database/provider';

export { getDatabaseProvider, isSupabaseDatabase } from '@/database/provider';

export const databaseStatus = {
  get provider() {
    return getDatabaseProvider();
  },
  migrated: getDatabaseProvider() === 'supabase',
};
