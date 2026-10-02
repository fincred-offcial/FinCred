import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface MobileSplashProps {
  onComplete: () => void;
  durationMs?: number;
}

export const MobileSplash: React.FC<MobileSplashProps> = ({ onComplete, durationMs = 2600 }) => {
  const [phase, setPhase] = useState<'glow' | 'reveal' | 'finance-pulse' | 'fade-out'>('glow');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Phase transitions
    const t1 = setTimeout(() => setPhase('reveal'), 400);
    const t2 = setTimeout(() => setPhase('finance-pulse'), 1200);
    const t3 = setTimeout(() => setPhase('fade-out'), durationMs - 400);
    const tEnd = setTimeout(() => onComplete(), durationMs);

    // Progress bar ticker
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2.5;
      });
    }, durationMs / 45);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tEnd);
      clearInterval(interval);
    };
  }, [durationMs, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#070B14] select-none transition-opacity duration-400 ease-out overflow-hidden ${
        phase === 'fade-out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial gradient & ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-blue-600/15 blur-[90px] animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full bg-cyan-400/10 blur-[60px]" />
        
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04]" 
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Top minimal status bar accent */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 z-10">
        <span className="flex items-center gap-1.5 text-blue-400/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          SECURE CONNECT
        </span>
        <span>v2.4 MOBILE</span>
      </div>

      {/* Centerpiece: FINCRED Logo with Finance/Credit themed animation */}
      <div className="relative flex flex-col items-center justify-center my-auto z-10">
        {/* Animated Circular Finance Progress Ring & Orbiting Particles */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-6">
          {/* Subtle Outer Rotating Ring */}
          <div className="absolute inset-0 rounded-full border border-blue-500/20 border-dashed animate-spin [animation-duration:14s]" />
          
          {/* Center Smooth Circular Progress SVG */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#1e293b"
              strokeWidth="2.5"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="url(#fincred-splash-grad)"
              strokeWidth="3.5"
              fill="transparent"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-75 ease-out"
            />
            <defs>
              <linearGradient id="fincred-splash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Shield / Crest Icon */}
          <div className="absolute inset-0 m-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
            <ShieldCheck className="w-9 h-9 text-white drop-shadow-md" />
          </div>

          {/* Orbiting micro financial nodes */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />
        </div>

        {/* FINCRED Wordmark: Smooth fade & scale */}
        <div 
          className={`text-center transition-all duration-700 ease-out transform ${
            phase === 'glow' 
              ? 'opacity-0 scale-90 translate-y-3' 
              : 'opacity-100 scale-100 translate-y-0'
          }`}
        >
          <div className="relative inline-block">
            <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-200 font-['Outfit',sans-serif]">
              FINCRED
            </h1>
            <span className="absolute -top-1 -right-4 text-cyan-400 text-xs">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </span>
          </div>

          <p className="mt-2 text-xs text-blue-200/80 font-medium tracking-wide">
            Your trusted loan assistance platform
          </p>
        </div>

        {/* Dynamic Credit Line Beam Indicator */}
        <div className="mt-8 w-44 h-1 rounded-full bg-slate-800/80 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-100 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer Trust & Security Badges */}
      <div className="w-full text-center z-10 pb-4">
        <p className="text-[11px] text-slate-400/80 font-medium">
          RBI-Registered NBFC Partners • Safe & Secure
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">
          Standalone Secure Mobile Architecture
        </p>
      </div>
    </div>
  );
};
