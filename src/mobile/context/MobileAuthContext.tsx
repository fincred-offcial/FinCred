import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer } from '../../types.js';
import { appGetMe, appLogin, appRegister, appLogout, appUpdateProfile } from '../../services/api.js';

interface MobileAuthContextType {
  customer: Customer | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (params: { fullName: string; mobileNumber: string; email?: string; password: string; confirmPassword?: string }) => Promise<void>;
  loginWithOtpSession: (customer: Customer, token: string) => void;
  logout: () => Promise<void>;
  updateProfile: (params: { fullName: string; email?: string }) => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const MobileAuthContext = createContext<MobileAuthContextType | undefined>(undefined);

const TOKEN_KEY = 'fincred_mobile_app_token';
const CUSTOMER_KEY = 'fincred_mobile_app_customer';

export const MobileAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Validate session on mount
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await appGetMe(savedToken);
        if (isMounted) {
          setCustomer(res.customer);
          localStorage.setItem(CUSTOMER_KEY, JSON.stringify(res.customer));
        }
      } catch (err: any) {
        console.warn('Session restoration failed:', err);
        // If session expired or invalid, clear stored tokens
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(CUSTOMER_KEY);
          setToken(null);
          setCustomer(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (identifier: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await appLogin({ identifier, password });
      setToken(res.token);
      setCustomer(res.customer);
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(res.customer));
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: {
    fullName: string;
    mobileNumber: string;
    email?: string;
    password: string;
    confirmPassword?: string;
  }) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await appRegister(params);
      setToken(res.token);
      setCustomer(res.customer);
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(res.customer));
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOtpSession = (cust: Customer, tok: string) => {
    setToken(tok);
    setCustomer(cust);
    localStorage.setItem(TOKEN_KEY, tok);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(cust));
    try {
      sessionStorage.setItem('fc_customer', JSON.stringify(cust));
      sessionStorage.setItem('fc_cust_token', tok);
    } catch {}
  };

  const logout = async () => {
    if (token) {
      await appLogout(token);
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
    setToken(null);
    setCustomer(null);
    setError(null);
  };

  const updateProfile = async (params: { fullName: string; email?: string }) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      const res = await appUpdateProfile(token, params);
      setCustomer(res.customer);
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(res.customer));
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await appGetMe(token);
      setCustomer(res.customer);
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(res.customer));
    } catch {
      // Keep existing customer state
    }
  };

  const clearError = () => setError(null);

  return (
    <MobileAuthContext.Provider
      value={{
        customer,
        token,
        isLoading,
        error,
        login,
        register,
        loginWithOtpSession,
        logout,
        updateProfile,
        clearError,
        refreshProfile
      }}
    >
      {children}
    </MobileAuthContext.Provider>
  );
};

export function useMobileAuth() {
  const context = useContext(MobileAuthContext);
  if (!context) {
    throw new Error('useMobileAuth must be used within a MobileAuthProvider');
  }
  return context;
}
