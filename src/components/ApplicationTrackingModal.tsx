import React, { useState } from 'react';
import { X, Search, ShieldCheck, Clock, FileText, CheckCircle2, AlertCircle, Building2, User, HelpCircle, Loader2 } from 'lucide-react';
import { trackApplicationStatus } from '../services/api.js';

interface ApplicationTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationTrackingModal: React.FC<ApplicationTrackingModalProps> = ({ isOpen, onClose }) => {
  const [appId, setAppId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResult(null);

    const cleanAppId = appId.trim();
    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);

    if (!cleanAppId) {
      setErrorMsg('Please enter your FinCred Application ID (e.g. FC-20260924-12345).');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMsg('Please enter your 10-digit registered Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const data = await trackApplicationStatus(cleanAppId, cleanMobile);
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'No application found with the provided details. Please verify your Application ID and mobile number.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-300';
      case 'REJECTED':
        return 'bg-rose-500/15 text-rose-700 border-rose-300';
      case 'UNDER REVIEW':
      case 'Under External Review':
        return 'bg-amber-500/15 text-amber-700 border-amber-300';
      case 'APPLICATION COMPLETED':
        return 'bg-indigo-500/15 text-indigo-700 border-indigo-300';
      case 'APPLICATION STARTED':
      case 'OPTION SELECTED':
        return 'bg-blue-500/15 text-blue-700 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg my-8 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Track Your Application
              </h2>
              <span className="text-[11px] text-slate-500">Live Status & Verification Progress</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7">
          {!result ? (
            <form onSubmit={handleSearch} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your unique <strong>FinCred Application ID</strong> and your registered <strong>Mobile Number</strong> to check your current application status.
              </p>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FC-20260924-12345"
                  value={appId}
                  onChange={e => setAppId(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400 text-sm font-mono uppercase outline-none transition-all"
                />
                <p className="text-[10px] text-slate-500 mt-1">Given to you upon saving your loan application enquiry</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <span className="px-3 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold border-r border-slate-300 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-3 py-2.5 bg-white text-slate-900 placeholder-slate-400 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Record...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Track Application</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Sensitive identifiers like PAN and full phone number are never exposed on public tracking screens.</span>
              </div>
            </form>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Application Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(result.status)}`}>
                    {result.status}
                  </span>
                </div>
                <div className="text-lg font-mono font-black text-blue-400 tracking-wider">
                  {result.applicationId}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <span>Applicant: <strong className="text-white">{result.customerName}</strong></span>
                  <span>{new Date(result.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Loan Summary */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Loan Category</span>
                  <strong className="text-slate-900 text-sm mt-0.5 block">{result.loanCategory}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Selected Option / Partner</span>
                  <strong className="text-slate-900 text-sm mt-0.5 block">{result.selectedOptionName || result.partnerName}</strong>
                </div>
                {result.amountRequested && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
                    <span className="text-[11px] text-slate-500 block">Requested Amount</span>
                    <strong className="text-blue-600 text-base mt-0.5 block">
                      ₹{Number(result.amountRequested).toLocaleString('en-IN')}
                    </strong>
                  </div>
                )}
              </div>

              {/* Progression Timeline */}
              {Array.isArray(result.timeline) && result.timeline.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Verification Steps</h4>
                  <div className="space-y-2.5">
                    {result.timeline.map((step: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          step.completed 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}>
                          {step.completed ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1 text-xs">
                          <span className={`font-semibold ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                            {step.title}
                          </span>
                        </div>
                        {step.completed && (
                          <span className="text-[10px] text-emerald-600 font-medium">Completed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance & Neutral message */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
                Final approval concerned lender ki eligibility, verification aur credit policy par depend karta hai.
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setResult(null); setAppId(''); setMobileNumber(''); }}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  Track Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
