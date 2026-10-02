import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  Smartphone,
  Mail,
  Calendar,
  CreditCard,
  MapPin,
  Briefcase,
  IndianRupee,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Lock
} from 'lucide-react';
import { registerCustomer } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface NewCustomerRegistrationFormProps {
  verifiedMobile: string;
  prefillName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const NewCustomerRegistrationForm: React.FC<NewCustomerRegistrationFormProps> = ({
  verifiedMobile,
  prefillName = '',
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const { setCustomerSession } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState(prefillName);
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [pincode, setPincode] = useState('');
  const [employmentType, setEmploymentType] = useState('Salaried');
  const [monthlyIncome, setMonthlyIncome] = useState<number | string>(45000);
  const [requiredLoanAmount, setRequiredLoanAmount] = useState<number | string>(250000);
  const [hasConsented, setHasConsented] = useState(true);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Quick Income Chips
  const incomeChips = [25000, 40000, 60000, 100000];
  const loanAmountChips = [100000, 250000, 500000, 1000000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMessage('Please enter your Full Legal Name as per PAN.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address for application updates.');
      return;
    }

    if (!dob) {
      setErrorMessage('Please enter your Date of Birth.');
      return;
    }

    // Check age 18+
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 18) {
      setErrorMessage('Applicant must be at least 18 years old to apply for loans.');
      return;
    }

    const cleanPan = panNumber.trim().toUpperCase();
    if (!cleanPan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      setErrorMessage('Please enter a valid 10-digit PAN (e.g. ABCDE1234F).');
      return;
    }

    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      setErrorMessage('Please enter a valid 6-digit residential Pincode.');
      return;
    }

    if (!monthlyIncome || Number(monthlyIncome) <= 0) {
      setErrorMessage('Please enter your net monthly income.');
      return;
    }

    if (!requiredLoanAmount || Number(requiredLoanAmount) <= 0) {
      setErrorMessage('Please select or enter your required loan amount.');
      return;
    }

    if (!hasConsented) {
      setErrorMessage('Please agree to the credit terms & consent declaration to proceed.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerCustomer({
        fullName: fullName.trim(),
        mobileNumber: verifiedMobile,
        email: email.trim().toLowerCase(),
        dob,
        panNumber: cleanPan,
        pincode: pincode.trim(),
        employmentType,
        monthlyIncome: Number(monthlyIncome),
        requiredLoanAmount: Number(requiredLoanAmount),
        loanCategory: 'Personal Loan'
      });

      if (res.success && res.customer && res.token) {
        setCustomerSession(res.customer, res.token);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration could not be completed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full inline-block">
              Step 2 of 2 • Fast Onboarding
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
              Complete Your Loan Profile
            </h2>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted</span>
          </div>
        </div>

        <p className="text-xs text-slate-600">
          Please provide your basic details to generate verified partner loan offers matched to your profile.
        </p>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Mobile Number (Verified badge) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                Mobile Number
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Verified via OTP
              </span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-mono font-bold text-xs text-slate-500">
                +91
              </span>
              <input
                type="text"
                disabled
                value={verifiedMobile}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-sm font-mono font-bold text-slate-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Full Name (as per PAN) *</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar Verma"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Email Address *</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
            />
          </div>

          {/* Grid: DOB & PAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Date of Birth *</span>
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>PAN Number *</span>
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={panNumber}
                onChange={e => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-mono font-bold tracking-wider text-slate-900 uppercase focus:bg-white focus:border-blue-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Pincode & Employment Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Pincode *</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                inputMode="numeric"
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="e.g. 110001"
                className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Employment Type *</span>
              </label>
              <select
                value={employmentType}
                onChange={e => setEmploymentType(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all cursor-pointer"
              >
                <option value="Salaried">Salaried (Private / Govt)</option>
                <option value="Self-Employed">Self-Employed Professional</option>
                <option value="Business Owner">Business Owner / Trader</option>
                <option value="Freelancer / Other">Freelancer / Consultant</option>
              </select>
            </div>
          </div>

          {/* Monthly Income */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                <span>Monthly In-Hand Income *</span>
              </label>
              <span className="text-xs font-mono font-bold text-emerald-700">
                ₹{Number(monthlyIncome || 0).toLocaleString('en-IN')}/month
              </span>
            </div>

            <input
              type="number"
              required
              min={10000}
              step={5000}
              value={monthlyIncome}
              onChange={e => setMonthlyIncome(e.target.value)}
              placeholder="e.g. 45000"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {incomeChips.map(amt => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setMonthlyIncome(amt)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    Number(monthlyIncome) === amt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  ₹{(amt / 1000)}k
                </button>
              ))}
            </div>
          </div>

          {/* Required Loan Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
                <span>Required Loan Amount *</span>
              </label>
              <span className="text-sm font-mono font-black text-blue-700">
                ₹{Number(requiredLoanAmount || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <input
              type="number"
              required
              min={25000}
              max={2500000}
              step={10000}
              value={requiredLoanAmount}
              onChange={e => setRequiredLoanAmount(e.target.value)}
              placeholder="e.g. 250000"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {loanAmountChips.map(amt => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setRequiredLoanAmount(amt)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    Number(requiredLoanAmount) === amt
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  ₹{(amt / 100000)} Lakh
                </button>
              ))}
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasConsented}
                onChange={e => setHasConsented(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-600 leading-snug">
                I hereby declare all details provided are accurate. I authorize FinCred and its RBI-registered lending partners to check my eligibility and contact me regarding my loan application.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 space-y-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Your Loan Account...</span>
                </>
              ) : (
                <>
                  <span>CONTINUE TO CUSTOMER PORTAL</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Go Back
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
