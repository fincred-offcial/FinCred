import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, ArrowRight, LayoutDashboard, User, LogOut, LogIn, FileClock, Download, Search, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  onExploreLoanOptions?: () => void;
  onOpenDownloadApp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onExploreLoanOptions, onOpenDownloadApp }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { customer, isCustomerLoggedIn, customerLogout, openTrackModal, openInstantLoanModal, openCibilModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    customerLogout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleExplore = () => {
    setIsMobileMenuOpen(false);
    if (onExploreLoanOptions) {
      onExploreLoanOptions();
    } else {
      const el = document.getElementById('loan-options') || document.getElementById('loan-finder');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/#loan-options');
      }
    }
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl bg-white/95 border-b border-slate-200/90 transition-all duration-200 ${
      isScrolled ? 'shadow-md py-0' : 'shadow-xs py-0'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-200 ${
          isScrolled ? 'h-16' : 'h-16 sm:h-20'
        }`}>
          {/* Left: Brand Identity */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0" id="nav-brand-logo">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1.5px] shadow-xs">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-600 group-hover:scale-105 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight font-['Outfit',sans-serif]">
                  <span className="text-blue-600">Fin</span>
                  <span className="text-slate-900">Cred</span>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-blue-400 text-blue-700 tracking-wider">
                  INDIA
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide -mt-0.5">Loan Made Simple</p>
            </div>
          </Link>

          {/* Desktop Right Action Area */}
          <div className="hidden lg:flex items-center gap-2">
            {/* 1. Earn ₹ Button */}
            <button
              type="button"
              onClick={() => {
                if (isCustomerLoggedIn) {
                  navigate('/dashboard?tab=earn');
                } else {
                  navigate('/login');
                }
              }}
              id="desktop-nav-earn-btn"
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300 text-amber-900 text-xs font-black shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Refer & Earn Rewards"
            >
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">₹</span>
              <span>Earn ₹</span>
              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-200/80 text-amber-950">₹300+</span>
            </button>

            {/* CIBIL Score Improve Button */}
            <button
              type="button"
              onClick={() => openCibilModal()}
              id="nav-cibil-improve-btn"
              className="px-3 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-400"
              title="CIBIL Score Improve (₹299 Only)"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
              <span>CIBIL</span>
              <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full">₹299</span>
            </button>

            {/* 2. App Download Button */}
            {onOpenDownloadApp && (
              <button
                type="button"
                onClick={onOpenDownloadApp}
                id="desktop-nav-download-app-btn"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all flex items-center gap-1 cursor-pointer"
                title="FinCred App Download"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>App</span>
              </button>
            )}

            {/* 3. Login / Customer Session */}
            {isCustomerLoggedIn && customer ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/dashboard?tab=home"
                  id="nav-btn-profile"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{customer.fullName.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  id="nav-btn-logout"
                  title="Logout"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                id="nav-btn-login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3 h-3 text-emerald-400" />
                <span>Login</span>
              </Link>
            )}

            {/* 4. Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer"
              aria-label="Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile Right Action Area (Requirement 3: Earn ₹ | App | Login | Menu) */}
          <div className="flex lg:hidden items-center gap-1 sm:gap-1.5">
            {/* 1. Earn ₹ Button (Mobile) */}
            <button
              type="button"
              onClick={() => {
                if (isCustomerLoggedIn) {
                  navigate('/dashboard?tab=earn');
                } else {
                  navigate('/login');
                }
              }}
              id="mobile-nav-earn-btn"
              className="px-2 py-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-900 text-[11px] font-black shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center">₹</span>
              <span>Earn ₹</span>
            </button>

            {/* 2. App Button (Mobile) */}
            {onOpenDownloadApp && (
              <button
                type="button"
                onClick={onOpenDownloadApp}
                id="mobile-nav-download-btn"
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 flex items-center gap-1 cursor-pointer active:scale-95"
                title="FinCred App"
              >
                <Download className="w-3 h-3 text-blue-600" />
                <span>App</span>
              </button>
            )}

            {/* 3. Login Button (Mobile) */}
            {isCustomerLoggedIn && customer ? (
              <Link
                to="/dashboard?tab=home"
                id="mobile-nav-user-btn"
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 flex items-center gap-1"
              >
                <User className="w-3 h-3" />
                <span className="max-w-[45px] truncate">{customer.fullName.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                id="mobile-nav-login-btn"
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs flex items-center gap-1"
              >
                <LogIn className="w-3 h-3 text-emerald-400" />
                <span>Login</span>
              </Link>
            )}

            {/* 4. Hamburger Menu (Mobile) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              id="mobile-menu-toggle-btn"
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-200 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          {onOpenDownloadApp && (
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenDownloadApp();
              }}
              id="mobile-drawer-download-top-btn"
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>FinCred App Download</span>
            </button>
          )}

          {/* CIBIL Score Improve Mobile Drawer Option */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              openCibilModal();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/25 border border-emerald-400"
          >
            <TrendingUp className="w-4 h-4 text-amber-300" />
            <span>CIBIL Score Improve (₹299 Only)</span>
            <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">Offer</span>
          </button>

          {/* User systems shown ONLY when logged in */}
          {isCustomerLoggedIn && customer ? (
            <div className="space-y-3">
              <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Customer Portal</span>
                  <p className="text-sm font-bold text-slate-900">{customer.fullName}</p>
                  <p className="text-xs text-slate-500">+91 {customer.mobileNumber}</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  Verified
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 text-white font-medium text-xs text-center shadow-sm"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <Link
                  to="/applications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs text-center border border-slate-200"
                >
                  <FileClock className="w-3.5 h-3.5" />
                  My Apps
                </Link>
              </div>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs text-center border border-slate-200"
              >
                <User className="w-3.5 h-3.5" />
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            /* Public Page: Clean actions without Home - Loans - Information - Sign In */
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openTrackModal();
                }}
                id="mobile-menu-track-app-btn"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Search className="w-4 h-4 text-blue-600" />
                <span>Track Application Status</span>
              </button>

              <button
                type="button"
                onClick={handleExplore}
                id="mobile-menu-primary-explore-btn"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Loan Options</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm text-center hover:bg-slate-800 flex items-center justify-center gap-2 shadow-xs"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Portal Login</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
