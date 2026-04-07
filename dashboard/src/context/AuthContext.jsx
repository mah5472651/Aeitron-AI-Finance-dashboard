import { createContext, useContext, useState, useCallback } from 'react';
import { validateCredentials, isSessionValid, setSession, clearSession, getActiveStorage } from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return getActiveStorage() !== null;
  });

  const login = useCallback(async (email, password, rememberMe = false) => {
    const valid = await validateCredentials(email, password);
    if (valid) {
      setIsAuthenticated(true);
      setSession(rememberMe);
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    clearSession();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
