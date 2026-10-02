import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight, LayoutDashboard, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const FloatingCustomerButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCustomerLoggedIn, customer } = useAuth();

  // Hide on admin routes or if already on dedicated entry or dashboard
  const isAdminRoute =
    location.pathname.toLowerCase().startsWith('/admin-login') ||
    location.pathname.toLowerCase().startsWith('/admin-dashboard');

  const isJourneyOrAuthRoute =
    location.pathname === '/' ||
    location.pathname === '' ||
    location.pathname.toLowerCase().startsWith('/login') ||
    location.pathname.toLowerCase().startsWith('/sign-up') ||
    location.pathname.toLowerCase().startsWith('/dashboard');

  if (isAdminRoute || isJourneyOrAuthRoute) {
    return null;
  }

  const handleClick = () => {
    if (isCustomerLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  // If already on dashboard and logged in, we can either highlight or keep subtle
  const isOnDashboard = location.pathname === '/dashboard';

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      <div className="relative group">
        {/* Subtle Animated Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse" />

        {/* Premium Floating Button */}
        <button
          type="button"
          onClick={handleClick}
          id="fincred-floating-cta-button"
          aria-label={isCustomerLoggedIn ? 'Open Customer Portal' : 'Apply / Login with FINCRED'}
          className="relative flex items-center gap-2.5 px-5 py-3 rounded-full bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          {/* FINCRED Emblem */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center p-[1px] shadow-sm">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
              {isCustomerLoggedIn ? (
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              )}
            </div>
          </div>

          {/* Button Text */}
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black uppercase tracking-wider text-white font-['Outfit',sans-serif] leading-tight flex items-center gap-1">
              <span>{isCustomerLoggedIn ? 'Customer Portal' : 'Check Loan Options'}</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </span>
            <span className="text-[9px] text-slate-300 font-medium">
              {isCustomerLoggedIn
                ? `Hi, ${customer?.fullName ? customer.fullName.split(' ')[0] : 'Member'}`
                : 'Instant 100% Digital Flow'}
            </span>
          </div>

          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center ml-1">
            <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};
