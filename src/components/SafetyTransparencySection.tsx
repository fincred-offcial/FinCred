import React from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, Lock } from 'lucide-react';

export const SafetyTransparencySection: React.FC = () => {
  const safetyPoints = [
    'Check the lender and loan terms carefully.',
    'Review applicable interest rate/APR and charges.',
    'Understand your repayment obligation.',
    'Never share OTPs, passwords or PINs with anyone.',
    'Make sure the information submitted is accurate.',
    'Read the lender’s terms before accepting an offer.',
  ];

  return (
    <section className="py-12 sm:py-20 bg-white text-slate-900 border-b border-slate-200/90" id="safety">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Consumer Safety & Advisory</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit',sans-serif]">
                Before You Apply
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl">
                Maintain vigilance and follow sound digital financial hygiene throughout your borrowing experience.
              </p>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {safetyPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs sm:text-sm text-slate-200"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            {/* Prominent advisory box mandated by Section 17 */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-start gap-3.5 text-amber-200">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-amber-300 font-['Outfit',sans-serif]">
                  Fraud Prevention Warning
                </h4>
                <p className="text-xs sm:text-sm text-amber-100 font-semibold leading-relaxed">
                  “Never pay anyone promising guaranteed loan approval.”
                </p>
                <p className="text-[11px] text-amber-200/80">
                  FinCred does not charge upfront cash, security deposits, or file approval fees. Any agent soliciting advance payments is fraudulent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
