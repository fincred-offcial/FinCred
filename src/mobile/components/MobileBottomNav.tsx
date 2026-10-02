import React from 'react';
import { Home, Compass, ClipboardList, User } from 'lucide-react';

export type MobileTab = 'home' | 'loans' | 'applications' | 'profile';

interface MobileBottomNavProps {
  currentTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  applicationsCount?: number;
  onOpenInstantLoans?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onChangeTab,
  applicationsCount = 0,
  onOpenInstantLoans
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0F1D]/95 backdrop-blur-md border-t border-slate-800/90 px-3 py-1.5 safe-area-pb select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 cursor-pointer ${
            currentTab === 'home'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
          {currentTab === 'home' && <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />}
        </button>

        {/* 2. Loans */}
        <button
          type="button"
          onClick={() => onChangeTab('loans')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 cursor-pointer ${
            currentTab === 'loans'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className={`w-5 h-5 ${currentTab === 'loans' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Loans</span>
          {currentTab === 'loans' && <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />}
        </button>

        {/* 3. CENTER GOLDEN COIN BUTTON (Circle shape, larger, spinning gold coin animation) */}
        <button
          type="button"
          onClick={onOpenInstantLoans}
          className="group flex flex-col items-center justify-center -mt-6 cursor-pointer focus:outline-none transition-transform active:scale-95"
          title="Instant Loan (5-Min Disbursal)"
        >
          <div className="relative w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-0.5 shadow-xl shadow-amber-500/40 border-2 border-yellow-200">
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
          <span className="text-[9px] font-black text-amber-400 tracking-tight mt-0.5 drop-shadow-2xs">
            Instant ₹
          </span>
        </button>

        {/* 4. Applications */}
        <button
          type="button"
          onClick={() => onChangeTab('applications')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 cursor-pointer relative ${
            currentTab === 'applications'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ClipboardList className={`w-5 h-5 ${currentTab === 'applications' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            {Boolean(applicationsCount && applicationsCount > 0) && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center border border-[#0A0F1D]">
                {applicationsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Applications</span>
          {currentTab === 'applications' && <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />}
        </button>

        {/* 5. Profile */}
        <button
          type="button"
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 cursor-pointer ${
            currentTab === 'profile'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Profile</span>
          {currentTab === 'profile' && <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />}
        </button>
      </div>
    </nav>
  );
};
