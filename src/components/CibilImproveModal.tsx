import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Smartphone,
  CreditCard,
  MessageCircle,
  X,
  ArrowRight,
  Loader2,
  Search,
  Sparkles,
  Award,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { submitCibilOrder, trackCibilOrder } from '../services/api.js';
import { CibilOrder } from '../types.js';

interface CibilImproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrackingRef?: string;
}

export const CibilImproveModal: React.FC<CibilImproveModalProps> = ({
  isOpen,
  onClose,
  defaultTrackingRef
}) => {
  const { customer } = useAuth();

  // Active View: 'pay' (Payment & UTR Submission) | 'track' (Track existing order)
  const [activeTab, setActiveTab] = useState<'pay' | 'track'>('pay');

  // Form Fields
  const [fullName, setFullName] = useState(customer?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(customer?.mobileNumber || '');
  const [panNumber, setPanNumber] = useState(customer?.panNumber || '');
  const [currentScoreEstimate, setCurrentScoreEstimate] = useState('Below 650 (Need Loan)');
  const [utrNumber, setUtrNumber] = useState('');
  
  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState<CibilOrder | null>(null);

  // Tracking State
  const [trackingQuery, setTrackingQuery] = useState(defaultTrackingRef || customer?.mobileNumber || '');
  const [isTracking, setIsTracking] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<CibilOrder | null>(null);
  const [trackingError, setTrackingError] = useState('');

  // UI Helpers
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const UPI_ID = 'fincredlo@nyes';
  const PRICE_ORIGINAL = 599;
  const DISCOUNT = 199;
  const FINAL_PRICE = 299;
  const WHATSAPP_NUMBER = '+919219787153';
  const BRANCH_LINK = 'https://branch.co/download/shubh12360';

  // UPI deep links
  const upiPayUrl = `upi://pay?pa=${UPI_ID}&pn=FinCred%20India&am=${FINAL_PRICE}&cu=INR&tn=CIBIL%20Improvement%20Service`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPayUrl)}`;

  // Synchronize customer details
  useEffect(() => {
    if (customer?.fullName && !fullName) setFullName(customer.fullName);
    if (customer?.mobileNumber && !mobileNumber) setMobileNumber(customer.mobileNumber);
    if (customer?.panNumber && !panNumber) setPanNumber(customer.panNumber);
  }, [customer]);

  useEffect(() => {
    if (defaultTrackingRef) {
      setTrackingQuery(defaultTrackingRef);
      setActiveTab('track');
      handleSearchTrack(defaultTrackingRef);
    }
  }, [defaultTrackingRef]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name as per PAN card.');
      return;
    }
    if (!mobileNumber.trim() || !/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMessage('Please enter a valid 12-digit UPI UTR / Transaction Reference Number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitCibilOrder({
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        utrNumber: utrNumber.trim(),
        customerId: customer?.customerId || '',
        email: customer?.email || '',
        panNumber: panNumber.trim(),
        currentScoreEstimate
      });

      if (res.success && res.order) {
        setSubmittedOrder(res.order);
        setTrackedOrder(res.order);
        setActiveTab('track');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit CIBIL order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchTrack = async (searchStr?: string) => {
    const q = (searchStr || trackingQuery).trim();
    if (!q) {
      setTrackingError('Please enter Reference Number or Mobile Number.');
      return;
    }

    setIsTracking(true);
    setTrackingError('');
    try {
      const order = await trackCibilOrder(q);
      setTrackedOrder(order);
    } catch (err: any) {
      setTrackedOrder(null);
      setTrackingError(err.message || 'No CIBIL order found for this query.');
    } finally {
      setIsTracking(false);
    }
  };

  const openWhatsAppSupport = () => {
    const text = encodeURIComponent(
      `Hello FinCred Support, I need help with my CIBIL Score Improvement Order (Ref: ${
        trackedOrder?.referenceNumber || submittedOrder?.referenceNumber || 'N/A'
      }, Mobile: ${mobileNumber || customer?.mobileNumber || ''}).`
    );
    window.open(`https://wa.me/919219787153?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight font-['Outfit',sans-serif]">
                  CIBIL Score Improve & Loan Unlock
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                  Offer
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">
                Fix Low Score • Instant Partner Sanction Link
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('pay')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pay'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay & Submit UTR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'track'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Track Order & Unlock Link</span>
            {trackedOrder?.status === 'confirmed' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          
          {/* ======================================================== */}
          {/* TAB 1: PAY & SUBMIT UTR                                  */}
          {/* ======================================================== */}
          {activeTab === 'pay' && (
            <div className="space-y-4">
              
              {/* Pricing & Benefit Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-800/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Special Improvement Package
                    </span>
                    <span className="text-sm font-bold text-white">Full Credit Repair & Guaranteed Link</span>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xs text-slate-400 line-through">₹{PRICE_ORIGINAL}</span>
                      <span className="text-xs text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                        -₹{DISCOUNT}
                      </span>
                    </div>
                    <div className="text-xl font-black text-amber-300 font-mono">
                      ₹{FINAL_PRICE} <span className="text-[10px] font-bold text-slate-300 uppercase">Only</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>CIBIL Dispute Assistance</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Score Recovery Plan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Branch Pre-Approved Link</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Dedicated WhatsApp Help</span>
                  </div>
                </div>
              </div>

              {/* UPI Payment Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      Official FinCred UPI ID
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black font-mono text-white tracking-wide">
                        {UPI_ID}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-2 py-0.5 rounded bg-blue-900/50 hover:bg-blue-800 text-[10px] font-bold text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQrCode(!showQrCode)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  >
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>{showQrCode ? 'Hide QR' : 'Show QR'}</span>
                  </button>
                </div>

                {/* QR Code expansion */}
                {showQrCode && (
                  <div className="p-4 rounded-xl bg-white text-slate-900 flex flex-col items-center justify-center space-y-2 animate-in zoom-in-95 duration-200">
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code for FinCred"
                      className="w-44 h-44 rounded-lg shadow-sm"
                    />
                    <div className="text-center">
                      <p className="text-xs font-black font-mono">Scan & Pay ₹299</p>
                      <p className="text-[10px] text-slate-500 font-medium">GPay • PhonePe • Paytm • BHIM • Any UPI</p>
                    </div>
                  </div>
                )}

                {/* Direct Pay Now Button (Deep links to UPI apps) */}
                <div className="space-y-1.5 pt-1">
                  <a
                    href={upiPayUrl}
                    className="w-full py-3 px-4 rounded-xl font-black text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:brightness-110 shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Pay Now ₹299 (Open UPI App)</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-90" />
                  </a>

                  <p className="text-[10px] text-center text-slate-400">
                    Tapping Pay Now opens Google Pay / PhonePe / Paytm on mobile.
                  </p>
                </div>
              </div>

              {/* UTR Submission Form */}
              <form onSubmit={handleSubmitOrder} className="space-y-3 pt-1">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Step 2: Enter 12-Digit UTR After Payment</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    After successful payment, copy the 12-digit UTR/Reference number from your UPI app receipt and submit below.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Your Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Mobile Number *</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile"
                      required
                      maxLength={10}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
                    <span>UPI Transaction UTR / Ref Number (12 Digits) *</span>
                    <span className="text-[10px] text-slate-400">Found in UPI App receipt</span>
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={e => setUtrNumber(e.target.value.trim())}
                    placeholder="e.g. 427819283741 or UPI Ref ID"
                    required
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider rounded-xl bg-slate-950 border-2 border-amber-500/60 text-white focus:border-amber-400 outline-none placeholder:text-slate-600"
                  />
                </div>

                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !utrNumber.trim()}
                  className="w-full py-3 px-4 rounded-xl font-black text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting UTR Verification...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit UTR & Get Reference Number →</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: TRACK ORDER & UNLOCK BRANCH LINK                  */}
          {/* ======================================================== */}
          {activeTab === 'track' && (
            <div className="space-y-4">
              
              {/* Search Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingQuery}
                  onChange={e => setTrackingQuery(e.target.value)}
                  placeholder="Enter Reference Number (e.g. CIBIL-2026-...) or Mobile"
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSearchTrack()}
                  disabled={isTracking}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isTracking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Track</span>
                </button>
              </div>

              {trackingError && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-xs text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{trackingError}</span>
                </div>
              )}

              {/* Order Status Display */}
              {trackedOrder ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  {/* Status Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Order Reference</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-black text-cyan-400">
                          {trackedOrder.referenceNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyRef(trackedOrder.referenceNumber)}
                          className="text-[10px] text-slate-400 hover:text-white"
                          title="Copy Reference"
                        >
                          {copiedRef ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      {trackedOrder.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 border border-emerald-800 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Payment Verified</span>
                        </span>
                      ) : trackedOrder.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-950 border border-red-800 text-red-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 border border-amber-800 text-amber-400">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Verification Pending</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">Applicant:</span>
                      <p className="font-bold text-white">{trackedOrder.fullName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Mobile:</span>
                      <p className="font-mono text-white">{trackedOrder.mobileNumber}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Submitted UTR:</span>
                      <p className="font-mono text-amber-300 font-bold">{trackedOrder.utrNumber}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Amount Paid:</span>
                      <p className="font-mono text-emerald-400 font-bold">₹{trackedOrder.amount || 299}</p>
                    </div>
                  </div>

                  {/* ADMIN CONFIRMED: PROMINENT CONTINUE BUTTON */}
                  {trackedOrder.status === 'confirmed' ? (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-2 border-emerald-500 text-white space-y-3 animate-in zoom-in-95 duration-200">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wide">
                            Payment Confirmed by FinCred Admin!
                          </h4>
                          <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                            Your CIBIL Improvement status is active. Click below to continue and access your pre-approved Branch Personal Loan.
                          </p>
                        </div>
                      </div>

                      {/* CONTINUE REDIRECT BUTTON */}
                      <a
                        href={trackedOrder.loanLink || BRANCH_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 px-4 rounded-xl font-black text-xs text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                      >
                        <Zap className="w-4 h-4 text-yellow-300" />
                        <span>Continue to Download Branch Loan App →</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : trackedOrder.status === 'rejected' ? (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-200 space-y-1">
                      <p className="font-bold">Verification Note from Admin:</p>
                      <p className="text-[11px] text-red-300">{trackedOrder.adminNotes || 'Invalid UTR Number.'}</p>
                      <p className="text-[10px] text-slate-400 pt-1">
                        Please pay ₹299 to {UPI_ID} and submit a valid 12-digit UTR or contact WhatsApp support.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/80 text-xs text-blue-200 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                        <Clock className="w-4 h-4" />
                        <span>Admin Verification In Progress</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Admin is checking your ₹299 UPI payment for UTR: <strong className="font-mono text-white">{trackedOrder.utrNumber}</strong>. As soon as Admin confirms, you will receive an in-app notification and the <strong>Continue</strong> button will appear right here!
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Average verification time: 5 - 15 minutes.
                      </p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <HelpCircle className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">Enter your reference code or mobile number to track status.</p>
                </div>
              )}

            </div>
          )}

          {/* WhatsApp Support Section */}
          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                  Need Help or Instant Verification?
                </span>
                <span className="text-xs font-bold text-white">WhatsApp: +91 9219787153</span>
              </div>
            </div>

            <button
              type="button"
              onClick={openWhatsAppSupport}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <span>Chat</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

        </div>

        {/* Footer Guarantee */}
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            100% Encrypted & RBI Registered Partners
          </span>
          <span>FinCred Credit Care</span>
        </div>

      </div>
    </div>
  );
};
