import { useCallback, useEffect, useMemo, useState } from 'react';

import { getCurrentUser, loginUser } from '../services/authService';
import { setAuthToken, setUnauthorizedHandler } from '../services/apiClient';
import { AuthContext } from './authContextValue';

const TOKEN_KEY = 'safeguard.dashboard.token';
const USER_KEY = 'safeguard.dashboard.user';

const readStoredUser = () => {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(token));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!token) {
      setAuthToken(null);
      return;
    }

    let isMounted = true;
    setAuthToken(token);

    getCurrentUser()
      .then((currentUser) => {
        if (!isMounted) {
          return;
        }

        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch(() => {
        if (isMounted) {
          logout();
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [logout, token]);

  const login = useCallback(async (credentials) => {
    const authData = await loginUser(credentials);
    localStorage.setItem(TOKEN_KEY, authData.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
    setAuthToken(authData.token);
    setToken(authData.token);
    setUser(authData.user);
    return authData.user;
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      isBootstrapping,
      login,
      logout,
      token,
      user,
    }),
    [isBootstrapping, login, logout, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
