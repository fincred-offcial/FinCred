import React, { useState, useEffect } from 'react';
import { Download, X, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.js';

interface TopDownloadBannerProps {
  onOpenModal?: () => void;
}

export const TopDownloadBanner: React.FC<TopDownloadBannerProps> = ({ onOpenModal }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('fincred_top_banner_dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('fincred_top_banner_dismissed', 'true');
  };

  const handleDownload = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setDownloadSuccess(true);
        setTimeout(() => {
          setIsDismissed(true);
        }, 1500);
        return;
      }
    }

    if (onOpenModal) {
      onOpenModal();
    }
  };

  // Do not show if dismissed or already running inside installed standalone app
  if (isDismissed || isInstalled) {
    return null;
  }

  return (
    <aside aria-label="FinCred App Download" className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-blue-200/90 shadow-xl shadow-blue-500/10 text-slate-800">
        {/* Left: App Icon & Text */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 tracking-tight">FinCred App</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-full">
                Official
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              Fast & Secure Access
            </p>
          </div>
        </div>

        {/* Right Actions: Download Button & Cut ('X') Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {downloadSuccess ? (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Installed!</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDownload}
              id="top-banner-download-btn"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>FinCred App Download</span>
            </button>
          )}

          {/* Prominent Cut / Close ('X') button directly in front */}
          <button
            type="button"
            onClick={handleDismiss}
            id="top-banner-cut-btn"
            title="Cut / Close"
            aria-label="Cut / Close banner"
            className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 shrink-0"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </aside>
  );
};
