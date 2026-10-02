import React from 'react';
import { X, ExternalLink, Zap, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { logUserActivity } from '../services/api.js';

interface InstantLoanPartner {
  id: string;
  name: string;
  tag: string;
  amount: string;
  interest: string;
  time: string;
  features: string[];
  url: string;
  badgeColor: string;
  btnGradient: string;
}

const INSTANT_PARTNERS: InstantLoanPartner[] = [
  {
    id: 'truebalance',
    name: 'TrueBalance Instant Cash',
    tag: 'Instant Disbursal',
    amount: '₹1,000 – ₹1,00,000',
    interest: 'From 1.99% p.m.',
    time: '5 Minutes',
    features: ['100% Paperless Process', 'Direct Bank Transfer', 'Low CIBIL Accepted'],
    url: 'https://truebalance.onelink.me/bMoN/h56bcblp',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    btnGradient: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25'
  },
  {
    id: 'branch',
    name: 'Branch Personal Loan',
    tag: 'Minimal KYC',
    amount: '₹1,000 – ₹50,000',
    interest: 'From 2.0% p.m.',
    time: 'Instant Approval',
    features: ['No Physical Documents', '24x7 Digital Disbursal', 'Flexible Repayment'],
    url: 'https://branch.co/download/shubh12360',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    btnGradient: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25'
  },
  {
    id: 'navi',
    name: 'Navi Instant Cash Loan',
    tag: 'Up to ₹20 Lakhs',
    amount: '₹10,000 – ₹20,00,000',
    interest: 'From 9.9% p.a.',
    time: '2 Minutes',
    features: ['Completely Digital', 'Flexible Tenures up to 72 mos', 'Zero Foreclosure Fee'],
    url: 'https://r.navi.com/t3HqoB',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
    btnGradient: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25'
  }
];

export const InstantLoanModal: React.FC = () => {
  const { isInstantLoanModalOpen, closeInstantLoanModal, customer } = useAuth();

  if (!isInstantLoanModalOpen) return null;

  const handleApplyClick = (partner: InstantLoanPartner) => {
    // Log customer redirection activity to backend admin database
    logUserActivity({
      activityType: 'partner_redirect',
      description: `Customer clicked Instant Loan link: ${partner.name}`,
      customerId: customer?.customerId,
      userMobile: customer?.mobileNumber,
      userName: customer?.fullName,
      metadata: {
        partnerId: partner.id,
        partnerName: partner.name,
        targetUrl: partner.url
      }
    });

    // Open verified direct instant loan URL
    window.open(partner.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="instant-loan-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header with Spinning 3D Golden Coin Accent */}
        <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 p-5 sm:p-6 text-white border-b border-amber-500/30 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Spinning 3D Golden Coin */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-400 p-0.5 shadow-lg shadow-amber-500/30 shrink-0">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-amber-400 via-yellow-200 to-amber-500 flex items-center justify-center border border-amber-100 animate-[spin_6s_linear_infinite]">
                  <span className="text-xl font-black text-amber-950 font-serif drop-shadow-xs">₹</span>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Instant Loan Hub</span>
                </div>
                <h2 id="instant-loan-title" className="text-lg sm:text-xl font-black tracking-tight text-white font-['Outfit',sans-serif]">
                  Pre-Approved Instant Disbursal
                </h2>
                <p className="text-xs text-amber-100/80">
                  Select a partner below to get funds transferred in minutes
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeInstantLoanModal}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Instant Loan Partners List */}
        <div className="p-4 sm:p-5 space-y-3.5 max-h-[70vh] overflow-y-auto">
          {INSTANT_PARTNERS.map(partner => (
            <div
              key={partner.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Outfit',sans-serif] group-hover:text-blue-700 transition-colors">
                      {partner.name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${partner.badgeColor}`}>
                      {partner.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                    <span className="font-bold text-slate-900 font-mono">{partner.amount}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-medium text-emerald-600 flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-emerald-600" />
                      {partner.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Feature Badges */}
              <div className="flex flex-wrap gap-1.5">
                {partner.features.map((feat, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-600"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {feat}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleApplyClick(partner)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r ${partner.btnGradient} shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer`}
              >
                <span>Apply Now on {partner.name.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Security Disclaimer */}
          <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>100% Digital • Direct Official Partner Links • Safe & Protected</span>
          </div>
        </div>

      </div>
    </div>
  );
};
