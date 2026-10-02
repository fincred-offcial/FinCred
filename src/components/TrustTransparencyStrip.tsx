import React from 'react';
import { Lock, FileText, Zap, Landmark } from 'lucide-react';

export const TrustTransparencyStrip: React.FC = () => {
  const items = [
    {
      icon: Lock,
      title: 'Secure Process',
      description: 'Simple digital application experience',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      icon: FileText,
      title: 'Transparent Information',
      description: 'Understand the process before proceeding',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      icon: Zap,
      title: 'Easy Application',
      description: 'Submit details through a simple flow',
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      icon: Landmark,
      title: 'Lender-Based Decision',
      description: 'Final decision is made by the respective lender',
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ];

  return (
    <section className="relative z-20 -mt-6 sm:-mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/50 p-3 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3.5 p-2 sm:p-3 ${idx > 0 ? 'pt-3 sm:pt-2' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
