import React from 'react';
import { FileEdit, CheckCircle, Search, Landmark, ArrowRight } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Submit Your Details',
      desc: 'Provide the basic information required to explore loan options.',
      icon: FileEdit,
      iconColor: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      num: '02',
      title: 'Eligibility Review',
      desc: 'Your information is assessed against applicable lender criteria.',
      icon: CheckCircle,
      iconColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      num: '03',
      title: 'Explore Available Options',
      desc: 'Review the loan options available to you.',
      icon: Search,
      iconColor: 'bg-sky-50 text-sky-600 border-sky-200',
    },
    {
      num: '04',
      title: 'Lender Decision',
      desc: 'The respective lender makes the final decision regarding approval and loan terms.',
      icon: Landmark,
      iconColor: 'bg-slate-100 text-slate-800 border-slate-200',
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-slate-50 border-y border-slate-200/90" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            Four-Step Journey
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
            How FinCred Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            A clear, transparent process designed to assist your loan exploration from start to finish.
          </p>
        </div>

        {/* 4-Step Timeline with connecting visuals */}
        <div className="relative">
          {/* Desktop Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-slate-300 -translate-y-6 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${step.iconColor}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-slate-300 font-mono">
                        {step.num}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                      Step {step.num}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit',sans-serif] mt-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Phase {idx + 1}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            FinCred facilitates your initial enquiry and eligibility match; final sanction, rate determination, and agreement signing happen directly with the authorized lending partner.
          </p>
        </div>
      </div>
    </section>
  );
};
