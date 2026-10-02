import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { MobileBottomNav } from './components/MobileBottomNav.js';
import { Footer } from './components/Footer.js';
import { LoanApplicationModal } from './components/LoanApplicationModal.js';
import { InstantLoanModal } from './components/InstantLoanModal.js';
import { ApplicationTrackingModal } from './components/ApplicationTrackingModal.js';
import { DownloadAppModal } from './components/DownloadAppModal.js';
import { CibilImproveModal } from './components/CibilImproveModal.js';
import { TopDownloadBanner } from './components/TopDownloadBanner.js';
import { OfflineIndicator } from './components/OfflineIndicator.js';
import { AppSplashScreen } from './components/AppSplashScreen.js';
import { FloatingCustomerButton } from './components/FloatingCustomerButton.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { SignUpPage } from './pages/SignUpPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ApplicationsPage } from './pages/ApplicationsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminLoginPage } from './pages/AdminLoginPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { MobileApp } from './mobile/MobileApp.js';

const ProtectedCustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isCustomerLoggedIn } = useAuth();
  if (!isCustomerLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isTrackModalOpen,
    closeTrackModal,
    isCustomerLoggedIn,
    isCibilModalOpen,
    closeCibilModal,
    cibilTrackingRef
  } = useAuth();

  // Automatic Referral Code Tracking from URL (?ref=FIN...)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search || window.location.search);
      const ref = searchParams.get('ref');
      if (ref && ref.trim()) {
        const cleanRef = ref.trim().toUpperCase();
        localStorage.setItem('fc_referrer_code', cleanRef);
        sessionStorage.setItem('fc_referrer_code', cleanRef);
      }
    } catch {}
  }, [location.search]);

  // If running in installed standalone mode (PWA/downloaded app), automatically route to the mobile app
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      new URLSearchParams(window.location.search).get('source') === 'pwa';

    if (isStandalone && (location.pathname === '/' || location.pathname === '')) {
      navigate('/app', { replace: true });
    }
  }, [location.pathname, navigate]);

  const isAdminRoute =
    location.pathname.toLowerCase().startsWith('/admin-login') ||
    location.pathname.toLowerCase().startsWith('/admin-dashboard');

  const isMobileAppRoute =
    location.pathname.toLowerCase().startsWith('/app') ||
    location.pathname.toLowerCase().startsWith('/mobile');

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const handleCloseDownloadModal = () => {
    setIsDownloadModalOpen(false);
    sessionStorage.setItem('fincred_app_download_dismissed', 'true');
  };

  const handleOpenDownloadModal = () => {
    setIsDownloadModalOpen(true);
  };

  if (isMobileAppRoute) {
    return (
      <Routes>
        <Route path="/app/*" element={<MobileApp />} />
        <Route path="/app" element={<MobileApp />} />
        <Route path="/mobile" element={<MobileApp />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Premium App Opening Splash Screen */}
      <AppSplashScreen />

      {!isAdminRoute && (
        <>
          <Navbar onOpenDownloadApp={handleOpenDownloadModal} />
          {/* Simple, compact Top Download Option with Cut ('X') button */}
          <TopDownloadBanner onOpenModal={handleOpenDownloadModal} />
        </>
      )}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Sign-up" element={<SignUpPage />} />
          <Route path="/sign-up" element={<Navigate to="/Sign-up" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedCustomerRoute>
                <DashboardPage />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedCustomerRoute>
                <ApplicationsPage />
              </ProtectedCustomerRoute>
            }
          />
          <Route path="/profile" element={<ProtectedCustomerRoute><ProfilePage /></ProtectedCustomerRoute>} />
          <Route path="/Admin-login" element={<AdminLoginPage />} />
          <Route path="/admin-login" element={<Navigate to="/Admin-login" replace />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isAdminRoute && !isCustomerLoggedIn && <Footer onOpenDownloadApp={handleOpenDownloadModal} />}
      {!isAdminRoute && <MobileBottomNav />}
      {!isAdminRoute && <FloatingCustomerButton />}

      {/* Global Secure Loan Application Modal */}
      <LoanApplicationModal />

      {/* Global Instant Loan Partner Modal (TrueBalance, Branch, Navi) */}
      <InstantLoanModal />

      {/* Global Application Tracking Modal */}
      <ApplicationTrackingModal 
        isOpen={isTrackModalOpen} 
        onClose={closeTrackModal} 
      />

      {/* Global CIBIL Score Improvement Modal */}
      <CibilImproveModal
        isOpen={isCibilModalOpen}
        onClose={closeCibilModal}
        defaultTrackingRef={cibilTrackingRef}
      />

      {/* Progressive Web App: Compact Download Modal & Offline Indicator */}
      {!isAdminRoute && (
        <>
          <DownloadAppModal 
            isOpen={isDownloadModalOpen} 
            onClose={handleCloseDownloadModal} 
          />
          <OfflineIndicator />
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
