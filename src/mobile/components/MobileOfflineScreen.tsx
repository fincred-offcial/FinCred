import React, { useState } from 'react';
import { WifiOff, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';

interface MobileOfflineScreenProps {
  onRetry: () => Promise<boolean> | boolean;
}

export const MobileOfflineScreen: React.FC<MobileOfflineScreenProps> = ({ onRetry }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    setErrorMsg(null);

    try {
      // First verify navigator.onLine
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Device is offline');
      }

      // Try pinging health endpoint with a short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);

      const isConnected = res ? res.ok : (typeof navigator !== 'undefined' ? navigator.onLine : false);

      if (isConnected) {
        const handled = await onRetry();
        if (!handled) {
          setErrorMsg('Network reachable, resuming application...');
        }
      } else {
        throw new Error('Server unreachable');
      }
    } catch {
      setErrorMsg('Still offline. Please check your Mobile Data or Wi-Fi settings.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070B14] text-slate-100 flex flex-col items-center justify-between p-6 select-none overflow-y-auto">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-red-600/10 blur-[90px]" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-600/10 blur-[80px]" />
      </div>

      {/* Top Header */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-slate-500 pt-2 z-10">
        <div className="flex items-center gap-1.5 text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-semibold tracking-wider">OFFLINE MODE DETECTED</span>
        </div>
        <span className="text-slate-500">FINCRED APP</span>
      </div>

      {/* Center Content */}
      <div className="w-full max-w-sm flex flex-col items-center my-auto py-8 z-10">
        {/* Animated Offline Icon */}
        <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-b from-rose-500/20 to-rose-900/30 border border-rose-500/30 flex items-center justify-center mb-6 shadow-xl shadow-rose-950/40">
          <div className="absolute -inset-1 rounded-3xl bg-rose-500/10 blur-md animate-pulse" />
          <WifiOff className="w-12 h-12 text-rose-400" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white tracking-tight text-center font-['Outfit',sans-serif] mb-1">
          No Internet Connection
        </h2>
        <p className="text-xs text-rose-300 font-semibold mb-4 text-center">
          इंटरनेट या मोबाइल डेटा बंद है
        </p>

        {/* Informative explanation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center mb-6 shadow-inner w-full space-y-2">
          <p className="text-xs text-slate-300 leading-relaxed">
            FinCred is a live digital loan assistance platform. An active <strong className="text-white">Mobile Data</strong> or <strong className="text-white">Wi-Fi</strong> connection is required to check RBI-registered NBFC lender rates, verify eligibility, and submit applications.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-amber-400/90 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>App cannot process requests without internet.</span>
          </div>
        </div>

        {/* Error message if retry failed */}
        {errorMsg && (
          <div className="w-full mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-200 text-center flex items-center justify-center gap-2 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Retry Button */}
        <button
          type="button"
          onClick={handleCheckConnection}
          disabled={isChecking}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Checking Connection...' : 'Retry Connection / पुनः प्रयास करें'}</span>
        </button>
      </div>

      {/* Footer tips */}
      <div className="w-full max-w-sm text-center text-[11px] text-slate-500 z-10 pb-4 space-y-1">
        <p>Tip: Check if Airplane Mode is turned off and Mobile Data is enabled.</p>
        <p className="text-[10px] text-slate-600 font-mono">FinCred Digital Lending Assistance</p>
      </div>
    </div>
  );
};
