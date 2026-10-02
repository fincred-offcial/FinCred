import React from 'react';
import { ArrowRight, ShieldCheck, Lock, ChevronRight, Smartphone, Sparkles, ExternalLink, Download } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onHowItWorksClick: () => void;
  onDownloadNaviUpi?: () => void;
  onApplyPersonalLoan?: () => void;
  onApplyPersonalLoanPl?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onHowItWorksClick,
  onDownloadNaviUpi,
  onApplyPersonalLoan,
  onApplyPersonalLoanPl
}) => {
  const handleNaviClick = () => {
    if (onDownloadNaviUpi) {
      onDownloadNaviUpi();
    } else {
      window.open('https://r.navi.com/t3HqoB', '_blank', 'noopener,noreferrer');
    }
  };

  const handlePersonalLoanClick = () => {
    if (onApplyPersonalLoan) {
      onApplyPersonalLoan();
    } else {
      window.open('https://choiceconnect.in/referral/loan/personal-loan/QzAxMTkyOTg=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r', '_blank', 'noopener,noreferrer');
    }
  };

  const handlePersonalLoanPlClick = () => {
    if (onApplyPersonalLoanPl) {
      onApplyPersonalLoanPl();
    } else {
      window.open('https://www.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28">
      {/* Background Subtle Gradient Glows (Fintech Navy / Royal Blue) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent pointer-events-none blur-3xl" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Fast Access Bar (Download Navi UPI App & Personal Loan Quick Links) */}
        <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
          {/* Download Navi UPI App */}
          <button
            type="button"
            onClick={handleNaviClick}
            id="hero-top-navi-upi-btn"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 hover:border-emerald-400 text-xs font-bold text-emerald-300 transition-all cursor-pointer shadow-sm hover:shadow-emerald-500/20"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Navi UPI App</span>
            <ExternalLink className="w-3 h-3 text-emerald-400/80 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Personal Loan (Choice Connect) */}
          <button
            type="button"
            onClick={handlePersonalLoanClick}
            id="hero-top-personal-loan-btn"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 hover:border-sky-400 text-xs font-bold text-sky-300 transition-all cursor-pointer shadow-sm hover:shadow-sky-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Personal Loan</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-400/20 text-sky-200 uppercase font-mono">Choice Connect</span>
            <ExternalLink className="w-3 h-3 text-sky-400/80 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Personal Loan (PL) (WeRize) */}
          <button
            type="button"
            onClick={handlePersonalLoanPlClick}
            id="hero-top-personal-loan-pl-btn"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30 hover:border-blue-400 text-xs font-bold text-blue-300 transition-all cursor-pointer shadow-sm hover:shadow-blue-500/20"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Personal Loan (PL)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-400/20 text-blue-200 uppercase font-mono">WeRize</span>
            <ExternalLink className="w-3 h-3 text-blue-400/80 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/25 text-xs font-semibold text-blue-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="tracking-wide uppercase">LOAN ASSISTANCE PLATFORM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-['Outfit',sans-serif] leading-[1.15]">
              Explore Loan Options That{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                Match Your Needs
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              FinCred helps you explore suitable loan options through a simple digital process. Submit your basic details, check available options and proceed with the lender that matches your eligibility.
            </p>

            {/* Primary & Secondary CTAs with Direct Quick Actions */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3">
              {/* Primary: Download Navi UPI App */}
              <button
                type="button"
                onClick={handleNaviClick}
                id="hero-primary-navi-upi-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/50 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Navi UPI App</span>
              </button>

              {/* Primary: Apply Personal Loan (Choice Connect) */}
              <button
                type="button"
                onClick={handlePersonalLoanClick}
                id="hero-primary-choice-pl-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all cursor-pointer"
              >
                <span>Apply Personal Loan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Personal Loan (PL) */}
              <button
                type="button"
                onClick={handlePersonalLoanPlClick}
                id="hero-primary-pl-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-indigo-600/90 hover:bg-indigo-600 text-white border border-indigo-500/40 transition-all cursor-pointer shadow-md"
              >
                <span>Personal Loan (PL)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary: Explore Loan Options */}
              <button
                type="button"
                onClick={onExploreClick}
                id="hero-secondary-explore-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all cursor-pointer backdrop-blur-xs"
              >
                <span>Explore All Options</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Transparency Line */}
            <p className="text-xs text-slate-400 font-medium pt-1 flex items-center justify-center lg:justify-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Loan approval and terms are decided by the respective lender.</span>
            </p>
          </div>

          {/* Right Column: Modern Finance-Themed Visual */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* Blue financial glow behind mockup */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-indigo-600/20 rounded-3xl blur-2xl transform rotate-1" />

              {/* Smartphone Frame with Loan Application Interface */}
              <div className="relative rounded-3xl border border-slate-700/80 bg-slate-900/90 shadow-2xl p-4 sm:p-5 backdrop-blur-xl text-slate-200">
                {/* Phone Notch Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>FinCred Assistant</span>
                  </div>
                  <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full">
                    Digital Referral
                  </span>
                </div>

                {/* Interactive Loan Category Preview Card */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-850 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Featured Partner</span>
                    <span className="text-xs font-semibold text-emerald-400">Navi UPI & Choice Connect</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Personal Loan & Instant UPI</span>
                    <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5 font-['Outfit',sans-serif]">
                      ₹ 3,50,000*
                    </div>
                  </div>

                  {/* Progress / Step status indicator */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Step 2 of 4: Eligibility Check</span>
                      <span className="text-blue-400 font-medium">In Progress</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Illustrative EMI calculation preview */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">UPI Payments</span>
                    <span className="font-semibold text-emerald-400 mt-0.5 block">Navi UPI (Free)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Personal Loan (PL)</span>
                    <span className="font-semibold text-blue-400 mt-0.5 block">WeRize Partner</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Safe & Secure Transfer</span>
                  </div>
                  <span className="text-slate-500">*Lender decided</span>
                </div>
              </div>

              {/* Floating Decorative Badges */}
              <div className="hidden sm:flex absolute -top-4 -left-6 items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-slate-700/80 text-xs font-semibold text-white shadow-xl backdrop-blur-md animate-bounce-subtle">
                <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Simple Application</span>
              </div>

              <div className="hidden sm:flex absolute top-1/2 -right-6 items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-slate-700/80 text-xs font-semibold text-white shadow-xl backdrop-blur-md">
                <div className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span>Secure Process</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
