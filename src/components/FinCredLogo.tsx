import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface FinCredLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  className?: string;
}

export const FinCredLogo: React.FC<FinCredLogoProps> = ({
  size = 'md',
  variant = 'light',
  showSubtitle = true,
  className = ''
}) => {
  const isDark = variant === 'dark';

  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg p-[1.5px]',
    md: 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl p-[2px]',
    lg: 'w-12 h-12 rounded-2xl p-[2.5px]'
  };

  const shieldSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl'
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Premium Red + Golden + Blue Mixed Emblem */}
      <div
        className={`${iconSizes[size]} bg-gradient-to-tr from-red-600 via-amber-500 to-blue-600 shadow-sm shadow-blue-500/20 shrink-0 group-hover:shadow-md transition-all`}
        style={{
          boxShadow: '0 2px 10px rgba(220, 38, 38, 0.15), 0 2px 10px rgba(37, 99, 235, 0.15)'
        }}
      >
        <div
          className={`w-full h-full ${
            isDark ? 'bg-slate-950' : 'bg-white'
          } rounded-[7px] sm:rounded-[9px] flex items-center justify-center relative overflow-hidden`}
        >
          {/* Subtle Golden-Red-Blue Shimmer Accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-blue-500/10 pointer-events-none" />
          <ShieldCheck className={`${shieldSizes[size]} text-blue-600 group-hover:scale-110 transition-transform stroke-[2.2]`} />
        </div>
      </div>

      {/* Brand Name & Tagline */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`${textSizes[size]} font-black tracking-tight font-['Outfit',sans-serif]`}>
            <span className="text-blue-600">Fin</span>
            <span className="text-amber-500">C</span>
            <span className={isDark ? 'text-white' : 'text-slate-900'}>red</span>
          </span>
          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full border border-amber-400/80 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 text-amber-600 font-sans tracking-wider">
            PRO
          </span>
        </div>
        {showSubtitle && (
          <p
            className={`text-[10px] font-semibold tracking-wide mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Loan Made Simple
          </p>
        )}
      </div>
    </div>
  );
};
