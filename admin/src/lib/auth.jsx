import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  adminLogin,
  clearToken,
  fetchAdminMe,
  getToken,
  isSessionDead,
  setToken,
} from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearToken();
    setAdmin(null);
  }, []);

  useEffect(() => {
    (async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        setAdmin(await fetchAdminMe());
      } catch {
        clearToken();
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await adminLogin(email, password);
    setToken(data.token);
    setAdmin(data.admin);
    return data.admin;
  }, []);

  // Any API call can report a dead session — drop it and bounce to login.
  const handleApiError = useCallback(
    (err) => {
      if (err && isSessionDead(err.code)) logout();
    },
    [logout],
  );

  const value = useMemo(
    () => ({ admin, loading, login, logout, handleApiError }),
    [admin, loading, login, logout, handleApiError],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
