import React from 'react';
import { Calendar, Wallet, Briefcase, Award, Clock, FileCheck2, AlertCircle, ArrowRight } from 'lucide-react';

interface EligibilitySectionProps {
  onCheckOptions: () => void;
}

export const EligibilitySection: React.FC<EligibilitySectionProps> = ({ onCheckOptions }) => {
  const criteria = [
    {
      title: 'Age',
      desc: 'Typically 21 to 60 years at the time of loan application or maturity (subject to lender policy).',
      icon: Calendar,
    },
    {
      title: 'Income',
      desc: 'Verifiable regular monthly salary or steady annual business cash flow as specified by the lender.',
      icon: Wallet,
    },
    {
      title: 'Employment / Business Profile',
      desc: 'Salaried individual with active employer tenure, self-employed professional, or registered business enterprise.',
      icon: Briefcase,
    },
    {
      title: 'Credit Profile',
      desc: 'Credit track record, repayment history, and bureau score evaluated per each lender’s risk criteria.',
      icon: Award,
    },
    {
      title: 'Existing Obligations',
      desc: 'Total ongoing monthly EMI obligations compared against net monthly income (Fixed Obligation to Income Ratio).',
      icon: Clock,
    },
    {
      title: 'Required Documents',
      desc: 'Valid government-issued identity, address proof, PAN card, and recent banking statements.',
      icon: FileCheck2,
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-slate-50 border-b border-slate-200/90" id="eligibility">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Explanatory Context & CTA */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-28">
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
              Parameters Overview
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] leading-tight">
              Basic Eligibility
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Eligibility requirements vary depending on the loan product and lender.
            </p>

            {/* Mandatory Non-Guarantee Advisory */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Important Criteria Note</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                “Meeting basic criteria does not guarantee loan approval. The lender may apply additional eligibility and credit assessment criteria.”
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onCheckOptions}
                id="eligibility-check-options-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer transition-all"
              >
                <span>Check My Options</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: 6 Criteria Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {criteria.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all space-y-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
