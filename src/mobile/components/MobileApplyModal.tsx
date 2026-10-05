import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Building2,
  MapPin,
  IndianRupee,
  Briefcase,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Customer, LoanCategory, LoanProduct, LoanApplication } from '../../types.js';
import { appSubmitLoan } from '../../services/api.js';

interface MobileApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: LoanProduct | null;
  customer: Customer | null;
  onSuccess: (app: LoanApplication) => void;
}

export const MobileApplyModal: React.FC<MobileApplyModalProps> = ({
  isOpen,
  onClose,
  selectedProduct,
  customer,
  onSuccess
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [panOrVoterId, setPanOrVoterId] = useState('');
  const [loanCategory, setLoanCategory] = useState<LoanCategory>('Personal / Business Loan');
  const [amountRequested, setAmountRequested] = useState<number>(200000);
  const [employmentType, setEmploymentType] = useState('Salaried');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(35000);
  const [city, setCity] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<{
    app: LoanApplication;
    redirectUrl: string;
  } | null>(null);

  // Sync initial values when modal opens or customer changes
  useEffect(() => {
    if (isOpen) {
      if (customer) {
        const parts = (customer.fullName || '').trim().split(' ');
        setFirstName(customer.firstName || parts[0] || '');
        setLastName(customer.lastName || parts.slice(1).join(' ') || '');
        setFullName(customer.fullName || '');
        setMobileNumber(customer.mobileNumber || '');
        setEmail(customer.email || '');
        setDob(customer.dob || customer.dateOfBirth || '');
        setPanOrVoterId(customer.panOrVoterId || customer.panNumber || '');
        setPanNumber(customer.panNumber || customer.panOrVoterId || '');
        if (customer.monthlyIncome) setMonthlyIncome(customer.monthlyIncome);
      }
      if (selectedProduct) {
        if (selectedProduct.category === 'All Type Loan') {
          setLoanCategory('All Type Loan');
        } else if (selectedProduct.category === 'Instant Loan') {
          setLoanCategory('Instant Loan');
        } else {
          setLoanCategory('Personal / Business Loan');
        }
      }
      setSubmittedApp(null);
      setError(null);
    }
  }, [isOpen, customer, selectedProduct]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError('Please provide your First Name');
      return;
    }

    if (!lastName.trim()) {
      setError('Please provide your Last Name');
      return;
    }

    if (!dob) {
      setError('Please enter your Date of Birth (DOB)');
      return;
    }

    if (!monthlyIncome || monthlyIncome <= 0) {
      setError('Please enter your approximate Monthly Income');
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    const cleanMobile = mobileNumber.trim();
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    const cleanId = (panOrVoterId || panNumber).trim().toUpperCase();
    if (!cleanId || cleanId.length < 8) {
      setError('Please enter a valid PAN Card or Voter ID Number');
      return;
    }

    if (!city.trim()) {
      setError('Please enter your current city of residence');
      return;
    }

    setLoading(true);
    try {
      const combinedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await appSubmitLoan({
        fullName: combinedFullName,
        mobileNumber: cleanMobile,
        email: email.trim() || undefined,
        panNumber: cleanId,
        loanCategory,
        amountRequested,
        employmentType,
        monthlyIncome,
        city: city.trim(),
        customerId: customer?.customerId
      });

      setSubmittedApp({
        app: res.application,
        redirectUrl: res.destinationUrl
      });
      onSuccess(res.application);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerRedirect = () => {
    if (submittedApp?.redirectUrl) {
      window.open(submittedApp.redirectUrl, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn select-none">
      <div className="w-full sm:max-w-lg bg-[#0E1626] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#121C30]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                Apply for Loan Assistance
              </h2>
              <p className="text-[11px] text-slate-400">
                {selectedProduct?.name || 'Central RBI NBFC Fast-Track'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {submittedApp ? (
            /* Submission Success State */
            <div className="text-center py-4 space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/15">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Application Registered Successfully
                </span>
                <h3 className="text-xl font-black text-white font-['Outfit',sans-serif]">
                  Congratulations, {submittedApp.app.fullName}!
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                  Your loan request has been securely recorded in the FINCRED central database.
                </p>
              </div>

              {/* Application Details Summary Card */}
              <div className="p-4 rounded-2xl bg-[#141E34] border border-slate-700/80 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Application Reference ID:</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">
                    {submittedApp.app.applicationId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Loan Product:</span>
                  <span className="font-semibold text-white">{submittedApp.app.loanCategory}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Requested Amount:</span>
                  <span className="font-semibold text-emerald-400">
                    ₹{(submittedApp.app.amountRequested || amountRequested).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Assigned Partner:</span>
                  <span className="font-semibold text-blue-300">{submittedApp.app.partnerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tracking Status:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                    {submittedApp.app.status}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed px-2">
                Click below to proceed to the official partner lender portal to finalize document verification and complete instant disbursal.
              </p>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handlePartnerRedirect}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Proceed to Partner Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
                >
                  Close & View in My Applications
                </button>
              </div>
            </div>
          ) : (
            /* Loan Application Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Pre-filled User Information */}
              <div className="p-3.5 rounded-2xl bg-[#121B2E] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800/80">
                  <span className="font-semibold text-slate-300">Applicant Identity (Auto-Prefilled)</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3" />
                    Verified User
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={e => {
                        setFirstName(e.target.value);
                        setFullName(`${e.target.value} ${lastName}`.trim());
                      }}
                      className="w-full px-3 py-2 bg-[#0A0F1D] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                      placeholder="e.g. Rahul"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={e => {
                        setLastName(e.target.value);
                        setFullName(`${firstName} ${e.target.value}`.trim());
                      }}
                      className="w-full px-3 py-2 bg-[#0A0F1D] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                      placeholder="e.g. Sharma"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Date of Birth (DOB) *</label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0A0F1D] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">10-Digit Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      className="w-full px-3 py-2 bg-[#0A0F1D] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0F1D] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              {/* Loan Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Loan Assistance Type</label>
                  <select
                    value={loanCategory}
                    onChange={e => setLoanCategory(e.target.value as LoanCategory)}
                    className="w-full px-3 py-2.5 bg-[#121B2E] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Personal / Business Loan">Personal / Business Loan (Choice Connect / WeRize)</option>
                    <option value="Instant Loan">Instant Emergency Loan (TrueBalance Fast-Track)</option>
                    <option value="All Type Loan">RuLoans Multi-Bank Rate Compare</option>
                  </select>
                </div>

                {/* Amount Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-300 font-medium">Requested Loan Amount</label>
                    <span className="text-cyan-400 font-bold font-mono text-sm">
                      ₹{amountRequested.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={2500000}
                    step={10000}
                    value={amountRequested}
                    onChange={e => setAmountRequested(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                    <span>₹10,000</span>
                    <span>₹10,00,000</span>
                    <span>₹25,00,000</span>
                  </div>
                </div>

                {/* PAN / Voter ID Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-medium">PAN Card / Voter ID Number *</label>
                    <span className="text-[10px] text-slate-400">Masked securely in admin</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={panOrVoterId || panNumber}
                    onChange={e => {
                      const val = e.target.value.toUpperCase();
                      setPanOrVoterId(val);
                      setPanNumber(val);
                    }}
                    placeholder="e.g. ABCDE1234F or Voter ID"
                    className="w-full px-3 py-2.5 bg-[#121B2E] border border-slate-700 rounded-xl text-white uppercase font-mono tracking-wider outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Employment Type</label>
                    <select
                      value={employmentType}
                      onChange={e => setEmploymentType(e.target.value)}
                      className="w-full px-3 py-2 bg-[#121B2E] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Salaried">Salaried Employee</option>
                      <option value="Self-Employed">Self-Employed / Business</option>
                      <option value="Professional">Doctor / CA / Lawyer</option>
                      <option value="Other">Other / Freelancer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Monthly In-Hand (₹)</label>
                    <input
                      type="number"
                      value={monthlyIncome || ''}
                      onChange={e => setMonthlyIncome(Number(e.target.value))}
                      placeholder="e.g. 35000"
                      className="w-full px-3 py-2 bg-[#121B2E] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Current City</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, Delhi, Lucknow, Bengaluru"
                      className="w-full pl-9 pr-3 py-2 bg-[#121B2E] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/50 text-[10px] text-slate-400 leading-relaxed">
                🛡️ FINCRED is an assistance facilitator. We never charge upfront processing fees. Your application will be submitted directly to registered RBI NBFCs.
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting Application to Central DB...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Submit Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
