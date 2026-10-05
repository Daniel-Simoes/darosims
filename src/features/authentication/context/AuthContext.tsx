import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, getStoredToken, setStoredToken, type AuthUser } from '../../../lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isEntryLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  beginEntryLoading: () => void;
  endEntryLoading: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEntryLoading, setIsEntryLoading] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .me()
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => setStoredToken(null))
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
    setStoredToken(token);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isEntryLoading,
      login,
      logout,
      updateUser,
      beginEntryLoading,
      endEntryLoading,
    }),
    [user, isLoading, isEntryLoading, login, logout, updateUser, beginEntryLoading, endEntryLoading],
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
