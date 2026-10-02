import React from 'react';
import { Sliders, Monitor, Info, Layers, HeartHandshake, Landmark } from 'lucide-react';

export const WhyFinCredSection: React.FC = () => {
  const reasons = [
    {
      num: '01',
      title: 'Simple Process',
      desc: 'Designed to make exploring loan options easier.',
      icon: Sliders,
    },
    {
      num: '02',
      title: 'Digital Experience',
      desc: 'Complete the initial process online.',
      icon: Monitor,
    },
    {
      num: '03',
      title: 'Transparent Information',
      desc: 'Clear information about the application journey.',
      icon: Info,
    },
    {
      num: '04',
      title: 'Multiple Options',
      desc: 'Explore available loan options based on eligibility.',
      icon: Layers,
    },
    {
      num: '05',
      title: 'Customer Focused',
      desc: 'Simple and easy-to-understand interface.',
      icon: HeartHandshake,
    },
    {
      num: '06',
      title: 'Lender-Based Decisions',
      desc: 'Loan decisions remain with the respective lender.',
      icon: Landmark,
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            Value & Transparency
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
            Why Choose FinCred?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            A customer-centric platform built on clarity, independent referral, and respect for user time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl sm:rounded-3xl bg-slate-50/70 border border-slate-200/90 hover:border-blue-300 hover:bg-white hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    {item.num}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
