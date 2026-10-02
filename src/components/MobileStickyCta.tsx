import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';

interface MobileStickyCtaProps {
  onExploreClick: () => void;
}

export const MobileStickyCta: React.FC<MobileStickyCtaProps> = ({ onExploreClick }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 p-2.5 bg-slate-900/90 backdrop-blur-md border-t border-slate-700/80 shadow-2xl animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        <button
          type="button"
          onClick={onExploreClick}
          id="mobile-sticky-explore-cta"
          className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>Explore Loan Options</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss sticky loan button"
          className="p-2 text-slate-300 hover:text-white rounded-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
