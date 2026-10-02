import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Layers,
  FileText,
  User,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isCustomerLoggedIn, openInstantLoanModal, openCibilModal } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'home';

  // If unauthenticated: keep first screen 100% clean and focused
  if (!isCustomerLoggedIn) {
    return null;
  }

  const isHomeActive = location.pathname === '/dashboard' && (activeTab === 'home' || !searchParams.get('tab'));
  const isOptionsActive = location.pathname === '/dashboard' && activeTab === 'options';
  const isAppsActive = location.pathname === '/dashboard' && (activeTab === 'applications' || activeTab === 'status' || activeTab === 'my_loan');
  const isProfileActive = (location.pathname === '/dashboard' && activeTab === 'profile') || location.pathname === '/profile';

  return (
    <nav
      aria-label="Customer Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-1.5 py-1 shadow-2xl safe-bottom select-none"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* 1. Home */}
        <Link
          to="/dashboard?tab=home"
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
            isHomeActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${isHomeActive ? 'scale-110 text-blue-600 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className={`text-[10px] mt-0.5 tracking-tight ${isHomeActive ? 'font-black text-blue-600' : ''}`}>
            Home
          </span>
        </Link>

        {/* 2. Loan Options */}
        <Link
          to="/dashboard?tab=options"
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
            isOptionsActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Layers className={`w-5 h-5 transition-transform ${isOptionsActive ? 'scale-110 text-blue-600 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className={`text-[10px] mt-0.5 tracking-tight ${isOptionsActive ? 'font-black text-blue-600' : ''}`}>
            Options
          </span>
        </Link>

        {/* 3. CENTER GOLDEN COIN BUTTON (Large Circle, Rotating Gold Coin, Instant Loans) */}
        <button
          type="button"
          onClick={openInstantLoanModal}
          className="group flex flex-col items-center justify-center -mt-5 cursor-pointer focus:outline-none transition-transform active:scale-95"
          title="Instant Loan (5-Min Disbursal)"
        >
          {/* Outer Glowing Circle */}
          <div className="relative w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-0.5 shadow-xl shadow-amber-500/40 border-2 border-yellow-200">
            {/* Inner Rotating 3D Golden Coin */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-yellow-200 to-amber-600 flex items-center justify-center border border-amber-200 shadow-inner group-hover:scale-105 transition-transform">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-400 flex items-center justify-center border border-amber-100 shadow-xs animate-[spin_5s_linear_infinite]">
                <span className="text-lg font-black text-amber-950 font-serif drop-shadow-xs select-none">
                  ₹
                </span>
              </div>
            </div>

            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 text-[9px] font-black text-amber-950 items-center justify-center border border-white">
                ⚡
              </span>
            </span>
          </div>

          <span className="text-[9px] font-black text-amber-700 tracking-tight mt-0.5 drop-shadow-2xs">
            Instant ₹
          </span>
        </button>

        {/* 4. CIBIL IMPROVE BUTTON (Dedicated Feature) */}
        <button
          type="button"
          onClick={() => openCibilModal()}
          className="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer text-emerald-600 hover:text-emerald-700 relative"
          title="CIBIL Score Improve (₹299 Only)"
        >
          <div className="relative">
            <TrendingUp className="w-5 h-5 text-emerald-600 stroke-[2.2]" />
            <span className="absolute -top-1.5 -right-3 px-1 py-0.1 text-[8px] font-black bg-amber-400 text-slate-950 rounded-full shadow-xs">
              ₹299
            </span>
          </div>
          <span className="text-[10px] mt-0.5 font-bold tracking-tight text-emerald-700">
            CIBIL
          </span>
        </button>

        {/* 5. Applications */}
        <Link
          to="/dashboard?tab=applications"
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
            isAppsActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <FileText className={`w-5 h-5 transition-transform ${isAppsActive ? 'scale-110 text-blue-600 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className={`text-[10px] mt-0.5 tracking-tight ${isAppsActive ? 'font-black text-blue-600' : ''}`}>
            My Loans
          </span>
        </Link>

        {/* 6. Profile */}
        <Link
          to="/dashboard?tab=profile"
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
            isProfileActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <User className={`w-5 h-5 transition-transform ${isProfileActive ? 'scale-110 text-blue-600 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className={`text-[10px] mt-0.5 tracking-tight ${isProfileActive ? 'font-black text-blue-600' : ''}`}>
            Profile
          </span>
        </Link>
      </div>
    </nav>
  );
};
