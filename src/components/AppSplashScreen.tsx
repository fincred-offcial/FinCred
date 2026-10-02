import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Sparkles } from 'lucide-react';

interface AppSplashScreenProps {
  onFinish?: () => void;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing secure environment...');

  useEffect(() => {
    // Check if splash was already shown in this session (unless running standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    const alreadyShown = sessionStorage.getItem('fincred_splash_completed');
    if (alreadyShown && !isStandalone) {
      setIsVisible(false);
      return;
    }

    // Step 1: Progress simulation
    const t1 = setTimeout(() => {
      setProgress(45);
      setStatusText('Loading loan systems & calculators...');
    }, 450);

    const t2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Verifying secure connection...');
    }, 950);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('FinCred System Ready');
    }, 1400);

    const t4 = setTimeout(() => {
      setIsFading(true);
    }, 1750);

    const t5 = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('fincred_splash_completed', 'true');
      if (onFinish) onFinish();
    }, 2250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-slate-950 text-white px-6 py-12 select-none transition-opacity duration-500 ease-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top spacer / micro badge */}
      <div className="relative z-10 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-slate-300 tracking-wider uppercase backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Digital Financial Portal</span>
        </div>
      </div>

      {/* Centered Brand Emblem */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-5 my-auto">
        {/* Glowing Shield Logo */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-md opacity-60 animate-pulse" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 p-[2px] shadow-2xl flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-['Outfit',sans-serif]">
            Fin<span className="text-blue-500">Cred</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide">
            Instant Loan Assistance & Secure Referral Platform
          </p>
        </div>

        {/* Premium Progress Bar */}
        <div className="w-56 sm:w-64 space-y-2 pt-2">
          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-[1px] border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(59,130,246,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide animate-pulse h-4">
            {statusText}
          </p>
        </div>
      </div>

      {/* Footer Security Badge */}
      <div className="relative z-10 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
        <Lock className="w-3.5 h-3.5 text-emerald-400" />
        <span>Safe • Secure • 100% Digital System</span>
      </div>
    </div>
  );
};
