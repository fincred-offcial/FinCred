import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  Smartphone,
  Lock,
  Sparkles,
  Check
} from 'lucide-react';
import { sendOtp, verifyOtp, checkMobileRegistration } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface CustomerEntryScreenProps {
  onSuccessExistingUser?: () => void;
  onProceedToRegistration?: (verifiedMobile: string, prefillName?: string) => void;
}

export const CustomerEntryScreen: React.FC<CustomerEntryScreenProps> = ({
  onSuccessExistingUser,
  onProceedToRegistration
}) => {
  const navigate = useNavigate();
  const { setCustomerSession, isCustomerLoggedIn } = useAuth();

  // Mode: Sign Up vs Login
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

  // Step 1: Mobile Input
  const [mobileNumber, setMobileNumber] = useState('');
  const [isCheckingMobile, setIsCheckingMobile] = useState(false);
  const [isRegisteredNumber, setIsRegisteredNumber] = useState<boolean | null>(null);
  const [registeredName, setRegisteredName] = useState<string | null>(null);

  // Step 2: OTP Verification
  const [otpSent, setOtpSent] = useState(false);
  const [activeOtpCode, setActiveOtpCode] = useState<string | null>(null);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);

  // Timers & State
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isCustomerLoggedIn) {
      if (onSuccessExistingUser) {
        onSuccessExistingUser();
      } else {
        navigate('/dashboard');
      }
    }
  }, [isCustomerLoggedIn, navigate, onSuccessExistingUser]);

  // Countdown timer for OTP resend
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

  // Handle mobile change
  const handleMobileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(val);
    setErrorMessage('');

    if (val.length === 10 && /^[6-9]\d{9}$/.test(val)) {
      setIsCheckingMobile(true);
      try {
        const check = await checkMobileRegistration(val);
        setIsRegisteredNumber(check.isRegistered);
        if (check.isRegistered) {
          if (check.customerName) setRegisteredName(check.customerName);
          setAuthMode('login');
        } else {
          setRegisteredName(null);
          setAuthMode('signup');
        }
      } catch {
        setIsRegisteredNumber(null);
      } finally {
        setIsCheckingMobile(false);
      }
    } else {
      setIsRegisteredNumber(null);
      setRegisteredName(null);
    }
  };

  // Dispatch OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await sendOtp(mobileNumber.trim());
      setOtpSent(true);
      setTimer(45);
      setCanResend(false);
      setOtpValues(['', '', '', '', '', '']);
      setSuccessMessage(res.message || `Verification code sent to +91 ${mobileNumber}`);

      if (res.testOtp) {
        setActiveOtpCode(res.testOtp);
      }

      if (res.isRegistered !== undefined) {
        setIsRegisteredNumber(res.isRegistered);
        setRegisteredName(res.customerName || null);
        if (res.isRegistered) {
          setAuthMode('login');
        }
      }

      // Auto focus first OTP digit
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to dispatch OTP. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual OTP input
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

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData.length > 0) {
      const newValues = [...otpValues];
      for (let i = 0; i < pasteData.length; i++) {
        newValues[i] = pasteData[i];
      }
      setOtpValues(newValues);
      const nextIndex = Math.min(pasteData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleAutoFillTestOtp = () => {
    if (activeOtpCode && activeOtpCode.length === 6) {
      setOtpValues(activeOtpCode.split(''));
    }
  };

  // Verify OTP & Route to Portal or Registration Form
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');

    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isRegisteredNumber) {
        // Existing customer: login
        const res = await verifyOtp(mobileNumber.trim(), fullOtp);
        if (res.success && res.customer && res.token) {
          setCustomerSession(res.customer, res.token);
          if (onSuccessExistingUser) {
            onSuccessExistingUser();
          } else {
            navigate('/dashboard?tab=home');
          }
        }
      } else {
        // New customer: mobile verified, proceed to basic profile completion
        const res = await verifyOtp(mobileNumber.trim(), fullOtp, 'New Applicant');
        if (res.success) {
          if (onProceedToRegistration) {
            onProceedToRegistration(mobileNumber.trim(), registeredName || '');
          } else {
            setCustomerSession(res.customer, res.token);
            navigate('/dashboard?tab=home');
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired OTP. Please re-enter or request a fresh OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Clean Premium Mobile-First Welcome Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Top FINCRED Branding */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 p-[1.5px] shadow-sm flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                  Fin<span className="text-blue-600">Cred</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 tracking-wider">
                  INDIA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Your Digital Loan Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Safe & Secure</span>
          </div>
        </div>

        {/* Short Line as specified in Requirement 1 */}
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200/70">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Fast Digital Assistance</span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 font-['Outfit',sans-serif] leading-tight">
            Your Digital Loan Platform
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Enter your mobile number to check loan options and manage your applications.
          </p>
        </div>

        {/* STEP 1: MOBILE NUMBER ONLY */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mobile Number</span>
                </label>
                {isRegisteredNumber === true && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Existing Customer {registeredName ? `(${registeredName.split(' ')[0]})` : ''}
                  </span>
                )}
                {isRegisteredNumber === false && (
                  <span className="text-[10px] font-bold text-blue-600">
                    New Applicant
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="text-xs font-bold font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    +91
                  </span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  autoFocus
                  className="w-full pl-22 pr-10 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  {isCheckingMobile ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : mobileNumber.length === 10 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : null}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Primary button: "Continue" */}
            <button
              type="submit"
              disabled={isLoading || mobileNumber.length !== 10}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mobileNumber.length === 10 && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-[0.99]'
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Secure Gateway...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Small text: New to FINCRED? Sign Up / Already have an account? Login */}
            <div className="text-center pt-1">
              {authMode === 'signup' ? (
                <p className="text-xs text-slate-500">
                  New to FINCRED?{' '}
                  <span className="font-bold text-blue-600">Sign Up</span>
                  {' '}• Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <span className="font-bold text-emerald-600">Login with OTP</span>
                  {' '}• New user?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              )}
            </div>
          </form>
        ) : (
          /* STEP 2: OTP VERIFICATION */
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-blue-800">Verification Code Sent</span>
                <p className="font-mono font-bold text-slate-900">+91 {mobileNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setActiveOtpCode(null);
                  setErrorMessage('');
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Enter 6-Digit OTP</span>
                </label>
                {activeOtpCode && (
                  <button
                    type="button"
                    onClick={handleAutoFillTestOtp}
                    className="text-[10px] text-blue-600 hover:underline font-mono cursor-pointer"
                  >
                    Auto-fill ({activeOtpCode})
                  </button>
                )}
              </div>

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
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900"
                  />
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && !errorMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Verification Button */}
            <button
              type="submit"
              disabled={isLoading || otpValues.join('').length !== 6}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                otpValues.join('').length === 6 && !isLoading
                  ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/25 active:scale-[0.99]'
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify & Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend OTP Timer */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <span className="text-slate-500">Didn't receive code?</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend OTP</span>
                </button>
              ) : (
                <span className="font-mono text-slate-400">
                  Resend in <span className="font-bold text-slate-700">{timer}s</span>
                </span>
              )}
            </div>
          </form>
        )}

        {/* Trust & Security Indicators */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Zero Upfront Fees</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>100% Digital Flow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>RBI Reg. NBFC Partners</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Bank-Grade Privacy</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center leading-normal">
            By continuing, you agree to FinCred's{' '}
            <Link to="/terms" className="text-blue-600 hover:underline font-medium">Terms of Service</Link>{' '}
            &{' '}
            <Link to="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>.
            FinCred is a loan referral platform and does not lend directly.
          </p>
        </div>
      </div>
    </div>
  );
};
