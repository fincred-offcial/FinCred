import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  MessageSquare,
  ArrowRight,
  User
} from 'lucide-react';
import { useMobileAuth } from '../context/MobileAuthContext.js';
import { sendOtp, verifyOtp, checkMobileRegistration, logUserActivity } from '../../services/api.js';

interface MobileAuthScreenProps {
  onSuccess: () => void;
}

export const MobileAuthScreen: React.FC<MobileAuthScreenProps> = ({ onSuccess }) => {
  const { loginWithOtpSession } = useMobileAuth();

  // State
  const [mobileNumber, setMobileNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegisteredNumber, setIsRegisteredNumber] = useState<boolean | null>(null);
  const [isCheckingMobile, setIsCheckingMobile] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [activeOtpCode, setActiveOtpCode] = useState<string | null>(null);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [otpCopied, setOtpCopied] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // Clean Mobile Input
  const handleMobileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(val);
    setErrorMessage('');

    if (val.length === 10) {
      setIsCheckingMobile(true);
      try {
        const check = await checkMobileRegistration(val);
        setIsRegisteredNumber(check.isRegistered);
        if (check.customerName) {
          setFullName(check.customerName);
        }
      } catch {
        setIsRegisteredNumber(null);
      } finally {
        setIsCheckingMobile(false);
      }
    } else {
      setIsRegisteredNumber(null);
    }
  };

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const clean = mobileNumber.trim();
    if (!/^[6-9]\d{9}$/.test(clean)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number starting with 6-9.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await sendOtp(clean);
      setOtpSent(true);
      setTimer(45);
      setCanResend(false);
      setOtpValues(['', '', '', '', '', '']);

      const receivedOtp = res.testOtp || '123456';
      setActiveOtpCode(receivedOtp);

      if (res.isRegistered !== undefined) {
        setIsRegisteredNumber(res.isRegistered);
        if (res.customerName) {
          setFullName(res.customerName);
        }
      }

      logUserActivity({
        activityType: 'auth_attempt',
        description: 'Customer requested OTP in mobile app',
        userMobile: clean,
        metadata: { mobile: clean }
      });

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send OTP. Please check connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Inputs
  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(-1);
    const newValues = [...otpValues];
    newValues[index] = cleanValue;
    setOtpValues(newValues);
    setErrorMessage('');

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newValues = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newValues[i] = pasted[i];
    }
    setOtpValues(newValues);
    setErrorMessage('');

    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  // Handle Verify OTP & Unlock App
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');

    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await verifyOtp(mobileNumber.trim(), fullOtp, fullName.trim() || 'App User');
      if (res.success && res.customer && res.token) {
        // Save session in mobile app context
        loginWithOtpSession(res.customer, res.token);

        logUserActivity({
          activityType: 'auth_success',
          description: 'Customer logged in to Mobile App via OTP',
          customerId: res.customer.customerId,
          userMobile: mobileNumber.trim(),
          userName: res.customer.fullName,
          metadata: { mobile: mobileNumber.trim(), platform: 'mobile_app' }
        });

        // Trigger success callback to show main app interface
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid verification code. Please check and re-enter.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top App Header */}
      <div className="pt-6 text-center space-y-2 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-cyan-500/20 mb-1">
          <div className="w-full h-full bg-[#0A0F1D] rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit',sans-serif]">
            Fin<span className="text-cyan-400">Cred</span> Mobile
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Fast Digital Loan Assistance • 250+ NBFC & Bank Partners
          </p>
        </div>
      </div>

      {/* Main Auth Card Container */}
      <div className="my-auto w-full max-w-sm mx-auto bg-[#0B1120]/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl relative z-10 space-y-4">
        
        {!otpSent ? (
          /* Step 1: Mobile Number & Name (OTP Login / Sign-up) */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Quick OTP Login / Sign Up
              </span>
              <h2 className="text-lg font-black text-white font-['Outfit',sans-serif]">
                Enter Your Mobile Number
              </h2>
              <p className="text-[11px] text-slate-400 leading-snug">
                We will send an instant 6-digit verification code to access your loan account.
              </p>
            </div>

            {/* Mobile Input with Flag */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Mobile Number</span>
                {isRegisteredNumber === true && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Existing Customer
                  </span>
                )}
              </label>

              <div className="relative flex items-center rounded-2xl bg-slate-900 border border-slate-700/80 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all overflow-hidden">
                <div className="flex items-center gap-1 pl-3 pr-2.5 py-3 bg-slate-800/80 border-r border-slate-700 text-xs font-bold font-mono text-slate-200">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                  autoFocus
                  className="w-full px-3.5 py-3 text-sm font-semibold font-mono text-white placeholder:text-slate-500 bg-transparent outline-none"
                />

                <div className="pr-3 flex items-center pointer-events-none">
                  {isCheckingMobile ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : mobileNumber.length === 10 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Full Name field if new user or optional */}
            {isRegisteredNumber === false && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-slate-300">Your Full Name</label>
                <div className="relative flex items-center rounded-2xl bg-slate-900 border border-slate-700/80 focus-within:border-cyan-400 px-3 py-2.5">
                  <User className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full text-sm font-medium text-white placeholder:text-slate-500 bg-transparent outline-none"
                  />
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-xs font-medium text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || mobileNumber.length !== 10}
              className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mobileNumber.length === 10 && !isLoading
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:brightness-110 shadow-cyan-500/25 active:scale-[0.99]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Continue →</span>
                </>
              )}
            </button>

            {/* Security Guarantee */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 text-center pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>100% Encrypted & Confidential Verification</span>
            </div>
          </form>
        ) : (
          /* Step 2: 6-Digit OTP Verification Screen */
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
            {/* Header with Change Number Option */}
            <div className="p-3 rounded-2xl bg-blue-950/50 border border-blue-800/60 text-xs text-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 block">OTP Sent To</span>
                <p className="font-mono font-bold text-white">+91 {mobileNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setActiveOtpCode(null);
                  setErrorMessage('');
                }}
                className="text-[11px] font-bold text-cyan-400 hover:underline px-2.5 py-1 rounded-lg bg-blue-900/40 hover:bg-blue-900/60 transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* IN-SCREEN LIVE OTP DISPLAY */}
            {activeOtpCode && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/60 text-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-200">FinCred Security SMS</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase tracking-wider">Just Now</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1 leading-snug">
                        Your verification OTP is <strong className="text-amber-400 font-mono text-base font-black tracking-widest px-2 py-0.5 bg-black/60 rounded-lg border border-amber-400/40 shadow-xs inline-block ml-1">{activeOtpCode}</strong>
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">Enter this 6-digit code below</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeOtpCode) {
                        navigator.clipboard.writeText(activeOtpCode);
                        setOtpCopied(true);
                        setTimeout(() => setOtpCopied(false), 2000);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold text-cyan-300 hover:text-white transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs active:scale-95"
                  >
                    {otpCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 6 Digit Inputs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Enter 6-Digit OTP</span>
              </label>

              <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handlePasteOtp}>
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    ref={el => {
                      inputRefs.current[idx] = el;
                    }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    className="w-10 h-12 sm:w-11 sm:h-13 text-center text-xl font-bold font-mono rounded-xl bg-slate-900 border border-slate-700 focus:bg-slate-950 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all text-white"
                  />
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-xs font-medium text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || otpValues.join('').length !== 6}
              className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                otpValues.join('').length === 6 && !isLoading
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:brightness-110 shadow-cyan-500/25 active:scale-[0.99]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Verifying & Opening App...</span>
                </>
              ) : (
                <>
                  <span>Verify & Open App →</span>
                </>
              )}
            </button>

            {/* Resend Timer */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <span className="text-slate-400">Didn't receive code?</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend OTP</span>
                </button>
              ) : (
                <span className="font-mono text-slate-400">
                  Resend in <span className="font-bold text-slate-200">{timer}s</span>
                </span>
              )}
            </div>
          </form>
        )}

      </div>

      {/* Footer Info */}
      <div className="pb-4 text-center text-[10px] text-slate-500 relative z-10 space-y-1">
        <p>FinCred India • Official App Security Standard</p>
        <p>By continuing you agree to Terms & Privacy Policy</p>
      </div>
    </div>
  );
};
