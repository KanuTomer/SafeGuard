import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCurrentUser, loginUser } from '../services/authService';
import { setAuthToken, setUnauthorizedHandler } from '../services/apiClient';

const TOKEN_KEY = 'safeguard.mobile.token';
const USER_KEY = 'safeguard.mobile.user';

export const AuthContext = createContext(null);

const readStoredUser = async () => {
  const storedUser = await AsyncStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    await AsyncStorage.removeItem(USER_KEY);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setIsBootstrapping(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });

    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);

        if (!storedToken) {
          return;
        }

        setAuthToken(storedToken);
        const [storedUser, currentUser] = await Promise.all([
          readStoredUser(),
          getCurrentUser(),
        ]);

        if (!isMounted) {
          return;
        }

        const resolvedUser = currentUser || storedUser;
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(resolvedUser));
        setToken(storedToken);
        setUser(resolvedUser);
      } catch {
        if (isMounted) {
          await logout();
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [logout]);

  const login = useCallback(async credentials => {
    const authData = await loginUser(credentials);
    await AsyncStorage.setItem(TOKEN_KEY, authData.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(authData.user));
    setAuthToken(authData.token);
    setToken(authData.token);
    setUser(authData.user);
    setIsBootstrapping(false);
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
    [isBootstrapping, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
