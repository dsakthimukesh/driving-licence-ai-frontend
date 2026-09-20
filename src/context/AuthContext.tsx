import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginCredentials, LoginResponse } from '../types/auth';
import { getCurrentUserApi, loginApi } from '../services/auth-service';
import { configureApiClient } from '../services/api';

/**
 * Authentication Security & Token Persistence Strategy:
 * 
 * 1. Persistence Mechanism:
 *    JWT access tokens are stored in `localStorage` under the key 'auth_token'.
 *    On initial page load or browser refresh, the AuthProvider reads this token and
 *    verifies its validity by calling the `/api/v1/auth/me` backend endpoint.
 * 
 * 2. Security Tradeoffs:
 *    - Advantage: Client-side self-containment with pure REST API architectures. No backend
 *      session state or cookie CORS configuration required.
 *    - Tradeoff / Vulnerability: `localStorage` is accessible via JavaScript on the same domain.
 *      If an Cross-Site Scripting (XSS) vulnerability exists, malicious scripts could read the token.
 *    - Production Best Practice: For high-security applications, tokens should be stored in
 *      HttpOnly, SameSite, Secure cookies managed by the backend server.
 */
const TOKEN_STORAGE_KEY = 'auth_token';

interface AuthContextType {
  accessToken: string | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
  clearAuthentication: () => void;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Derived authentication boolean
  const isAuthenticated = Boolean(accessToken && currentUser);

  /**
   * Clears all stored credentials and resets state to logged-out.
   */
  const clearAuthentication = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setAccessToken(null);
    setCurrentUser(null);
  }, []);

  /**
   * Configures global API client to inject current access token into headers
   * and handle 401 unauthorized responses automatically.
   */
  useEffect(() => {
    configureApiClient({
      getToken: () => localStorage.getItem(TOKEN_STORAGE_KEY),
      onUnauthorized: () => {
        clearAuthentication();
      },
    });
  }, [clearAuthentication]);

  /**
   * Fetches the current user profile from `/api/v1/auth/me`.
   */
  const refreshCurrentUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const user = await getCurrentUserApi();
      setCurrentUser(user);
    } catch {
      // If token is expired or invalid, clear authentication state
      clearAuthentication();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthentication]);

  /**
   * Initialize session state on application mount / refresh.
   */
  useEffect(() => {
    if (accessToken) {
      refreshCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [accessToken, refreshCurrentUser]);

  /**
   * Handles user login flow.
   * Calls backend API, saves token, updates user state.
   */
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await loginApi(credentials);
      
      // Save access token securely in local storage
      localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token);
      setAccessToken(response.access_token);
      setCurrentUser(response.user);
      
      return response;
    } catch (error) {
      clearAuthentication();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logs out current user and redirects session.
   */
  const logout = () => {
    clearAuthentication();
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        currentUser,
        isAuthenticated,
        isLoading,
        login,
        logout,
        clearAuthentication,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom React Hook to conveniently consume AuthContext.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
