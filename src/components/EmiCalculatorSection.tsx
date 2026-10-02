import React, { useState, useId } from 'react';
import { Calculator, IndianRupee, RefreshCw, AlertCircle } from 'lucide-react';

export const EmiCalculatorSection: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [interestRate, setInterestRate] = useState<number>(12.5);
  const [tenureYears, setTenureYears] = useState<number>(3);
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');

  const amountInputId = useId();
  const rateInputId = useId();
  const tenureInputId = useId();

  // Calculate total months
  const totalMonths = tenureType === 'years' ? tenureYears * 12 : tenureYears;

  // Monthly interest rate
  const monthlyRate = interestRate / 12 / 100;

  // Standard EMI Formula: [P x R x (1+R)^N] / [(1+R)^N - 1]
  const emi =
    monthlyRate > 0 && totalMonths > 0
      ? Math.round(
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
      : Math.round(loanAmount / (totalMonths || 1));

  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment > loanAmount ? totalPayment - loanAmount : 0;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section className="py-12 sm:py-20 bg-slate-50 border-b border-slate-200/90" id="calculator">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            Estimation Tool
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
            Loan EMI Calculator
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Compute your prospective monthly installment and repayment breakdown in seconds.
          </p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Interactive Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Loan Amount Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor={amountInputId} className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Loan Amount
                  </label>
                  <span className="text-sm sm:text-base font-extrabold text-blue-600 font-mono">
                    ₹ {formatINR(loanAmount)}
                  </span>
                </div>
                <input
                  id={amountInputId}
                  type="range"
                  min={25000}
                  max={2500000}
                  step={25000}
                  value={loanAmount}
                  onChange={e => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>₹25k</span>
                  <span>₹10 Lakh</span>
                  <span>₹25 Lakh</span>
                </div>
              </div>

              {/* Interest Rate Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor={rateInputId} className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Indicative Interest Rate (p.a.)
                  </label>
                  <span className="text-sm sm:text-base font-extrabold text-blue-600 font-mono">
                    {interestRate}%
                  </span>
                </div>
                <input
                  id={rateInputId}
                  type="range"
                  min={8}
                  max={36}
                  step={0.5}
                  value={interestRate}
                  onChange={e => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>8% (Secured / Prime)</span>
                  <span>20%</span>
                  <span>36% (Unsecured cap)</span>
                </div>
              </div>

              {/* Tenure Input & Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor={tenureInputId} className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Repayment Tenure
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-extrabold text-blue-600 font-mono">
                      {tenureYears} {tenureType === 'years' ? 'Years' : 'Months'}
                    </span>
                    <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          setTenureType('years');
                          if (tenureYears > 7) setTenureYears(3);
                        }}
                        className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                          tenureType === 'years'
                            ? 'bg-white text-blue-700 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Yr
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTenureType('months');
                          setTenureYears(prev => (prev < 12 ? prev * 12 : 36));
                        }}
                        className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                          tenureType === 'months'
                            ? 'bg-white text-blue-700 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Mo
                      </button>
                    </div>
                  </div>
                </div>
                <input
                  id={tenureInputId}
                  type="range"
                  min={tenureType === 'years' ? 1 : 6}
                  max={tenureType === 'years' ? 7 : 84}
                  step={1}
                  value={tenureYears}
                  onChange={e => setTenureYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>{tenureType === 'years' ? '1 Year' : '6 Months'}</span>
                  <span>{tenureType === 'years' ? '4 Years' : '48 Months'}</span>
                  <span>{tenureType === 'years' ? '7 Years' : '84 Months'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Output Summary Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg space-y-5">
              <div className="text-center pb-4 border-b border-slate-800">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                  Estimated Monthly EMI
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1 font-['Outfit',sans-serif] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-white">
                  ₹ {formatINR(emi)}
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  for {totalMonths} monthly installments
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Principal Loan Amount</span>
                  <span className="font-mono font-bold text-slate-200">
                    ₹ {formatINR(loanAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Estimated Total Interest</span>
                  <span className="font-mono font-bold text-amber-400">
                    ₹ {formatINR(totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 font-semibold">Total Repayment Amount</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₹ {formatINR(totalPayment)}
                  </span>
                </div>
              </div>

              {/* Mandatory Label mandated by Section 14 */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  “Illustrative calculation only. Actual loan terms depend on the lender.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
