import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  CheckCircle2,
  Building2,
  User,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Gift,
  Coins,
  Share2,
  UserCheck,
  TrendingUp,
  Clock,
  Check,
  ExternalLink,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { EmiCalculatorSection } from '../components/EmiCalculatorSection.js';
import { HowItWorksSection } from '../components/HowItWorksSection.js';
import { LoanCostTransparencySection } from '../components/LoanCostTransparencySection.js';
import { SafetyTransparencySection } from '../components/SafetyTransparencySection.js';
import { FaqSection } from '../components/FaqSection.js';
import { ContactSection } from '../components/ContactSection.js';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    openLoanModal,
    openInstantLoanModal,
    openCibilModal,
    isCustomerLoggedIn
  } = useAuth();

  // Handle Start Earning button click (Requirement 11 & 18)
  const handleStartEarning = () => {
    if (isCustomerLoggedIn) {
      navigate('/dashboard?tab=earn');
    } else {
      navigate('/login');
    }
  };

  // Handle Main Loan CTA (Requirement 7)
  const handleCheckEligibility = () => {
    openLoanModal('Personal Loan');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* ============================================================== */}
      {/* SECTION 1: BLUE DIGITAL LOAN HERO (Mobile-First Target Screen) */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a192f] via-[#0d2847] to-[#081b33] text-white pt-6 pb-10 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-cyan-900/30">
        {/* Curved Technology Lines & Soft Blue/Cyan Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent pointer-events-none blur-3xl" />
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Digital Banking Curved Grid Lines Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c70a_1px,transparent_1px),linear-gradient(to_bottom,#0284c70a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
          {/* Badge: DIGITAL LOAN FEST • 2026 SPECIAL */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-xs backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>DIGITAL LOAN FEST • 2026 SPECIAL</span>
          </div>

          {/* Main Headings */}
          <div className="space-y-1 sm:space-y-2">
            <p className="text-sm sm:text-lg font-black text-amber-300 font-['Outfit',sans-serif] tracking-wide">
              Sapno Ko Do Nayi Udaan
            </p>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Instant Loan Assistance Upto
            </h1>
            <div className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-sky-200 drop-shadow-sm font-['Outfit',sans-serif]">
              ₹30 Lakhs*
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
            Compare offers across 250+ RBI-registered NBFCs & Banks at competitive interest rates with zero branch visits and paperless processing.
          </p>

          {/* 3 Compact Glass-Style Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <div className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white text-[11px] sm:text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>5-Min Digital Sanction</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white text-[11px] sm:text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Zero Physical Docs</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white text-[11px] sm:text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-cyan-300" />
              <span>250+ Partner Network</span>
            </div>
          </div>

          {/* 2 Semi-Transparent Glass Stat Cards (Two columns maintained on mobile) */}
          <div className="grid grid-cols-2 gap-3 pt-2 max-w-md mx-auto">
            {/* Card 1: Interest Rates */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-left shadow-inner transition-transform hover:scale-[1.02]">
              <span className="text-[9px] sm:text-[10px] font-bold text-cyan-200 uppercase tracking-wider block">
                INTEREST RATES
              </span>
              <span className="text-base sm:text-xl font-black text-white font-['Outfit',sans-serif] block mt-0.5">
                10.49% p.a.*
              </span>
              <span className="text-[10px] text-slate-300 block font-medium">
                Starting range
              </span>
            </div>

            {/* Card 2: Loan Sanctions */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-left shadow-inner transition-transform hover:scale-[1.02]">
              <span className="text-[9px] sm:text-[10px] font-bold text-cyan-200 uppercase tracking-wider block">
                LOAN SANCTIONS
              </span>
              <span className="text-base sm:text-xl font-black text-white font-['Outfit',sans-serif] block mt-0.5">
                ₹30 Lakhs
              </span>
              <span className="text-[10px] text-slate-300 block font-medium">
                Max assistance
              </span>
            </div>
          </div>

          {/* Main Loan CTA: Large Rounded Button */}
          <div className="pt-2 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleCheckEligibility}
              id="hero-check-eligibility-btn"
              className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-300 to-white hover:from-cyan-300 hover:to-sky-100 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 tracking-wide font-['Outfit',sans-serif]"
            >
              <span>Check Your Loan Eligibility Now</span>
              <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        
        {/* ============================================================== */}
        {/* SECTION 2: NEW EARNING SECTION (Premium Refer & Earn Card)    */}
        {/* ============================================================== */}
        <section
          aria-label="Earn With FinCred"
          className="bg-gradient-to-b from-sky-50/80 via-white to-sky-50/50 rounded-3xl p-5 sm:p-7 border-2 border-sky-200/90 shadow-lg shadow-sky-500/5 space-y-5 relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black shadow-2xs">
            <span>🪙</span>
            <span>Earn With FinCred</span>
          </div>

          {/* Header + Two-Column Composition on Tablet/Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Left Content Area */}
            <div className="md:col-span-7 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit',sans-serif] tracking-tight">
                Refer & Earn With FinCred
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Share your FinCred referral link and earn rewards when eligible referred loans are successfully disbursed.
              </p>

              {/* Start Earning Button (Requirement 11) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleStartEarning}
                  id="home-start-earning-btn"
                  className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <span>Start Earning</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Side: Reward Panels */}
            <div className="md:col-span-5 space-y-2.5">
              {/* ₹200 Reward Panel (Deep blue/purple gradient card) */}
              <div className="bg-gradient-to-br from-[#0c2340] via-[#1a365d] to-[#1e1b4b] rounded-2xl p-4 sm:p-5 text-white shadow-md border border-indigo-400/30 relative overflow-hidden">
                <div className="absolute top-2 right-2 w-16 h-16 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                      UP TO
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-300 font-['Outfit',sans-serif] tracking-tight block my-0.5">
                      ₹200*
                    </span>
                    <p className="text-xs text-blue-100 font-semibold leading-snug">
                      Earn on eligible<br />loan referrals
                    </p>
                  </div>

                  {/* Rupee Illustration Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md shadow-amber-500/30 shrink-0">
                    <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                      <span className="text-xl font-black text-amber-400 font-serif">₹</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* First-Time App Reward (Smaller white rounded card) */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-sky-200/90 shadow-2xs flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Gift className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>First-Time App Reward:</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    *Subject to eligibility & verification.
                  </span>
                </div>

                <span className="text-lg sm:text-xl font-black text-emerald-600 font-mono shrink-0">
                  ₹100*
                </span>
              </div>
            </div>
          </div>

          {/* Three-Step Earning Process (Requirement 12) */}
          <div className="pt-3 border-t border-sky-100">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              {/* STEP 01 */}
              <div className="bg-white/90 p-2.5 sm:p-3.5 rounded-2xl border border-sky-100 shadow-2xs flex flex-col items-center">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-black text-xs flex items-center justify-center mb-1.5 shadow-2xs">
                  01
                </span>
                <span className="text-xs font-black text-slate-900 block">Register</span>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 hidden xs:block">
                  Complete your referral profile
                </p>
              </div>

              {/* STEP 02 */}
              <div className="bg-white/90 p-2.5 sm:p-3.5 rounded-2xl border border-sky-100 shadow-2xs flex flex-col items-center">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-xs flex items-center justify-center mb-1.5 shadow-2xs">
                  02
                </span>
                <span className="text-xs font-black text-slate-900 block">Share</span>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 hidden xs:block">
                  Get your unique referral link
                </p>
              </div>

              {/* STEP 03 */}
              <div className="bg-white/90 p-2.5 sm:p-3.5 rounded-2xl border border-sky-100 shadow-2xs flex flex-col items-center">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs flex items-center justify-center mb-1.5 shadow-2xs">
                  03
                </span>
                <span className="text-xs font-black text-slate-900 block">Earn</span>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 hidden xs:block">
                  Receive eligible referral rewards
                </p>
              </div>
            </div>
          </div>

          {/* Earning Disclaimer (Requirement 13) */}
          <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed pt-1">
            *Rewards are subject to eligibility, verification, qualifying actions and applicable terms. Loan approval/disbursal is subject to the respective lender/provider’s decision.
          </p>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: FEATURE ICON SECTION (Requirement 14)               */}
        {/* ============================================================== */}
        <section
          aria-label="FinCred Loan Features"
          className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            {/* 1. PERSONAL Loan */}
            <button
              type="button"
              onClick={() => openLoanModal('Personal Loan')}
              id="feature-card-personal-loan"
              className="bg-slate-50 hover:bg-blue-50/70 p-3 sm:p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all text-center flex flex-col items-center justify-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                <User className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 uppercase tracking-wider block">
                PERSONAL
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Loan</span>
            </button>

            {/* 2. BUSINESS Loan */}
            <button
              type="button"
              onClick={() => openLoanModal('Business Loan')}
              id="feature-card-business-loan"
              className="bg-slate-50 hover:bg-purple-50/70 p-3 sm:p-4 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all text-center flex flex-col items-center justify-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                <Building2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black text-slate-900 group-hover:text-purple-600 uppercase tracking-wider block">
                BUSINESS
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Loan</span>
            </button>

            {/* 3. MULTIPLE Lenders */}
            <button
              type="button"
              onClick={() => {
                if (isCustomerLoggedIn) {
                  navigate('/dashboard?tab=options');
                } else {
                  openLoanModal('Personal Loan');
                }
              }}
              id="feature-card-multiple-lenders"
              className="bg-slate-50 hover:bg-amber-50/70 p-3 sm:p-4 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all text-center flex flex-col items-center justify-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                <CreditCard className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black text-slate-900 group-hover:text-amber-600 uppercase tracking-wider block">
                MULTIPLE
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Lenders</span>
            </button>

            {/* 4. FASTER Process */}
            <button
              type="button"
              onClick={openInstantLoanModal}
              id="feature-card-faster-process"
              className="bg-slate-50 hover:bg-emerald-50/70 p-3 sm:p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all text-center flex flex-col items-center justify-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                <Zap className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black text-slate-900 group-hover:text-emerald-600 uppercase tracking-wider block">
                FASTER
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Process</span>
            </button>
          </div>
        </section>

        {/* ============================================================== */}
        {/* PRESERVED ESSENTIAL VALUE SECTIONS (EMI, How it Works, FAQ)   */}
        {/* ============================================================== */}
        <EmiCalculatorSection />
        <HowItWorksSection />
        <LoanCostTransparencySection />
        <SafetyTransparencySection />
        <FaqSection />
        <ContactSection />
      </main>
    </div>
  );
};
