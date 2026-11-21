import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, setStoredToken, type AuthUser } from '../../../lib/api';
import {
  clearClientDataCache,
  getCachedData,
  invalidateCachedData,
  setCachedData,
} from '../../../lib/data/clientDataCache';
import { ensureMinSkeletonDuration } from '../../../lib/ui/skeletonLoading';

const AUTH_USER_CACHE_KEY = 'auth:user';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isEntryLoading: boolean;
  isSessionLocked: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  lockSession: () => void;
  updateUser: (user: AuthUser) => void;
  beginEntryLoading: () => void;
  endEntryLoading: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getCachedData<AuthUser>(AUTH_USER_CACHE_KEY));
  const [isLoading, setIsLoading] = useState(() => !getCachedData<AuthUser>(AUTH_USER_CACHE_KEY));
  const [isEntryLoading, setIsEntryLoading] = useState(false);
  const [isSessionLocked, setIsSessionLocked] = useState(false);

  useEffect(() => {
    const hadCachedUser = Boolean(getCachedData<AuthUser>(AUTH_USER_CACHE_KEY));
    const started = Date.now();

    api
      .me()
      .then(({ user: currentUser }) => {
        setCachedData(AUTH_USER_CACHE_KEY, currentUser);
        setUser(currentUser);
      })
      .catch(() => {
        setStoredToken(null);
        invalidateCachedData(AUTH_USER_CACHE_KEY);
        setUser(null);
      })
      .finally(async () => {
        if (!hadCachedUser) {
          await ensureMinSkeletonDuration(started);
        }
        setIsLoading(false);
      });
  }, []);

  const beginEntryLoading = useCallback(() => {
    setIsEntryLoading(true);
  }, []);

  const endEntryLoading = useCallback(() => {
    setIsEntryLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedInUser } = await api.login(email, password);
    setStoredToken(token ?? null);
    setCachedData(AUTH_USER_CACHE_KEY, loggedInUser);
    setUser(loggedInUser);
    setIsSessionLocked(false);
  }, []);

  const lockSession = useCallback(() => {
    setStoredToken(null);
    setIsSessionLocked(true);
  }, []);

  const logout = useCallback(() => {
    void api.logout().catch(() => undefined);
    setStoredToken(null);
    clearClientDataCache();
    setUser(null);
    setIsSessionLocked(false);
  }, []);

  const updateUser = useCallback((nextUser: AuthUser) => {
    setCachedData(AUTH_USER_CACHE_KEY, nextUser);
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isEntryLoading,
      isSessionLocked,
      login,
      logout,
      lockSession,
      updateUser,
      beginEntryLoading,
      endEntryLoading,
    }),
    [
      user,
      isLoading,
      isEntryLoading,
      isSessionLocked,
      login,
      logout,
      lockSession,
      updateUser,
      beginEntryLoading,
      endEntryLoading,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
