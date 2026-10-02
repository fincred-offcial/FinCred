import React from 'react';
import { User, Briefcase, Landmark, Zap, Smartphone, ArrowRight, Check, ShieldCheck, ExternalLink, Download, Sparkles } from 'lucide-react';
import { LoanCategory } from '../types.js';

interface LoanOptionsSectionProps {
  onSelectCategory: (category: LoanCategory) => void;
  onDownloadUpi: () => void;
  onChoiceConnectLoan?: () => void;
}

export const LoanOptionsSection: React.FC<LoanOptionsSectionProps> = ({
  onSelectCategory,
  onDownloadUpi,
  onChoiceConnectLoan,
}) => {
  const handleChoiceConnectClick = () => {
    if (onChoiceConnectLoan) {
      onChoiceConnectLoan();
    } else {
      onSelectCategory('Personal Loan');
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-white text-slate-900" id="loan-options">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            Curated Categories & Quick Access
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
            Explore Loan Options
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Choose the option that best matches your financial requirement.
          </p>
        </div>

        {/* TOP PRIORITY FEATURED CARDS: Download Navi UPI App & Personal Loan */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TOP CARD 1: Download Navi UPI App */}
          <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-500/30 shadow-lg hover:shadow-emerald-900/20 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Top Recommended
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">
                  Download Navi UPI App
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
                  Experience fast, secure UPI payments with zero transaction failures, instant cashback rewards, and effortless digital banking.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero Transaction Fee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant Cashback</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>NPCI Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No Form Required</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800/80 relative">
              <button
                type="button"
                onClick={onDownloadUpi}
                id="top-download-navi-upi-btn"
                className="w-full py-3.5 px-5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Navi UPI App</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
          </div>

          {/* TOP CARD 2: Personal Loan (Choice Connect) */}
          <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white border border-blue-500/30 shadow-lg hover:shadow-blue-900/20 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Choice Connect Partner
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">
                  Personal Loan
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
                  Explore tailored digital personal loan options with instant paperless eligibility check through Choice Connect verified lender network.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Choice Connect Link</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Instant Eligibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Paperless Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Direct Partner Access</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800/80 relative">
              <button
                type="button"
                onClick={handleChoiceConnectClick}
                id="top-apply-personal-loan-btn"
                className="w-full py-3.5 px-5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Apply Personal Loan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Main Loan Cards + Additional Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* CARD 1: Personal Loan (PL) — Name updated as requested, original WeRize link unchanged */}
          <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-white border border-slate-200/90 hover:border-blue-500 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Individual (PL)
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                  Personal Loan (PL)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  Personal loan referral up to ₹15 Lakhs via RBI-registered NBFC partner WeRize.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Up to ₹15 Lakhs*</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>RBI NBFC Partner WeRize</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Paperless verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Lender-based approval</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onSelectCategory('Personal Loan (PL)')}
                id="explore-personal-loan-pl-btn"
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Explore Personal Loan (PL)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CARD 2: Business Loan */}
          <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-white border border-slate-200/90 hover:border-indigo-500 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Commercial
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                  Business Loan
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  Explore financing options for eligible business and enterprise requirements.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Business-focused options</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Digital application</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Eligibility-based offers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Lender decision</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onSelectCategory('Personal / Business Loan')}
                id="explore-business-loan-btn"
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Explore Business Loan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CARD 3: Other Loan Options */}
          <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-white border border-slate-200/90 hover:border-slate-400 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
                  <Landmark className="w-6 h-6 text-slate-700" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Aggregated
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                  Other Loan Options
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  Explore additional loan options available through participating lending partners.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>Home & Property loans*</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>Vehicle & Gold credit*</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>Multi-lender network</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>Lender-based assessment</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onSelectCategory('All Type Loan')}
                id="view-other-options-btn"
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>View Options</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Category Strip: Instant Cash & Safe UPI Apps */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950 font-['Outfit',sans-serif]">
                  Urgent Cash Assistance
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Explore digital micro-loan options through verified mobile app partners.
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('Instant Loan')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 cursor-pointer shadow-xs"
            >
              Explore Instant Loan
            </button>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950 font-['Outfit',sans-serif]">
                  Download Navi UPI App
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Zero transaction failure charges, secure payments & instant cashback directly on Navi UPI.
                </p>
              </div>
            </div>
            <button
              onClick={onDownloadUpi}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Download Navi UPI App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-6">
          *Values marked with an asterisk depend entirely on the respective lender’s credit criteria, terms, and policies.
        </p>
      </div>
    </section>
  );
};
