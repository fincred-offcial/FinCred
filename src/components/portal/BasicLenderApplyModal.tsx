import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  ArrowRight,
  Lock,
  Building2
} from 'lucide-react';
import { Customer } from '../../types.js';
import { submitLoanApplication, updateCustomerProfile, logUserActivity } from '../../services/api.js';
import { updateCustomerInFirestore } from '../../services/firestoreService.js';

interface BasicLenderApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lenderName: string;
  lenderTag?: string;
  lenderAmount?: string;
  lenderUrl: string;
  category?: string;
  customer: Customer | null;
  onSuccessRedirect?: (url: string) => void;
}

export const BasicLenderApplyModal: React.FC<BasicLenderApplyModalProps> = ({
  isOpen,
  onClose,
  lenderName,
  lenderTag = 'RBI Registered Partner',
  lenderAmount,
  lenderUrl,
  category = 'Personal Loan',
  customer,
  onSuccessRedirect
}) => {
  // 5 Basic Fields Required by User:
  // 1. Name
  // 2. Mobile Number
  // 3. Email ID
  // 4. PAN Card
  // 5. DOB
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [dob, setDob] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Pre-fill fields whenever modal opens or customer changes
  useEffect(() => {
    if (isOpen && customer) {
      setName(customer.fullName || '');
      setMobileNumber(customer.mobileNumber || '');
      setEmail(customer.email || '');
      setPanNumber(customer.panNumber || '');
      setDob(customer.dob || customer.dateOfBirth || '');
      setErrorMessage('');
      setIsSuccess(false);
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = name.trim();
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    const cleanEmail = email.trim();
    const cleanPan = panNumber.trim().toUpperCase();
    const cleanDob = dob.trim();

    // 1. Name validation
    if (cleanName.length < 2) {
      setErrorMessage('Kripya apna poora naam (Full Name) enter karein.');
      return;
    }

    // 2. Mobile validation
    if (cleanMobile.length !== 10) {
      setErrorMessage('Kripya sahi 10-digit mobile number enter karein.');
      return;
    }

    // 3. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Kripya valid email address enter karein.');
      return;
    }

    // 4. PAN Card validation (10 chars: 5 letters, 4 digits, 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(cleanPan)) {
      setErrorMessage('Kripya sahi 10-digit PAN Card number enter karein (jaise: ABCDE1234F).');
      return;
    }

    // 5. DOB validation
    if (!cleanDob) {
      setErrorMessage('Kripya apni Date of Birth (DOB) select karein.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit basic application to FinCred & Admin Portal
      const appResult = await submitLoanApplication({
        fullName: cleanName,
        applicantName: cleanName,
        mobileNumber: cleanMobile,
        email: cleanEmail,
        panNumber: cleanPan,
        dob: cleanDob,
        loanCategory: category,
        partnerName: lenderName,
        destinationUrl: lenderUrl,
        customerId: customer?.customerId,
        source: 'web'
      });

      // 2. Save profile updates (Email, PAN, DOB) to customer record
      if (customer?.customerId) {
        try {
          await updateCustomerProfile(customer.customerId, {
            fullName: cleanName,
            email: cleanEmail,
            panNumber: cleanPan,
            dob: cleanDob
          });
          await updateCustomerInFirestore(customer.customerId, {
            fullName: cleanName,
            email: cleanEmail,
            panNumber: cleanPan,
            dob: cleanDob
          });
        } catch (updateErr) {
          console.warn('Customer profile update notice:', updateErr);
        }
      }

      // 3. Log user activity
      try {
        logUserActivity({
          activityType: 'partner_redirect',
          description: `Basic form filled & redirected to ${lenderName}`,
          customerId: customer?.customerId,
          userMobile: cleanMobile,
          userName: cleanName,
          metadata: {
            partner: lenderName,
            category,
            pan: cleanPan,
            email: cleanEmail,
            dob: cleanDob,
            applicationId: appResult?.applicationId || appResult?.leadId
          }
        });
      } catch {}

      // 4. Show success state and perform redirect
      setIsSuccess(true);

      setTimeout(() => {
        if (onSuccessRedirect) {
          onSuccessRedirect(lenderUrl);
        } else {
          window.open(lenderUrl, '_blank', 'noopener,noreferrer');
        }
        onClose();
      }, 1200);

    } catch (err: any) {
      console.error('Basic form submit failed:', err);
      setErrorMessage(err.message || 'Form submit karne me samasya aayi. Kripya punah prayas karein.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lender-apply-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0a192f] via-[#0d2847] to-[#081b33] text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="lender-apply-title" className="text-lg sm:text-xl font-black font-['Outfit',sans-serif] tracking-tight">
                  {lenderName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                  {lenderTag}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {lenderAmount ? `Assistance: ${lenderAmount} • ` : ''}Basic Details Form
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-cyan-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Ye basic details fill karte hi aap direct lender ke portal par redirect honge.</span>
          </div>
        </div>

        {/* Form Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
                Details Successfully Recorded!
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Aapko <strong className="text-slate-800">{lenderName}</strong> ke official portal par redirect kiya ja raha hai...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-600 pt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3.5">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Full Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Aadhaar / PAN card ke anusaar poora naam"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                />
              </div>

              {/* 2. Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mobile Number</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* 3. Email ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email ID</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                />
              </div>

              {/* Grid: 4. PAN Card + 5. DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 4. PAN Card */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>PAN Card Number</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={panNumber}
                    onChange={e => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white font-mono uppercase tracking-wider"
                  />
                </div>

                {/* 5. Date of Birth (DOB) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Date of Birth (DOB)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Note & Submit Button */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Aapki details 256-bit encrypted hain aur safe tareeqe se store hoti hain.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Details & Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed & Open {lenderName}</span>
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
