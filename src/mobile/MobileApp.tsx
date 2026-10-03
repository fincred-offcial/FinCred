import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Bell
} from 'lucide-react';
import { MobileAuthProvider, useMobileAuth } from './context/MobileAuthContext.js';
import { MobileSplash } from './components/MobileSplash.js';
import { MobileAuthScreen } from './screens/MobileAuthScreen.js';
import { MobileHomeScreen } from './screens/MobileHomeScreen.js';
import { MobileLoansScreen } from './screens/MobileLoansScreen.js';
import { MobileApplicationsScreen } from './screens/MobileApplicationsScreen.js';
import { MobileProfileScreen } from './screens/MobileProfileScreen.js';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav.js';
import { MobileApplyModal } from './components/MobileApplyModal.js';
import { MobileOfflineScreen } from './components/MobileOfflineScreen.js';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';
import { LoanProduct, LoanApplication } from '../types.js';
import { appFetchMyApplications } from '../services/api.js';
import { safeFetch } from '../services/apiClient.js';
import { InstantLoanModal } from '../components/InstantLoanModal.js';
import { useAuth } from '../context/AuthContext.js';

const MobileAppInner: React.FC = () => {
  const { customer, token, logout, isLoading: isAuthLoading } = useMobileAuth();
  const { openInstantLoanModal } = useAuth();
  
  // Online / Offline Data Connection Detection
  const detectedOnline = useOnlineStatus();
  const [isOnlineOverride, setIsOnlineOverride] = useState<boolean | null>(null);
  const isOnline = isOnlineOverride !== null ? isOnlineOverride : detectedOnline;

  useEffect(() => {
    setIsOnlineOverride(null);
  }, [detectedOnline]);

  // App phase: 'splash' | 'auth' | 'main'
  const [appPhase, setAppPhase] = useState<'splash' | 'auth' | 'main'>('splash');
  const [splashFinished, setSplashFinished] = useState(false);
  const [currentTab, setCurrentTab] = useState<MobileTab>(() => {
    try {
      const saved = localStorage.getItem('fincred_active_mobile_tab') as MobileTab;
      if (['home', 'loans', 'applications', 'profile'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'home';
  });
  const [applicationsCount, setApplicationsCount] = useState<number>(0);

  const handleTabChange = (tab: MobileTab) => {
    setCurrentTab(tab);
    try {
      localStorage.setItem('fincred_active_mobile_tab', tab);
    } catch {}
  };

  // Apply modal state
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);

  // Sync applications count for bottom nav badge
  useEffect(() => {
    if (customer?.customerId || customer?.mobileNumber) {
      appFetchMyApplications(customer.customerId, customer.mobileNumber)
        .then(apps => setApplicationsCount(apps.length))
        .catch(() => {});
    }
  }, [customer, appPhase, currentTab]);

  // Handle splash completion with guaranteed login persistence check
  useEffect(() => {
    if (splashFinished && !isAuthLoading) {
      if (customer && token) {
        setAppPhase('main');
      } else {
        setAppPhase('auth');
      }
    }
  }, [splashFinished, isAuthLoading, customer, token]);

  const handleSplashComplete = () => {
    setSplashFinished(true);
  };

  const handleAuthSuccess = () => {
    setAppPhase('main');
    handleTabChange('home');
  };

  const handleLogout = async () => {
    await logout();
    setAppPhase('auth');
    handleTabChange('home');
  };

  const handleOpenApply = (product: LoanProduct | null) => {
    setSelectedProduct(product);
    setIsApplyOpen(true);
  };

  const handleApplicationSuccess = (_app: LoanApplication) => {
    setApplicationsCount(prev => prev + 1);
  };

  // Connectivity check for "data naa ho toh work naa kare"
  const handleRetryConnectivity = async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }
    try {
      const res = await safeFetch('/api/health', { cache: 'no-store' });
      if (res.ok) {
        setIsOnlineOverride(true);
        return true;
      }
    } catch {
      // still unreachable
    }
    return false;
  };

  // If user has NO active mobile data / internet connection, block app usage completely
  if (!isOnline) {
    return <MobileOfflineScreen onRetry={handleRetryConnectivity} />;
  }

  return (
    <div className="h-screen h-[100dvh] w-full bg-[#070B14] text-slate-100 flex flex-col items-center justify-start select-none font-sans overflow-hidden">
      {/* Mobile Application Canvas - Pure edge-to-edge native layout */}
      <div className="w-full max-w-md h-full flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* ====================================================== */}
        {/* VIEW 1: NATIVE APP SPLASH SCREEN */}
        {/* ====================================================== */}
        {appPhase === 'splash' && (
          <MobileSplash onComplete={handleSplashComplete} durationMs={2200} />
        )}

        {/* ====================================================== */}
        {/* VIEW 2: AUTH SCREEN (OTP / LOGIN) */}
        {/* ====================================================== */}
        {appPhase === 'auth' && (
          <div className="flex-1 flex flex-col overflow-y-auto overscroll-contain">
            <MobileAuthScreen onSuccess={handleAuthSuccess} />
          </div>
        )}

        {/* ====================================================== */}
        {/* VIEW 3: MAIN AUTHENTICATED APP */}
        {/* ====================================================== */}
        {appPhase === 'main' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Native Mobile App Top Navigation Header */}
            <header className="px-4 py-3 bg-[#0A0F1D]/95 backdrop-blur-md border-b border-slate-800/90 flex items-center justify-between z-20 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-sm">
                  <div className="w-full h-full bg-[#0A0F1D] rounded-[10px] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-sm font-black text-white tracking-wide font-['Outfit',sans-serif] leading-tight">
                      Fin<span className="text-cyan-400">Cred</span>
                    </h1>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-cyan-400 tracking-wide">
                      APP
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">RBI Registered NBFC Partners</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTabChange('applications')}
                  className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white cursor-pointer relative transition-colors"
                  title="My Applications"
                >
                  <Bell className="w-4 h-4" />
                  {applicationsCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('profile')}
                  className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs cursor-pointer hover:border-blue-400 transition-colors"
                  title="My Profile"
                >
                  {customer?.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
                </button>
              </div>
            </header>

            {/* Scrollable Main Viewport */}
            <main className="flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-28">
              {currentTab === 'home' && (
                <MobileHomeScreen
                  customer={customer}
                  onOpenApply={handleOpenApply}
                  onNavigateTab={tab => handleTabChange(tab)}
                />
              )}

              {currentTab === 'loans' && (
                <MobileLoansScreen onOpenApply={handleOpenApply} />
              )}

              {currentTab === 'applications' && (
                <MobileApplicationsScreen
                  customer={customer}
                  onNavigateToLoans={() => handleTabChange('loans')}
                />
              )}

              {currentTab === 'profile' && (
                <MobileProfileScreen
                  customer={customer}
                  onNavigateToApplications={() => handleTabChange('applications')}
                  onLogoutConfirm={handleLogout}
                />
              )}
            </main>

            {/* Native Bottom Navigation Bar */}
            <MobileBottomNav
              currentTab={currentTab}
              onChangeTab={handleTabChange}
              applicationsCount={applicationsCount}
              onOpenInstantLoans={openInstantLoanModal}
            />

            {/* In-App Loan Application Sheet Modal */}
            <MobileApplyModal
              isOpen={isApplyOpen}
              onClose={() => setIsApplyOpen(false)}
              selectedProduct={selectedProduct}
              customer={customer}
              onSuccess={handleApplicationSuccess}
            />

            {/* Instant Loan Hub Modal */}
            <InstantLoanModal />
          </div>
        )}
      </div>
    </div>
  );
};

export const MobileApp: React.FC = () => {
  return (
    <MobileAuthProvider>
      <MobileAppInner />
    </MobileAuthProvider>
  );
};
