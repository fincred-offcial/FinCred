import React from 'react';
import { Percent, Receipt, FileText, Calendar, Calculator, ShieldAlert, BadgeInfo } from 'lucide-react';

export const LoanCostTransparencySection: React.FC = () => {
  const costFactors = [
    {
      title: 'Interest Rate / APR',
      desc: 'The annual cost of borrowing expressed as a percentage, determined by the lender based on your credit profile and tenure.',
      icon: Percent,
    },
    {
      title: 'Processing Fee',
      desc: 'One-time administrative fee levied by the lender at loan origination, usually deducted from the disbursed loan amount.',
      icon: Receipt,
    },
    {
      title: 'Other Applicable Charges',
      desc: 'Potential stamp duty, document charges, GST on fees, late payment penalties, or foreclosure fees defined in the loan agreement.',
      icon: FileText,
    },
    {
      title: 'Loan Tenure',
      desc: 'The repayment duration (in months or years) over which you amortize the borrowed principal and accrued interest.',
      icon: Calendar,
    },
    {
      title: 'Equated Monthly Installment (EMI)',
      desc: 'The fixed monthly amount payable to the lender combining interest and principal repayment.',
      icon: Calculator,
    },
    {
      title: 'Total Repayment Amount',
      desc: 'The cumulative total sum paid across the entire loan duration including principal, full interest, and levied fees.',
      icon: BadgeInfo,
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-slate-50 border-b border-slate-200/90" id="loan-cost">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            Financial Literacy
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
            Understand Your Loan Cost
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Clear knowledge of all cost components ensures responsible borrowing and informed decisions.
          </p>
        </div>

        {/* 6 Cost Parameter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {costFactors.map((factor, idx) => {
            const Icon = factor.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                  {factor.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {factor.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Prominent Message mandated by prompt */}
        <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 text-white shadow-md flex items-start gap-4 max-w-3xl mx-auto">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-white font-['Outfit',sans-serif]">
              Borrower Advisory
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              “Review the lender’s applicable terms, charges and Key Fact Statement (where applicable) before accepting a loan.”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
