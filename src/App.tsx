import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { MobileBottomNav } from './components/MobileBottomNav.js';
import { Footer } from './components/Footer.js';
import { LoanApplicationModal } from './components/LoanApplicationModal.js';
import { InstantLoanModal } from './components/InstantLoanModal.js';
import { ApplicationTrackingModal } from './components/ApplicationTrackingModal.js';
import { CibilImproveModal } from './components/CibilImproveModal.js';
import { OfflineIndicator } from './components/OfflineIndicator.js';
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

const ProtectedCustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isCustomerLoggedIn } = useAuth();
  if (!isCustomerLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
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

  const isAdminRoute = location.pathname.toLowerCase().startsWith('/admin');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      {!isAdminRoute && <Navbar />}

      <div className="flex-1">
        <Routes>
          {/* Public Home & Registration / Login */}
          <Route path="/" element={<HomePage />} />
          <Route path="/Sign-up" element={<SignUpPage />} />
          <Route path="/sign-up" element={<Navigate to="/Sign-up" replace />} />
          <Route path="/signup" element={<Navigate to="/Sign-up" replace />} />
          <Route path="/sign" element={<Navigate to="/Sign-up" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/portal-login" element={<LoginPage />} />

          {/* User Portal / Customer Portal */}
          <Route
            path="/dashboard"
            element={
              <ProtectedCustomerRoute>
                <DashboardPage />
              </ProtectedCustomerRoute>
            }
          />
          <Route path="/user-portal" element={<Navigate to="/dashboard" replace />} />
          <Route path="/customer-portal" element={<Navigate to="/dashboard" replace />} />
          <Route path="/portal" element={<Navigate to="/dashboard" replace />} />
          <Route path="/user" element={<Navigate to="/dashboard" replace />} />

          {/* Customer Applications & Profile */}
          <Route
            path="/applications"
            element={
              <ProtectedCustomerRoute>
                <ApplicationsPage />
              </ProtectedCustomerRoute>
            }
          />
          <Route path="/profile" element={<ProtectedCustomerRoute><ProfilePage /></ProtectedCustomerRoute>} />

          {/* Admin Portal & Operations */}
          <Route path="/Admin-login" element={<AdminLoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<Navigate to="/Admin-login" replace />} />
          <Route path="/admin-portal" element={<Navigate to="/Admin-login" replace />} />
          <Route path="/admin/login" element={<Navigate to="/Admin-login" replace />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin-dashboard" replace />} />

          {/* Former app routes cleanly fallback to home */}
          <Route path="/app/*" element={<Navigate to="/" replace />} />
          <Route path="/app" element={<Navigate to="/" replace />} />
          <Route path="/mobile/*" element={<Navigate to="/" replace />} />
          <Route path="/mobile" element={<Navigate to="/" replace />} />

          {/* Catch-all fallback to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isAdminRoute && !isCustomerLoggedIn && <Footer />}
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

      {/* Offline Status Indicator */}
      {!isAdminRoute && <OfflineIndicator />}
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
