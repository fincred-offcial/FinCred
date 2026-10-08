import React, { useState } from 'react';
import { Download, X, CheckCircle2, ShieldCheck, Share, Sparkles, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.js';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installed, setInstalled] = useState(false);

  if (!isOpen) return null;

  const handleDownloadClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstalled(true);
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          id="modal-cut-close-btn"
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
          title="Close"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 text-white">
          <div className="flex items-center gap-3 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-white/15 p-2 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                Official FinCred App
              </span>
              <h2 id="download-modal-title" className="text-base font-black tracking-tight text-white leading-tight">
                FinCred App Download
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-center">
          {installed ? (
            <div className="py-4 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">App Downloaded & Installed!</h3>
              <p className="text-xs text-slate-600">
                FinCred app aapke phone par add ho chuka hai.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600 leading-relaxed">
                FinCred mobile app ko apne phone par download & install karein:
              </p>

              {/* Single Simple Direct Download Button */}
              <button
                type="button"
                onClick={handleDownloadClick}
                id="modal-simple-download-btn"
                className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300 stroke-[2.5]" />
                <span>Download App Now</span>
              </button>

              {/* Device specific simple guide */}
              {isIOS ? (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1 text-slate-900">
                    <Share className="w-3.5 h-3.5 text-blue-600" />
                    <span>iPhone / iPad Installation:</span>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Safari me neeche <strong>Share (⎋)</strong> button par tap karein, phir <strong>&quot;Add to Home Screen&quot;</strong> chunein.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-left text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-blue-950">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Android / Browser Installation:</span>
                  </p>
                  <p className="text-[11px] text-blue-900 leading-snug">
                    Upar diye gaye <strong>Download App Now</strong> button par click karein. Agar prompt na dikhe, to browser ke <strong>3 dots (⋮)</strong> par click karke <strong>&quot;Install app&quot;</strong> ya <strong>&quot;Add to Home screen&quot;</strong> chunein.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-1.5 text-center text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
