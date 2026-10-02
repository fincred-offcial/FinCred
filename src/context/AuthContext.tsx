import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, AdminSettings, LoanCategory } from '../types.js';
import { fetchSettings } from '../services/api.js';

interface LoanModalConfig {
  isOpen: boolean;
  category: LoanCategory | string;
  initialOptionId?: string;
}

interface AuthContextType {
  customer: Customer | null;
  customerToken: string | null;
  isCustomerLoggedIn: boolean;
  setCustomerSession: (customer: Customer, token: string) => void;
  updateCustomerName: (name: string) => void;
  customerLogout: () => void;

  adminToken: string | null;
  isAdminLoggedIn: boolean;
  setAdminSession: (token: string) => void;
  adminLogout: () => void;

  settings: AdminSettings;
  refreshSettings: () => Promise<void>;

  loanModal: LoanModalConfig;
  openLoanModal: (category: LoanCategory | string, optionId?: string) => void;
  closeLoanModal: () => void;

  isTrackModalOpen: boolean;
  openTrackModal: () => void;
  closeTrackModal: () => void;

  isInstantLoanModalOpen: boolean;
  openInstantLoanModal: () => void;
  closeInstantLoanModal: () => void;

  isCibilModalOpen: boolean;
  cibilTrackingRef?: string;
  openCibilModal: (trackingRef?: string) => void;
  closeCibilModal: () => void;
}

const DEFAULT_SETTINGS: AdminSettings = {
  choiceConnectPersonalLoanUrl: 'https://choiceconnect.in/referral/loan/personal-loan/QzAxMTkyOTg=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r',
  personalBusinessLoanUrl: 'https://www.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU',
  instantLoanUrl: 'https://truebalance.onelink.me/bMoN/h56bcblp',
  allTypeLoanUrl: 'https://sdk.ruloans.com/?client_type=b2b_app&loan_type=personal_loan&auth_token=586994%7Cl5C67vJQndNESetPp7pcWqcejaZd4iN3VtJZLPKze6dedf38',
  safeUpiUrl: 'https://r.navi.com/t3HqoB',
  updatedAt: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Customer Session (Persistent across refreshes)
  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      const stored = localStorage.getItem('fc_customer') || sessionStorage.getItem('fc_customer');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [customerToken, setCustomerToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('fc_cust_token') || sessionStorage.getItem('fc_cust_token');
    } catch {
      return null;
    }
  });

  // Admin Session
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('fc_admin_token');
    } catch {
      return null;
    }
  });

  // Global Settings (Partner Links)
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);

  // Loan Modal state
  const [loanModal, setLoanModal] = useState<LoanModalConfig>({
    isOpen: false,
    category: 'Personal Loan'
  });

  // Application Tracking Modal state
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  // Instant Loan Modal state
  const [isInstantLoanModalOpen, setIsInstantLoanModalOpen] = useState(false);
  const openInstantLoanModal = () => setIsInstantLoanModalOpen(true);
  const closeInstantLoanModal = () => setIsInstantLoanModalOpen(false);

  // CIBIL Score Improvement Modal state
  const [isCibilModalOpen, setIsCibilModalOpen] = useState(false);
  const [cibilTrackingRef, setCibilTrackingRef] = useState<string | undefined>(undefined);
  const openCibilModal = (trackingRef?: string) => {
    setCibilTrackingRef(trackingRef);
    setIsCibilModalOpen(true);
  };
  const closeCibilModal = () => {
    setIsCibilModalOpen(false);
    setCibilTrackingRef(undefined);
  };

  const refreshSettings = async () => {
    try {
      const data = await fetchSettings();
      setSettings(data);
    } catch (e) {
      console.warn('Using default settings fallback:', e);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const setCustomerSession = (cust: Customer, token: string) => {
    setCustomer(cust);
    setCustomerToken(token);
    try {
      localStorage.setItem('fc_customer', JSON.stringify(cust));
      localStorage.setItem('fc_cust_token', token);
      sessionStorage.setItem('fc_customer', JSON.stringify(cust));
      sessionStorage.setItem('fc_cust_token', token);
    } catch (e) {
      console.error('Session storage error:', e);
    }
  };

  const updateCustomerName = (fullName: string) => {
    if (!customer) return;
    const updated = { ...customer, fullName };
    setCustomer(updated);
    try {
      localStorage.setItem('fc_customer', JSON.stringify(updated));
      sessionStorage.setItem('fc_customer', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const customerLogout = () => {
    setCustomer(null);
    setCustomerToken(null);
    try {
      localStorage.removeItem('fc_customer');
      localStorage.removeItem('fc_cust_token');
      sessionStorage.removeItem('fc_customer');
      sessionStorage.removeItem('fc_cust_token');
    } catch (e) {
      console.error(e);
    }
  };

  const setAdminSession = (token: string) => {
    setAdminToken(token);
    try {
      sessionStorage.setItem('fc_admin_token', token);
    } catch (e) {
      console.error(e);
    }
  };

  const adminLogout = () => {
    setAdminToken(null);
    try {
      sessionStorage.removeItem('fc_admin_token');
    } catch (e) {
      console.error(e);
    }
  };

  const openLoanModal = (category: LoanCategory | string, initialOptionId?: string) => {
    setLoanModal({ isOpen: true, category, initialOptionId });
  };

  const closeLoanModal = () => {
    setLoanModal(prev => ({ ...prev, isOpen: false, initialOptionId: undefined }));
  };

  const openTrackModal = () => setIsTrackModalOpen(true);
  const closeTrackModal = () => setIsTrackModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        customer,
        customerToken,
        isCustomerLoggedIn: !!customer,
        setCustomerSession,
        updateCustomerName,
        customerLogout,
        adminToken,
        isAdminLoggedIn: !!adminToken,
        setAdminSession,
        adminLogout,
        settings,
        refreshSettings,
        loanModal,
        openLoanModal,
        closeLoanModal,
        isTrackModalOpen,
        openTrackModal,
        closeTrackModal,
        isInstantLoanModalOpen,
        openInstantLoanModal,
        closeInstantLoanModal,
        isCibilModalOpen,
        cibilTrackingRef,
        openCibilModal,
        closeCibilModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
