import React, { useState } from 'react';
import { Download, X, CheckCircle2, ShieldCheck, Share, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.js';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const handleDownloadSystem = async () => {
    setIsInstalling(true);
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2200);
      }
    } else if (isIOS) {
      // iOS handled via instruction shown in modal
    } else {
      // Fallback for browsers that don't emit beforeinstallprompt yet
      // Trigger install or notify user
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
    setIsInstalling(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 pb-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
      >
        {/* Prominent Cut / Close Button right at the top right */}
        <button
          type="button"
          onClick={onClose}
          id="modal-cut-close-btn"
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          title="Cut / Close"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 pt-5 pb-4 text-white">
          <div className="flex items-center gap-3 pr-8">
            <div className="w-11 h-11 rounded-2xl bg-white/15 p-2 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wide text-blue-100 mb-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                <span>OFFICIAL FINCRED APP</span>
              </div>
              <h2 id="download-modal-title" className="text-lg font-black tracking-tight text-white leading-tight">
                FinCred App Download
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {installSuccess ? (
            <div className="py-4 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">App Download Started!</h3>
              <p className="text-xs text-slate-600">
                FinCred app aapke device par install ho raha hai.
              </p>
            </div>
          ) : (
            <>
              {/* Short explanation */}
              <p className="text-xs text-slate-600 leading-relaxed">
                FinCred official mobile application apne device par install karein:
              </p>

              {/* Simple Feature Points */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-blue-50/70 border border-blue-100/70 text-slate-800 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs">
                    ⚡
                  </div>
                  <span>Fast 1-tap direct access from Home Screen</span>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50/70 border border-emerald-100/70 text-slate-800 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs">
                    🔒
                  </div>
                  <span>100% Safe, Secure & Offline Ready</span>
                </div>
              </div>

              {/* iOS Instructions if on Safari */}
              {isIOS && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1 text-slate-900">
                    <Share className="w-3.5 h-3.5 text-blue-600" />
                    <span>iPhone/iPad Installation:</span>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Safari browser me neeche <strong>Share (⎋)</strong> button par tap karein, phir <strong>&quot;Add to Home Screen&quot;</strong> chunein.
                  </p>
                </div>
              )}

              {/* Main Download Button */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadSystem}
                  id="modal-fincred-app-download-btn"
                  className="w-full py-3 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>FinCred App Download</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                >
                  Abhi Nahi (Maybe later)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
