import React, { useEffect, useState } from 'react';
import { MessageSquare, X, ShieldCheck, Copy, Check } from 'lucide-react';

interface SmsNotificationBannerProps {
  otp: string;
  mobileNumber: string;
  onClose?: () => void;
}

export const SmsNotificationBanner: React.FC<SmsNotificationBannerProps> = ({
  otp,
  mobileNumber,
  onClose
}) => {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!otp) return;

    // Slide down smoothly after dispatch
    const enterTimer = setTimeout(() => setVisible(true), 100);

    return () => {
      clearTimeout(enterTimer);
    };
  }, [otp]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const handleCopy = () => {
    if (otp) {
      navigator.clipboard.writeText(otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!otp || !visible) return null;

  return (
    <div className="fixed top-20 sm:top-24 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none animate-in slide-in-from-top-4 duration-300">
      <div className="pointer-events-auto w-full max-w-md bg-slate-900/98 backdrop-blur-xl text-white rounded-2xl shadow-2xl border-2 border-blue-500/50 p-3.5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
          <MessageSquare className="w-4 h-4 text-blue-400" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-300">FinCred Security SMS</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">now</span>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-200 leading-snug">
            Your verification OTP is <strong className="text-amber-400 font-mono text-sm tracking-wider font-bold">{otp}</strong>. Enter this code to proceed.
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400 font-mono">
              Sent to +91 {mobileNumber}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
