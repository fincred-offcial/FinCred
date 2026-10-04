import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  ChevronRight,
  ChevronLeft,
  Info,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Layers,
  ArrowRight,
  Banknote
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import {
  submitLoanApplication,
  fetchPartnerPlatforms,
  selectPartnerAndStartApplication
} from '../services/api.js';
import { subscribeToPartnerPlatforms } from '../services/firestoreService.js';
import { LoanApplication, PartnerPlatform } from '../types.js';
import { PartnerDetailsModal } from './PartnerDetailsModal.js';
import { ApplicationTrackingModal } from './ApplicationTrackingModal.js';

export type LoanFlowType =
  | 'Personal Loan'
  | 'Personal Loan / Instant Personal Loan'
  | 'Business Loan'
  | 'Other Loan Options';

type FlowStep = 'CUSTOMER_FORM' | 'PARTNER_SELECTION' | 'APPLICATION_IN_PROGRESS';

export const LoanApplicationModal: React.FC = () => {
  const { loanModal, closeLoanModal, customer } = useAuth();

  // Current Step in the Customer Flow
  const [step, setStep] = useState<FlowStep>('CUSTOMER_FORM');
  const [formPage, setFormPage] = useState<1 | 2>(1); // Sub-step inside Customer Form

  // Selected Loan Category
  const [selectedLoanType, setSelectedLoanType] = useState<LoanFlowType>('Personal Loan');

  // Partner Platforms for selection
  const [platforms, setPlatforms] = useState<PartnerPlatform[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);

  // Common Contact & Identity Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [panOrVoterId, setPanOrVoterId] = useState('');
  const [pincode, setPincode] = useState('');
  const [amountRequested, setAmountRequested] = useState<number | ''>('');

  // Personal Loan Specific Fields
  const [employmentType, setEmploymentType] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState<number | ''>('');
  const [existingLoan, setExistingLoan] = useState('None');

  // Business Loan Specific Fields
  const [businessType, setBusinessType] = useState('');
  const [businessVintage, setBusinessVintage] = useState('');
  const [businessTurnover, setBusinessTurnover] = useState('');
  const [existingBusinessLoan, setExistingBusinessLoan] = useState('None');

  // Consent & Status
  const [hasConsented, setHasConsented] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startingPartnerId, setStartingPartnerId] = useState<string | null>(null);

  // Saved Lead Result
  const [leadId, setLeadId] = useState('');
  const [savedApplication, setSavedApplication] = useState<LoanApplication | null>(null);
  const [copiedLeadId, setCopiedLeadId] = useState(false);

  // Selected Platform for Details Modal or Active Application
  const [partnerForModal, setPartnerForModal] = useState<PartnerPlatform | null>(null);
  const [activePartner, setActivePartner] = useState<PartnerPlatform | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  // Reset or initialize state when modal opens
  useEffect(() => {
    if (!loanModal.isOpen) return;

    // Detect initial loan category from opener
    const cat = loanModal.category || 'Personal Loan';
    const catLower = cat.toLowerCase();

    if (catLower.includes('business')) {
      setSelectedLoanType('Business Loan');
    } else if (catLower.includes('instant') || catLower.includes('(pl)')) {
      setSelectedLoanType('Personal Loan / Instant Personal Loan');
    } else if (catLower.includes('all') || catLower.includes('other')) {
      setSelectedLoanType('Other Loan Options');
    } else {
      setSelectedLoanType('Personal Loan');
    }

    // Reset customer form or prefill if logged in
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
      setPincode(customer.pincode || '');
      setAmountRequested(customer.requiredLoanAmount || customer.amountRequested || '');
      setEmploymentType(customer.employmentType || '');
      setMonthlyIncome(customer.monthlyIncome ? customer.monthlyIncome : '');
    } else {
      setFirstName('');
      setLastName('');
      setFullName('');
      setMobileNumber('');
      setEmail('');
      setDob('');
      setPanNumber('');
      setPanOrVoterId('');
      setPincode('');
      setAmountRequested('');
      setEmploymentType('');
      setMonthlyIncome('');
    }
    setExistingLoan('None');
    setBusinessType('');
    setBusinessVintage('');
    setBusinessTurnover('');
    setExistingBusinessLoan('None');
    setHasConsented(false);
    setErrorMsg('');
    setIsSubmitting(false);
    setLeadId('');
    setSavedApplication(null);
    setActivePartner(null);
    setPartnerForModal(null);
    setStep('CUSTOMER_FORM');
    setFormPage(1);

    // Load platforms
    setLoadingPlatforms(true);
    const unsubscribe = subscribeToPartnerPlatforms(
      (allPlatforms) => {
        setPlatforms(allPlatforms);
        setLoadingPlatforms(false);
      },
      () => {
        fetchPartnerPlatforms(cat)
          .then((list) => {
            setPlatforms(list);
            setLoadingPlatforms(false);
          })
          .catch(() => setLoadingPlatforms(false));
      }
    );

    return () => {
      unsubscribe();
    };
  }, [loanModal.isOpen, loanModal.category]);

  if (!loanModal.isOpen) return null;

  const isBusinessLoan = selectedLoanType === 'Business Loan';

  // Filter and sort platforms dynamically based on category
  // Personal Loan priority: WeRize, Ruloans, Choice Connect, True Balance
  // Business Loan priority: Ruloans, Choice Connect, WeRize
  const getDisplayPlatforms = (): PartnerPlatform[] => {
    if (isBusinessLoan) {
      const blOrder: Record<string, number> = {
        ruloans: 1,
        choice_connect: 2,
        werize: 3
      };
      return platforms
        .filter(
          (p) =>
            p.isActive &&
            p.platformId !== 'true_balance' &&
            (Boolean(p.businessLoanUrl) || p.supportedCategories?.some((c) => c.toLowerCase().includes('business')))
        )
        .sort((a, b) => {
          const ordA = blOrder[a.platformId] ?? a.priority ?? a.displayOrder ?? 99;
          const ordB = blOrder[b.platformId] ?? b.priority ?? b.displayOrder ?? 99;
          return ordA - ordB;
        });
    }

    // Personal Loan & Instant Loan
    const plOrder: Record<string, number> = {
      werize: 1,
      ruloans: 2,
      choice_connect: 3,
      true_balance: 4
    };
    return platforms
      .filter(
        (p) =>
          p.isActive &&
          (Boolean(p.personalLoanUrl) || p.supportedCategories?.some((c) => c.toLowerCase().includes('personal')))
      )
      .sort((a, b) => {
        const ordA = plOrder[a.platformId] ?? a.priority ?? a.displayOrder ?? 99;
        const ordB = plOrder[b.platformId] ?? b.priority ?? b.displayOrder ?? 99;
        return ordA - ordB;
      });
  };

  const displayPlatforms = getDisplayPlatforms();

  // Validate Sub-step 1 before advancing to Sub-step 2
  const handleProceedToStep2 = () => {
    setErrorMsg('');

    if (!firstName.trim()) {
      setErrorMsg('Please enter your First Name.');
      return;
    }

    if (!lastName.trim()) {
      setErrorMsg('Please enter your Last Name.');
      return;
    }

    if (!dob) {
      setErrorMsg('Please enter your Date of Birth (DOB).');
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length !== 10 || !/^[6-9]/.test(cleanMobile)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    const cleanPin = pincode.trim();
    if (!cleanPin || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setErrorMsg('Please enter a valid 6-digit residential pincode.');
      return;
    }

    setFullName(`${firstName.trim()} ${lastName.trim()}`);
    setFormPage(2);
  };

  // Handle Form Submission -> Save Application in Firestore First -> Generate FC-YYYYMMDD-XXXXX ID
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // PAN Card or Voter ID validation
    const cleanId = (panOrVoterId || panNumber).trim().toUpperCase();
    if (!cleanId || cleanId.length < 8) {
      setErrorMsg('Please enter a valid PAN Card Number (e.g. ABCDE1234F) or Voter ID Number.');
      return;
    }

    if (!monthlyIncome || Number(monthlyIncome) <= 0) {
      setErrorMsg('Please provide your approximate monthly net income.');
      return;
    }

    if (!amountRequested || Number(amountRequested) < 5000) {
      setErrorMsg('Please specify a required loan amount (minimum ₹5,000).');
      return;
    }

    if (isBusinessLoan) {
      if (!businessType) {
        setErrorMsg('Please select your Business Type.');
        return;
      }
      if (!businessVintage) {
        setErrorMsg('Please select your Business Vintage.');
        return;
      }
      if (!businessTurnover) {
        setErrorMsg('Please select your Monthly/Annual Business Turnover.');
        return;
      }
    } else {
      if (!employmentType) {
        setErrorMsg('Please select your Employment Type.');
        return;
      }
    }

    if (!hasConsented) {
      setErrorMsg('You must accept the terms, privacy policy, and bureau verification consent to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanMobile = mobileNumber.replace(/\D/g, '');
      const cleanPin = pincode.trim();
      const combinedFullName = `${firstName.trim()} ${lastName.trim()}`.trim() || fullName.trim();

      // Submit and save application to Firestore immediately
      const res = await submitLoanApplication({
        fullName: combinedFullName,
        applicantName: combinedFullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobileNumber: cleanMobile,
        email: email.trim().toLowerCase() || undefined,
        dob,
        panNumber: cleanId,
        panOrVoterId: cleanId,
        pincode: cleanPin,
        loanCategory: selectedLoanType,
        amountRequested: Number(amountRequested),
        employmentType: isBusinessLoan ? businessType : employmentType,
        monthlyIncome: Number(monthlyIncome),
        existingLoan: isBusinessLoan ? existingBusinessLoan : existingLoan,
        businessType: isBusinessLoan ? businessType : undefined,
        businessVintage: isBusinessLoan ? businessVintage : undefined,
        turnover: isBusinessLoan ? businessTurnover : undefined,
        existingBusinessLoan: isBusinessLoan ? existingBusinessLoan : undefined,
        hasConsented: true,
        customerId: customer?.customerId,
        source: 'web'
      });

      const genLeadId = res.leadId || res.applicationId || `FC-${Date.now()}`;
      setLeadId(genLeadId);
      setSavedApplication(res.application);
      setStep('PARTNER_SELECTION');
    } catch (err: any) {
      console.error('Lead save error:', err);
      setErrorMsg(err.message || 'Your application could not be saved. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Partner "APPLY NOW" Click
  // Records click & partner selection in Firestore, updates status to APPLICATION STARTED, then opens referral URL
  const handleApplyNow = async (platform: PartnerPlatform, lenderName?: string, lenderId?: string) => {
    if (!leadId) {
      setErrorMsg('Application reference missing. Please re-submit the form.');
      return;
    }

    setStartingPartnerId(platform.platformId);
    setErrorMsg('');

    try {
      // Determine referral URL strictly based on selected category
      let targetUrl = isBusinessLoan
        ? (platform.businessLoanUrl || platform.personalLoanUrl)
        : platform.personalLoanUrl;

      // Track partner selection in database first
      const trackRes = await selectPartnerAndStartApplication(leadId, {
        partnerPlatformId: platform.platformId,
        partnerName: platform.name,
        loanCategory: selectedLoanType,
        referralUrl: targetUrl,
        lenderName: lenderName || undefined,
        lenderId: lenderId || undefined
      });

      setActivePartner(platform);
      setStep('APPLICATION_IN_PROGRESS');

      // Open external URL in new tab securely
      const finalUrl = trackRes.referralUrl || targetUrl;
      if (finalUrl) {
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      console.error('Partner selection recording error:', err);
      setErrorMsg('Unable to record partner selection. Please try again.');
    } finally {
      setStartingPartnerId(null);
    }
  };

  const copyLeadIdToClipboard = () => {
    if (!leadId) return;
    navigator.clipboard.writeText(leadId);
    setCopiedLeadId(true);
    setTimeout(() => setCopiedLeadId(false), 2500);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
        <div className="relative w-full max-w-3xl my-6 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                FC
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                  FinCred Loan Application Flow
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  {step === 'CUSTOMER_FORM' && `Step 2: Customer Information (${formPage === 1 ? 'Part 1: Contact & Identity' : 'Part 2: Financial Details'})`}
                  {step === 'PARTNER_SELECTION' && 'Step 3: Choose Where You Want to Apply'}
                  {step === 'APPLICATION_IN_PROGRESS' && 'Application In Progress & Explore Other Options'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeLoanModal}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 1 & 2: LOAN CATEGORY SELECTION & MULTI-STEP CUSTOMER FORM */}
            {/* ========================================================================= */}
            {step === 'CUSTOMER_FORM' && (
              <div className="space-y-6">
                
                {/* STEP 1: Select Loan Type (4 Required Options) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 font-['Outfit',sans-serif]">
                      STEP 1: Select Loan Type
                    </label>
                    <span className="text-[11px] font-semibold text-blue-600">
                      {selectedLoanType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLoanType('Personal Loan');
                        setFormPage(1);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                        selectedLoanType === 'Personal Loan'
                          ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Personal Loan
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLoanType('Personal Loan / Instant Personal Loan');
                        setFormPage(1);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                        selectedLoanType === 'Personal Loan / Instant Personal Loan'
                          ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Instant Loan
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLoanType('Business Loan');
                        setFormPage(1);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                        selectedLoanType === 'Business Loan'
                          ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Business Loan
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLoanType('Other Loan Options');
                        setFormPage(1);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                        selectedLoanType === 'Other Loan Options'
                          ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Other Options
                    </button>
                  </div>
                </div>

                {/* Progress Indicator for Customer Form */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Customer Details: Part {formPage} of 2</span>
                    <span>{formPage === 1 ? '50% Completed' : '100% Ready'}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: formPage === 1 ? '50%' : '100%' }}
                    />
                  </div>
                </div>

                {/* FORM PAGE 1: Identity & Contact Information */}
                {formPage === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <User className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 font-['Outfit',sans-serif]">
                        {isBusinessLoan ? 'Applicant & Contact Details' : 'Personal & Contact Details'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* First Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          First Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            setFullName(`${e.target.value} ${lastName}`.trim());
                          }}
                          placeholder="e.g. Rahul"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Last Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            setFullName(`${firstName} ${e.target.value}`.trim());
                          }}
                          placeholder="e.g. Sharma"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>

                      {/* Date of Birth (DOB) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Date of Birth (DOB) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
                        />
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          10-Digit Mobile Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">+91</span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="9876543210"
                            className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          />
                        </div>
                      </div>

                      {/* Current Residential Pincode */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Current Pincode <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                          placeholder="6-digit pincode"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* Next Button */}
                    <div className="pt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={handleProceedToStep2}
                        className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span>Next: Financial Profile</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* FORM PAGE 2: Financial & Regulatory KYC Details */}
                {formPage === 2 && (
                  <form onSubmit={handleSubmitForm} className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 font-['Outfit',sans-serif]">
                        {isBusinessLoan ? 'Business & Commercial Profile' : 'Income & Loan Profile'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* PAN Card or Voter ID */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          PAN Card / Voter ID Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={panOrVoterId || panNumber}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setPanOrVoterId(val);
                            setPanNumber(val);
                          }}
                          placeholder="e.g. ABCDE1234F or Voter ID"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm uppercase tracking-wider font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Enter valid 10-digit PAN or Voter ID card number
                        </span>
                      </div>

                      {/* Required Loan Amount */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Required Loan Amount (₹) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={5000}
                          step={5000}
                          value={amountRequested}
                          onChange={(e) => setAmountRequested(e.target.value ? Number(e.target.value) : '')}
                          placeholder="e.g. 200000"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>

                      {/* BUSINESS LOAN SPECIFIC FIELDS */}
                      {isBusinessLoan ? (
                        <>
                          {/* Business Type */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Business Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                              required
                              value={businessType}
                              onChange={(e) => setBusinessType(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
                            >
                              <option value="">Select Business Type</option>
                              <option value="Sole Proprietorship">Sole Proprietorship</option>
                              <option value="Partnership Firm">Partnership Firm</option>
                              <option value="Private Limited Company">Private Limited Company</option>
                              <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                              <option value="Self-Employed Professional">Self-Employed Professional / Trader</option>
                            </select>
                          </div>

                          {/* Business Vintage */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Business Vintage <span className="text-rose-500">*</span>
                            </label>
                            <select
                              required
                              value={businessVintage}
                              onChange={(e) => setBusinessVintage(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
                            >
                              <option value="">Select Business Vintage</option>
                              <option value="Less than 1 Year">Less than 1 Year</option>
                              <option value="1 to 3 Years">1 to 3 Years</option>
                              <option value="3 to 5 Years">3 to 5 Years</option>
                              <option value="More than 5 Years">More than 5 Years</option>
                            </select>
                          </div>

                          {/* Business Turnover */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Monthly / Annual Turnover <span className="text-rose-500">*</span>
                            </label>
                            <select
                              required
                              value={businessTurnover}
                              onChange={(e) => setBusinessTurnover(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
                            >
                              <option value="">Select Turnover Range</option>
                              <option value="Under ₹10 Lakhs Annual">Under ₹10 Lakhs Annual</option>
                              <option value="₹10 Lakhs - ₹25 Lakhs Annual">₹10 Lakhs - ₹25 Lakhs Annual</option>
                              <option value="₹25 Lakhs - ₹1 Crore Annual">₹25 Lakhs - ₹1 Crore Annual</option>
                              <option value="₹1 Crore - ₹5 Crores Annual">₹1 Crore - ₹5 Crores Annual</option>
                              <option value="Above ₹5 Crores Annual">Above ₹5 Crores Annual</option>
                            </select>
                          </div>

                          {/* Existing Business Loan / EMIs */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Existing Business Loan / EMIs
                            </label>
                            <select
                              value={existingBusinessLoan}
                              onChange={(e) => setExistingBusinessLoan(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
                            >
                              <option value="None">No Active Business Loans</option>
                              <option value="1 Active Business Loan">1 Active Business Loan</option>
                              <option value="2-3 Active Business Loans">2-3 Active Business Loans</option>
                              <option value="4+ Active Loans">4+ Active Loans</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        /* PERSONAL LOAN SPECIFIC FIELDS */
                        <>
                          {/* Employment Type */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Employment Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                              required
                              value={employmentType}
                              onChange={(e) => setEmploymentType(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
                            >
                              <option value="">Select Employment Type</option>
                              <option value="Salaried">Salaried (Full-time / Corporate)</option>
                              <option value="Self-Employed Professional">Self-Employed Professional (Doctor, CA, etc.)</option>
                              <option value="Self-Employed Business">Self-Employed Business / Proprietorship</option>
                              <option value="Private Limited / Partner">Private Limited Director / Partner</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          {/* Monthly Net Income */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Monthly Net Income (₹) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              required
                              min={1000}
                              step={1000}
                              value={monthlyIncome}
                              onChange={(e) => setMonthlyIncome(e.target.value ? Number(e.target.value) : '')}
                              placeholder="e.g. 45000"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            />
                          </div>

                          {/* Existing Ongoing Loans */}
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Existing Active Loans / EMIs
                            </label>
                            <select
                              value={existingLoan}
                              onChange={(e) => setExistingLoan(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
                            >
                              <option value="None">No Active Loans (Clean Profile)</option>
                              <option value="1 Active Loan">1 Active Loan</option>
                              <option value="2-3 Active Loans">2 to 3 Active Loans</option>
                              <option value="4+ Active Loans">4 or more Active Loans</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Consent & Regulatory Compliance */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasConsented}
                          onChange={(e) => setHasConsented(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[11px] leading-relaxed text-slate-700">
                          I authorize FinCred to save my customer application record and determine available partner options. I understand that external lending partners perform credit evaluations as per RBI guidelines.
                        </span>
                      </label>
                      <p className="text-[10px] text-slate-600 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-slate-600 shrink-0" />
                        256-bit SSL encrypted. External partner links open ONLY after submission.
                      </p>
                    </div>

                    {/* Buttons: Back and Submit */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setFormPage(1)}
                        className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving in FinCred Database...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Details & View Available Loan Options</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: "CHOOSE WHERE YOU WANT TO APPLY" SCREEN (MANDATORY REQUIREMENT) */}
            {/* ========================================================================= */}
            {step === 'PARTNER_SELECTION' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* Application ID & Submission Card (Mandatory Section 14) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 border border-blue-200 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
                          Application Saved to Database
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                          Your FinCred Application ID
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-blue-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-blue-900 shadow-xs">
                      <span>{leadId}</span>
                      <button
                        type="button"
                        onClick={copyLeadIdToClipboard}
                        className="p-1 text-slate-500 hover:text-blue-700 transition-colors"
                        title="Copy Application ID"
                      >
                        {copiedLeadId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-blue-200/60 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Applicant Name</span>
                      <strong className="text-slate-800">{fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Mobile Number</span>
                      <strong className="text-slate-800">+91 {mobileNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Loan Type</span>
                      <strong className="text-slate-800">{selectedLoanType}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Submission Status</span>
                      <strong className="text-emerald-700">FORM SUBMITTED</strong>
                    </div>
                  </div>

                  {/* Option to Track Application */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowTrackingModal(true)}
                      className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1.5 bg-blue-100/70 hover:bg-blue-200/70 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Track Application Status</span>
                    </button>
                  </div>
                </div>

                {/* Section Title & Subtitle (Mandatory Requirement Section 5) */}
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
                    Choose Where You Want to Apply
                  </h2>
                  <p className="text-xs text-slate-600">
                    Based on the information you provided, review the available loan application options below.
                  </p>
                </div>

                {/* Transparency Notice (Section 10) */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="text-[11px] leading-relaxed">
                    • Options displayed are verified lending partners configured for <strong>{selectedLoanType}</strong>.
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    • Lenders and approval criteria vary by partner. Final approval and loan terms are determined by the respective institution.
                  </p>
                </div>

                {/* Partner Cards Grid with Verified Lenders List (Sections 6, 7, 9) */}
                <div className="space-y-4">
                  {displayPlatforms.map((platform) => {
                    const isStarting = startingPartnerId === platform.platformId;
                    const verifiedLenders = (platform.lenders || []).filter((l) => l.isActive !== false);

                    return (
                      <div
                        key={platform.platformId}
                        className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all space-y-3.5"
                      >
                        {/* Partner Top Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
                                {platform.name}
                              </h3>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                {isBusinessLoan ? 'Business Loan' : 'Personal Loan'}
                              </span>
                              {platform.badge && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                {platform.badge}
                              </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 font-medium">
                              Product Type:{' '}
                              <strong className="text-slate-700">
                                {platform.productType || (isBusinessLoan ? 'Business Capital & Working Line' : 'Unsecured Digital Personal Loan')}
                              </strong>
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            {/* View Full Network Modal */}
                            <button
                              type="button"
                              onClick={() => setPartnerForModal(platform)}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                            >
                              View Details
                            </button>

                            {/* APPLY NOW Button */}
                            <button
                              type="button"
                              onClick={() => handleApplyNow(platform)}
                              disabled={isStarting}
                              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                            >
                              {isStarting ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Starting...</span>
                                </>
                              ) : (
                                <>
                                  <span>APPLY NOW</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* VERIFIED LENDERS LIST (Mandatory Requirement Section 9) */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Available Lenders / Banks / NBFCs via {platform.name}:
                          </span>
                          {verifiedLenders.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {verifiedLenders.map((lender) => (
                                <span
                                  key={lender.lenderId}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs"
                                >
                                  <Building2 className="w-3 h-3 text-blue-600" />
                                  <span>{lender.lenderName}</span>
                                  {lender.lenderType && (
                                    <span className="text-[9px] text-slate-400">({lender.lenderType})</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">
                              Verified lending institutions available upon profile evaluation.
                            </p>
                          )}
                        </div>

                        {/* Basic Eligibility & Important Conditions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                          <div className="p-2.5 rounded-lg bg-blue-50/40 border border-blue-100">
                            <span className="text-[10px] uppercase font-bold text-blue-800 block mb-0.5">
                              Basic Eligibility:
                            </span>
                            <span className="text-[11px] text-slate-700">
                              {platform.eligibility || 'Min age 21, valid PAN, Aadhaar & regular verifiable cashflow'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-amber-50/40 border border-amber-100">
                            <span className="text-[10px] uppercase font-bold text-amber-800 block mb-0.5">
                              Important Conditions:
                            </span>
                            <span className="text-[11px] text-slate-700">
                              {platform.importantConditions || 'Approval strictly subject to partner credit policy and document verification'}
                            </span>
                          </div>
                        </div>

                        {/* Indicative Range Strip */}
                        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Indicative Amount</span>
                            <span className="font-semibold text-slate-800">{platform.loanAmountRange || 'As per profile'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Tenure</span>
                            <span className="font-semibold text-slate-800">{platform.tenureRange || 'Flexible'}</span>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-slate-400 text-[10px] block">Interest / Pricing</span>
                            <span className="font-semibold text-slate-800">{platform.interestRate || 'Competitive Rates'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Back to Edit Form */}
                <div className="pt-2 flex justify-start">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('CUSTOMER_FORM');
                      setFormPage(1);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Edit Submitted Information</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 4: APPLICATION STARTED + "EXPLORE OTHER AVAILABLE OPTIONS" (Section 13) */}
            {/* ========================================================================= */}
            {step === 'APPLICATION_IN_PROGRESS' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* Active Application Status Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-200 text-blue-900 uppercase">
                        Application Started
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                        Application Started with {activePartner?.name || 'Selected Platform'}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        The partner portal has been opened in a new tab. Please proceed with your phone OTP verification and document submission on their portal.
                      </p>
                    </div>

                    <div className="bg-white border border-blue-200 p-2.5 rounded-xl text-center shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Lead ID</span>
                      <span className="text-xs font-mono font-bold text-blue-900">{leadId}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                    <span>Category: <strong>{selectedLoanType}</strong></span>
                    <span>Status: <strong className="text-blue-700">APPLICATION STARTED (Recorded)</strong></span>
                  </div>
                </div>

                {/* "Explore Other Available Options" Flow (Mandatory Section 13) */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 font-['Outfit',sans-serif]">
                      Explore Other Available Options
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Eligibility and approval criteria vary by lender. You may review other available options.
                    </p>
                  </div>

                  {/* List of other available partner options without re-entering form data */}
                  <div className="space-y-3">
                    {displayPlatforms
                      .filter((p) => p.platformId !== activePartner?.platformId)
                      .map((platform) => (
                        <div
                          key={platform.platformId}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{platform.name}</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                {isBusinessLoan ? 'Business Loan' : 'Personal Loan'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {platform.loanAmountRange || 'Loan Option'} • {platform.interestRate || 'Competitive Rates'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPartnerForModal(platform)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                              View Details
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApplyNow(platform)}
                              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span>Apply Now</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Finished Action */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('PARTNER_SELECTION')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    ← Back to All Options
                  </button>

                  <button
                    type="button"
                    onClick={closeLoanModal}
                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Done / Close
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* Partner Details Modal */}
      {partnerForModal && (
        <PartnerDetailsModal
          platform={partnerForModal}
          loanCategory={selectedLoanType}
          leadId={leadId}
          onClose={() => setPartnerForModal(null)}
          onApplyNow={(p) => {
            setPartnerForModal(null);
            handleApplyNow(p);
          }}
        />
      )}

      {/* Application Tracking Modal */}
      {showTrackingModal && (
        <ApplicationTrackingModal
          isOpen={showTrackingModal}
          onClose={() => setShowTrackingModal(false)}
        />
      )}
    </>
  );
};
