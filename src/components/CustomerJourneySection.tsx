import React from 'react';
import { HelpCircle, Grid, FileEdit, CheckCircle2, FileSearch, Send, ShieldCheck, Landmark } from 'lucide-react';

export const CustomerJourneySection: React.FC = () => {
  const steps = [
    { num: '1', title: 'You Need a Loan', icon: HelpCircle },
    { num: '2', title: 'Choose Loan Type', icon: Grid },
    { num: '3', title: 'Enter Basic Details', icon: FileEdit },
    { num: '4', title: 'Check Available Options', icon: CheckCircle2 },
    { num: '5', title: 'Review Lender Terms', icon: FileSearch },
    { num: '6', title: 'Apply / Proceed', icon: Send },
    { num: '7', title: 'Lender Assessment', icon: ShieldCheck },
    { num: '8', title: 'Final Decision', icon: Landmark },
  ];

  return (
    <section className="py-12 sm:py-20 bg-white text-slate-900 border-b border-slate-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            End-To-End Path
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
            Your Loan Exploration Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            A step-by-step roadmap from initial need to lender evaluation.
          </p>
        </div>

        {/* 8 Step Flowchart Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200 text-center flex flex-col items-center justify-between space-y-3 relative group hover:border-blue-400 hover:bg-white transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-mono font-bold text-xs">
                  {step.num}
                </div>

                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:text-blue-600 transition-all">
                  <Icon className="w-5 h-5" />
                </div>

                <h4 className="text-xs font-bold text-slate-800 font-['Outfit',sans-serif] leading-tight">
                  {step.title}
                </h4>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>
            FinCred simplifies steps 1 through 4 digitally, ensuring seamless redirection into official lender assessment for steps 5 through 8.
          </p>
        </div>
      </div>
    </section>
  );
};
