import React, { useState } from 'react';
import { Briefcase, UserCheck, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, ShieldCheck, HelpCircle } from 'lucide-react';
import { LoanCategory } from '../types.js';

interface LoanFinderSectionProps {
  onProceedToApplication: (category: LoanCategory) => void;
}

export const LoanFinderSection: React.FC<LoanFinderSectionProps> = ({ onProceedToApplication }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Form selections
  const [loanType, setLoanType] = useState<'Personal Loan' | 'Personal Loan (PL)' | 'Business Loan' | 'Other Loan Options'>('Personal Loan');
  const [amountRange, setAmountRange] = useState('₹1,00,000 - ₹3,00,000');
  const [incomeRange, setIncomeRange] = useState('₹25,000 - ₹50,000 / month');
  const [employmentType, setEmploymentType] = useState('Salaried Professional');
  const [cityPincode, setCityPincode] = useState('');
  const [tenurePreference, setTenurePreference] = useState('24 Months');

  const [isCompleted, setIsCompleted] = useState(false);

  const amountPresets = [
    'Up to ₹50,000',
    '₹50,000 - ₹1,00,000',
    '₹1,00,000 - ₹3,00,000',
    '₹3,00,000 - ₹5,00,000',
    '₹5,00,000 - ₹10,00,000',
    '₹10,00,000+',
  ];

  const incomePresets = [
    'Below ₹25,000 / month',
    '₹25,000 - ₹50,000 / month',
    '₹50,000 - ₹1,00,000 / month',
    'Above ₹1,00,000 / month',
  ];

  const employmentPresets = [
    'Salaried Professional',
    'Self-Employed Professional (Doctor, CA, etc.)',
    'Registered Business Owner / MSME',
    'Other / Freelancer',
  ];

  const tenurePresets = [
    '12 Months',
    '24 Months',
    '36 Months',
    '48 Months+',
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getMatchedCategory = (): LoanCategory => {
    if (loanType === 'Other Loan Options') {
      return 'All Type Loan';
    }
    if (loanType === 'Personal Loan (PL)') {
      return 'Personal Loan (PL)';
    }
    return 'Personal Loan';
  };

  return (
    <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200" id="loan-finder">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Interactive Matcher</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
            Find a Loan Option
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Tell us what you are looking for.
          </p>
        </div>

        {/* Premium Multi-Step Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
          {!isCompleted ? (
            <>
              {/* Step indicator header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Step {currentStep} of 5
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                    {currentStep === 1 && 'Select Loan Type'}
                    {currentStep === 2 && 'Required Loan Amount'}
                    {currentStep === 3 && 'Monthly Income / Business Income'}
                    {currentStep === 4 && 'Employment / Business Type'}
                    {currentStep === 5 && 'Basic Eligibility Details'}
                  </h3>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(step => (
                    <div
                      key={step}
                      className={`h-2 rounded-full transition-all ${
                        step === currentStep
                          ? 'w-7 bg-blue-600'
                          : step < currentStep
                          ? 'w-3 bg-blue-200'
                          : 'w-3 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Step 1: Loan Type */}
              {currentStep === 1 && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-slate-500">
                    Which loan category best matches your current requirement?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(['Personal Loan', 'Personal Loan (PL)', 'Business Loan', 'Other Loan Options'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setLoanType(type)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          loanType === type
                            ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20 font-bold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold font-['Outfit',sans-serif]">{type}</span>
                          {loanType === type && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal">
                          {type === 'Personal Loan' && 'Instant digital application via Choice Connect network.'}
                          {type === 'Personal Loan (PL)' && 'Referral up to ₹15 Lakhs via WeRize NBFC partner.'}
                          {type === 'Business Loan' && 'Commercial capital, inventory, or MSME expansion.'}
                          {type === 'Other Loan Options' && 'Home, property, gold, vehicle, or multi-purpose loans.'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Required Loan Amount */}
              {currentStep === 2 && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-slate-500">
                    Select an estimated financing requirement you would like to explore.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {amountPresets.map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmountRange(preset)}
                        className={`p-3.5 rounded-xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                          amountRange === preset
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    *Final sanctioned amount is evaluated and determined solely by the respective lender.
                  </p>
                </div>
              )}

              {/* Step 3: Monthly Income / Business Income */}
              {currentStep === 3 && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-slate-500">
                    Approximate net monthly income or business cash flow.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {incomePresets.map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setIncomeRange(preset)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                          incomeRange === preset
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{preset}</span>
                        {incomeRange === preset && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Employment / Business Type */}
              {currentStep === 4 && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-slate-500">
                    What is your primary source of occupational profile?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {employmentPresets.map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setEmploymentType(preset)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                          employmentType === preset
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{preset}</span>
                        {employmentType === preset && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Basic Eligibility Details */}
              {currentStep === 5 && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-slate-500">
                    Preferred tenure and city / postal area to assist suitable lender matching.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Preferred Repayment Tenure*
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {tenurePresets.map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTenurePreference(t)}
                            className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                              tenurePreference === t
                                ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        City / Pincode (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai / 400001"
                        value={cityPincode}
                        onChange={e => setCityPincode(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  id="loan-finder-next-btn"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer transition-all"
                >
                  <span>{currentStep === 5 ? 'Check Available Options' : 'Next Step'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            /* Result State - Non-guaranteed, transparent disclosure mandated by prompt */
            <div className="text-center py-6 space-y-5 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                  Options Ready to Explore
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  “We’ll help you explore available options based on the information provided. Final eligibility and approval are subject to lender criteria.”
                </p>
              </div>

              {/* Summary of selections */}
              <div className="max-w-lg mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-left text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Product</span>
                  <span className="font-semibold text-slate-800">{loanType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Requirement</span>
                  <span className="font-semibold text-slate-800">{amountRange}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Income</span>
                  <span className="font-semibold text-slate-800">{incomeRange}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onProceedToApplication(getMatchedCategory())}
                  id="proceed-with-options-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer transition-all"
                >
                  <span>Proceed to Apply Online</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCompleted(false);
                    setCurrentStep(1);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Modify Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
