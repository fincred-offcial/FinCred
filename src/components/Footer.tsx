import React, { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { LegalModal, LegalModalType } from './LegalModals.js';
import { useAuth } from '../context/AuthContext.js';

interface FooterProps {
  onOpenDownloadApp?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDownloadApp }) => {
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const { openTrackModal, isCustomerLoggedIn } = useAuth();

  // Hide footer completely when customer is logged in or using customer portal
  // Only shown to unknown / guest users arriving at the public website
  if (isCustomerLoggedIn) {
    return null;
  }

  const handleInfoClick = (hash: string) => {
    window.location.hash = hash;
    const el = document.getElementById('important-information');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 pb-24 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          {/* Main Compact Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
            {/* 1. FINCRED Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1.5px]">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <span className="text-xl font-black text-white font-['Outfit',sans-serif]">
                  Fin<span className="text-blue-500">Cred</span>
                </span>
                <span className="text-[10px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded font-bold border border-blue-800">
                  INDIA
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Independent digital loan assistance and referral platform.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>Safe • Secure • 100% Digital</span>
              </div>
            </div>

            {/* 2. Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-3 font-['Outfit',sans-serif] text-xs uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="/#home" className="hover:text-blue-400 transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/#loan-options" className="hover:text-blue-400 transition-colors">
                    Loan Options
                  </a>
                </li>
                <li>
                  <a href="/#how-it-works" className="hover:text-blue-400 transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openTrackModal}
                    className="text-left text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
                  >
                    Track Your Application
                  </button>
                </li>
              </ul>
            </div>

            {/* 3. Information */}
            <div>
              <h4 className="text-white font-bold mb-3 font-['Outfit',sans-serif] text-xs uppercase tracking-wider">
                Information
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => handleInfoClick('eligibility')}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    Eligibility
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleInfoClick('faq')}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleInfoClick('contact')}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* 4. Legal */}
            <div>
              <h4 className="text-white font-bold mb-3 font-['Outfit',sans-serif] text-xs uppercase tracking-wider">
                Legal
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModalType('privacy')}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModalType('terms')}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModalType('disclaimer')}
                    className="hover:text-blue-400 transition-colors text-left text-amber-400 cursor-pointer"
                  >
                    Disclaimer
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Statutory Disclosure Mandated in Section 13 */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs text-slate-400 font-medium">
              “FinCred does not guarantee loan approval. Final loan decisions are made by the respective lender.”
            </p>
            <p className="text-[11px] text-slate-500 shrink-0">
              © {new Date().getFullYear()} FinCred. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
    </>
  );
};
