import React from 'react';
import { AlertTriangle, TrendingDown, Layers, CheckSquare, FileQuestion, Ban, ShieldX, ArrowRight } from 'lucide-react';

interface LoanRejectionInfoSectionProps {
  onExploreOther: () => void;
}

export const LoanRejectionInfoSection: React.FC<LoanRejectionInfoSectionProps> = ({
  onExploreOther,
}) => {
  const reasons = [
    {
      title: 'Credit Profile',
      desc: 'Past defaults, delayed settlements, high credit card utilization, or a credit score below the lender’s internal threshold.',
      icon: TrendingDown,
    },
    {
      title: 'Income / Repayment Capacity',
      desc: 'Insufficient net disposable monthly surplus relative to the requested loan size and requested monthly installment.',
      icon: AlertTriangle,
    },
    {
      title: 'Existing Loans',
      desc: 'A high debt-to-income (FOIR) ratio indicating multiple concurrent active personal or commercial loans.',
      icon: Layers,
    },
    {
      title: 'Lender Eligibility Criteria',
      desc: 'Specific organizational guidelines regarding non-serviceable residential pin codes, minimum employer vintage, or age bounds.',
      icon: CheckSquare,
    },
    {
      title: 'Incomplete Information',
      desc: 'Failure to provide required secondary identity, banking, or income verification documents within the requested time frame.',
      icon: FileQuestion,
    },
    {
      title: 'Incorrect Information',
      desc: 'Mismatches between declared applicant details and official records retrieved from NSDL PAN or Aadhaar databases.',
      icon: Ban,
    },
    {
      title: 'Internal Risk Assessment',
      desc: 'Proprietary automated algorithmic scoring models used by lenders to assess stability and occupational risk.',
      icon: ShieldX,
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-white text-slate-900 border-b border-slate-200/90" id="rejection-info">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Educational Transparency
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
            Why Can a Loan Application Be Declined?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Understanding underwriting factors helps you improve your financial profile for future credit reviews.
          </p>
        </div>

        {/* 7 Rejection Factors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reasons.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 transition-all space-y-2"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
                  {reason.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {reason.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mandated Note & CTA */}
        <div className="mt-8 p-5 rounded-2xl bg-slate-100 border border-slate-200 text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            “FinCred does not determine or guarantee the lender’s decision. A lender may decline an application based on its own assessment criteria.”
          </p>
          <div>
            <button
              type="button"
              onClick={onExploreOther}
              id="explore-other-options-cta-btn"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer transition-all"
            >
              <span>Explore Other Available Options</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
