import React from 'react';
import {
  X,
  Building2,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Info,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { PartnerPlatform, PartnerLender } from '../types.js';

interface PartnerDetailsModalProps {
  platform: PartnerPlatform | null;
  loanCategory: string;
  leadId?: string;
  onClose: () => void;
  onApplyNow: (platform: PartnerPlatform) => void;
}

export const PartnerDetailsModal: React.FC<PartnerDetailsModalProps> = ({
  platform,
  loanCategory,
  leadId,
  onClose,
  onApplyNow
}) => {
  if (!platform) return null;

  const lenders = Array.isArray(platform.lenders) ? platform.lenders : [];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl my-6 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
                  {platform.name}
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-700">
                  {platform.partnerNetworkSummary || 'Partner Banks & NBFCs'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Verified Lending Partner Network & Associated Institutions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
            aria-label="Close Partner Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5 text-sm">
          
          {/* Platform Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/80 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900 text-sm">{platform.name} Lending Network</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {platform.description}
                </p>
              </div>
              {platform.verifiedPartnerCount && (
                <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {platform.verifiedPartnerCount}
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-600 block uppercase font-medium">Indicative Amount</span>
                <span className="font-bold text-slate-800">{platform.loanAmountRange || 'As per eligibility'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-600 block uppercase font-medium">Tenure</span>
                <span className="font-bold text-slate-800">{platform.tenureRange || 'Flexible'}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-600 block uppercase font-medium">Pricing</span>
                <span className="font-bold text-slate-800">{platform.interestRate || 'Competitive Rates'}</span>
              </div>
            </div>
          </div>

          {/* Verified Partner Lenders List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 font-['Outfit',sans-serif]">
                Verified Partner Institutions ({lenders.length})
              </h3>
              <span className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                <Calendar className="w-3 h-3" />
                Verified: {platform.lastVerifiedDate || 'September 2026'}
              </span>
            </div>

            {lenders.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center">
                Institutional partner list is being updated by FinCred compliance.
              </div>
            ) : (
              <div className="space-y-2.5">
                {lenders.map((lender) => (
                  <div
                    key={lender.lenderId}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {lender.lenderName}
                          </span>
                        </div>
                        {lender.productType && (
                          <p className="text-[11px] text-slate-500 font-medium">
                            Product: {lender.productType}
                          </p>
                        )}
                      </div>

                      {/* Precise Institution Type Badge - Never confuse Bank with NBFC */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                          lender.lenderType === 'Bank'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : lender.lenderType === 'NBFC'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        {lender.lenderType}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-600 gap-1.5">
                      <span>Source: {lender.sourceVerification || platform.sourceReference}</span>
                      <span>Verified: {lender.lastVerifiedDate || platform.lastVerifiedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Regulatory & Matching Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Underwriting & Lender Matching Policy</span>
            </div>
            <p className="text-amber-900/90 text-[11px] leading-relaxed">
              {platform.lenderNetworkDisclaimer ||
                "Multiple bank and NBFC partners are available through this platform. The specific lender applicable to an application is determined according to the platform's eligibility and underwriting process."}
            </p>
            <p className="text-amber-800/80 text-[10px]">
              Final approval, sanctioned loan amount, interest rate, and repayment terms are exclusively determined by the respective underwriting bank or NBFC.
            </p>
          </div>

          {leadId && (
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs text-slate-600">
              Your Application ID: <strong className="text-slate-900 font-mono">{leadId}</strong>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 sm:px-7 py-4 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Back to Options
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onApplyNow(platform);
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Apply Now with {platform.name}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
