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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEntryLoading, setIsEntryLoading] = useState(false);
  const [isSessionLocked, setIsSessionLocked] = useState(false);

  useEffect(() => {
    api
      .me()
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => {
        setStoredToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
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
    setUser(null);
    setIsSessionLocked(false);
  }, []);

  const updateUser = useCallback((nextUser: AuthUser) => {
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
