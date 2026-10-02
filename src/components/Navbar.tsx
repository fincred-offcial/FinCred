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
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group" id="nav-brand-logo">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1.5px] shadow-sm">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:scale-105 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                  Fin<span className="text-blue-600">Cred</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 tracking-wider">
                  INDIA
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide">Loan Made Simple</p>
            </div>
          </Link>

          {/* Center / Security Badge Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Safe • Secure • 100% Digital</span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {isCustomerLoggedIn ? (
              <>
                <Link
                  to="/dashboard?tab=home"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    location.pathname === '/dashboard' && (!location.search || location.search.includes('tab=home'))
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/dashboard?tab=options"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    location.pathname === '/dashboard' && location.search.includes('tab=options')
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Loan Options
                </Link>
                <Link
                  to="/dashboard?tab=applications"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    location.pathname === '/dashboard' && location.search.includes('tab=applications')
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Applications
                </Link>
                {/* Center Golden Coin Instant Loans Button */}
                <button
                  type="button"
                  onClick={openInstantLoanModal}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/25 hover:scale-105 transition-all cursor-pointer border border-amber-300"
                  title="Instant Loans (TrueBalance, Branch, Navi)"
                >
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-400 flex items-center justify-center border border-amber-100 shadow-2xs animate-[spin_5s_linear_infinite]">
                    <span className="text-[10px] font-serif font-black">₹</span>
                  </div>
                  <span>Instant Loans</span>
                </button>
                <Link
                  to="/dashboard?tab=notifications"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    location.pathname === '/dashboard' && location.search.includes('tab=notifications')
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Notifications
                </Link>
                <Link
                  to="/dashboard?tab=profile"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    location.pathname === '/dashboard' && location.search.includes('tab=profile')
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    location.pathname === '/'
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Sign Up / Login
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* CIBIL Score Improve Button */}
            <button
              type="button"
              onClick={() => openCibilModal()}
              id="nav-cibil-improve-btn"
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-400"
              title="CIBIL Score Improve (₹299 Only)"
            >
              <TrendingUp className="w-4 h-4 text-amber-300" />
              <span>CIBIL Improve</span>
              <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full">₹299</span>
            </button>

            {/* Track Application Button */}
            <button
              type="button"
              onClick={openTrackModal}
              id="nav-track-app-btn"
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Track Your Application"
            >
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Track Application</span>
            </button>

            {/* Download App Action */}
            {onOpenDownloadApp && (
              <button
                type="button"
                onClick={onOpenDownloadApp}
                id="nav-download-app-btn"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-blue-700 bg-blue-50/90 hover:bg-blue-100 border border-blue-200/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="FinCred App Download"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>FinCred App Download</span>
              </button>
            )}

            {/* Primary CTA: "Explore Loan Options" */}
            <button
              type="button"
              onClick={handleExplore}
              id="nav-primary-explore-btn"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>Explore Loan Options</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Customer Session State */}
            {isCustomerLoggedIn && customer ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/profile"
                  id="nav-btn-profile"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 transition-colors"
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
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  id="nav-btn-login"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-900 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Login</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Action Area */}
          <div className="flex lg:hidden items-center gap-1.5">
            {onOpenDownloadApp && (
              <button
                type="button"
                onClick={onOpenDownloadApp}
                id="mobile-nav-download-btn"
                className="px-2 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 flex items-center gap-1 cursor-pointer"
                title="📲 FinCred App Download Karein"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>App</span>
              </button>
            )}

            {!isCustomerLoggedIn && (
              <Link
                to="/login"
                id="mobile-nav-login-btn"
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                <span>Login</span>
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              id="mobile-menu-toggle-btn"
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-200 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
