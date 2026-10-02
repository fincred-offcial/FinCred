import React from 'react';
import { ShieldCheck, Zap, Lock, Sparkles, Check } from 'lucide-react';

export const ValuePropositionSection: React.FC = () => {
  const benefits = [
    {
      title: 'Zero Upfront Platform Fees',
      desc: 'Exploring and comparing loan options through FinCred is completely free with no hidden onboarding costs.',
    },
    {
      title: 'Streamlined Online Application',
      desc: 'Submit your basic profile once and get referred directly into authorized digital lending channels.',
    },
    {
      title: 'Strict Data Protection',
      desc: 'All submitted information is transferred through 256-bit SSL encrypted communication channels.',
    },
    {
      title: 'Respect for Applicant Time',
      desc: 'No confusing phone spam or unsolicited loan cold-calls; clear guidance at every stage.',
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-slate-50 border-b border-slate-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            Service Principles
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
            Transparent Loan Assistance Experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Built on factual standards and consumer integrity without fabricated marketing claims.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  {b.desc}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Protocol</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
