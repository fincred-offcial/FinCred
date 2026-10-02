import React from 'react';
import { ArrowRight, ChevronRight, ShieldCheck } from 'lucide-react';

interface FinalCtaSectionProps {
  onExploreClick: () => void;
  onHowItWorksClick: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  onExploreClick,
  onHowItWorksClick,
}) => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Subtle Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-80 bg-blue-600/15 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-xs font-semibold text-blue-300">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>Simple Digital Steps</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
          Ready to Explore Your Loan Options?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Start with a few basic details and explore the options that may be available based on your eligibility.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onExploreClick}
            id="final-cta-explore-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
          >
            <span>Explore Loan Options</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onHowItWorksClick}
            id="final-cta-howitworks-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-all"
          >
            <span>Learn How It Works</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <p className="text-[11px] sm:text-xs text-slate-400 font-medium pt-3 max-w-xl mx-auto">
          Approval, interest rate, loan amount and other terms are subject to the respective lender’s assessment and criteria.
        </p>
      </div>
    </section>
  );
};
