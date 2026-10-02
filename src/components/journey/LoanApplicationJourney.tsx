import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  Lock,
  Sparkles,
  User,
  Briefcase,
  Building2,
  Calendar,
  CreditCard,
  Mail,
  RotateCcw,
  Check,
  ExternalLink,
  ChevronRight,
  Landmark,
  Zap,
  Info,
  Headphones,
  FileText,
  ChevronDown,
  Store,
  Copy,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import {
  sendOtp,
  verifyOtp,
  checkMobileRegistration,
  submitLoanApplication,
  logUserActivity,
  fetchCustomerApplications
} from '../../services/api.js';
import { SmsNotificationBanner } from '../SmsNotificationBanner.js';
import { LoanApplication } from '../../types.js';

type JourneyStep =
  | 'MOBILE_INPUT'
  | 'LOAN_TYPE_SELECTION'
  | 'LENDER_SELECTION'
  | 'APPLICATION_FORM'
  | 'SAVE_AND_REDIRECT';

interface PartnerOption {
  id: string;
  name: string;
  badge: string;
  amountRange: string;
  features: string;
  description: string;
  urlKey: 'werize' | 'ruloans' | 'choice_connect' | 'true_balance';
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

export const LoanApplicationJourney: React.FC = () => {
  const navigate = useNavigate();
  const { settings, customer, setCustomerSession, isCustomerLoggedIn } = useAuth();

  // If customer is already logged in, never show the mobile number entry screen on refresh/visit.
  // Immediately redirect to customer Home dashboard.
  useEffect(() => {
    if (isCustomerLoggedIn) {
      navigate('/dashboard?tab=home', { replace: true });
    }
  }, [isCustomerLoggedIn, navigate]);

  // Current Step in the Customer Journey
  const [currentStep, setCurrentStep] = useState<JourneyStep>('MOBILE_INPUT');

  // Step 1: Mobile & OTP State
  const [mobileNumber, setMobileNumber] = useState(customer?.mobileNumber || '');
  const [isCheckingMobile, setIsCheckingMobile] = useState(false);
  const [isRegisteredNumber, setIsRegisteredNumber] = useState<boolean | null>(null);
  const [registeredName, setRegisteredName] = useState<string | null>(customer?.fullName || null);

  const [otpSent, setOtpSent] = useState(false);
  const [activeOtpCode, setActiveOtpCode] = useState<string | null>(null);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']); // NO auto-fill! User must type manually
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [otpCopied, setOtpCopied] = useState(false);

  // Step 2: Loan Category
  const [selectedLoanType, setSelectedLoanType] = useState<'Personal Loan' | 'Business Loan'>('Personal Loan');

  // Step 3: Selected Lender
  const [selectedPartner, setSelectedPartner] = useState<PartnerOption | null>(null);

  // Step 4: FinCred Application Form Fields (No Document Uploads)
  const [fullName, setFullName] = useState(customer?.fullName || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [dob, setDob] = useState(customer?.dob || customer?.dateOfBirth || '');
  const [panNumber, setPanNumber] = useState(customer?.panNumber || '');
  const [pincode, setPincode] = useState(customer?.pincode || '');
  const [amountRequested, setAmountRequested] = useState<string>(customer?.requiredLoanAmount ? String(customer.requiredLoanAmount) : '');

  // Personal Loan Fields
  const [employmentType, setEmploymentType] = useState(customer?.employmentType || 'Salaried');
  const [monthlyIncome, setMonthlyIncome] = useState<string>(customer?.monthlyIncome ? String(customer.monthlyIncome) : '');
  const [salaryMode, setSalaryMode] = useState('Bank Transfer');
  const [existingLoan, setExistingLoan] = useState('None');

  // Business Loan Fields
  const [businessType, setBusinessType] = useState('Proprietorship');
  const [businessVintage, setBusinessVintage] = useState('1 - 3 years');
  const [businessTurnover, setBusinessTurnover] = useState('₹15L - ₹30L');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [existingBusinessLoan, setExistingBusinessLoan] = useState('None');

  const [consentChecked, setConsentChecked] = useState(true);

  // Submission & Redirect State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [savedLeadId, setSavedLeadId] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If customer is already logged in on mount, move directly to Loan Type Selection
  useEffect(() => {
    if (isCustomerLoggedIn && customer) {
      setMobileNumber(customer.mobileNumber);
      if (customer.fullName && customer.fullName !== 'Valued Customer') {
        setFullName(customer.fullName);
      }
      if (customer.email) setEmail(customer.email);
      if (customer.panNumber) setPanNumber(customer.panNumber);
      if (customer.dob) setDob(customer.dob);
      if (customer.pincode) setPincode(customer.pincode);
      if (customer.monthlyIncome) setMonthlyIncome(String(customer.monthlyIncome));
      if (customer.requiredLoanAmount) setAmountRequested(String(customer.requiredLoanAmount));
      if (customer.employmentType) setEmploymentType(customer.employmentType);
      setCurrentStep('LOAN_TYPE_SELECTION');
    }
  }, [isCustomerLoggedIn, customer]);

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

  // Handle mobile number change
  const handleMobileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(val);
    setErrorMessage('');

    if (val.length === 10 && /^[6-9]\d{9}$/.test(val)) {
      setIsCheckingMobile(true);
      try {
        const check = await checkMobileRegistration(val);
        setIsRegisteredNumber(check.isRegistered);
        if (check.isRegistered && check.customerName) {
          setRegisteredName(check.customerName);
          setFullName(check.customerName);
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

    if (!/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await sendOtp(mobileNumber.trim());
      setOtpSent(true);
      setTimer(45);
      setCanResend(false);
      setOtpValues(['', '', '', '', '', '']); // NO auto-fill!

      // Triggers top notification banner & in-card notification
      const receivedOtp = res.testOtp || '123456';
      setActiveOtpCode(receivedOtp);

      if (res.isRegistered !== undefined) {
        setIsRegisteredNumber(res.isRegistered);
        if (res.customerName) {
          setRegisteredName(res.customerName);
          setFullName(res.customerName);
        }
      }

      // Log activity
      logUserActivity({
        activityType: 'auth_attempt',
        description: 'Customer requested OTP verification',
        userMobile: mobileNumber.trim(),
        metadata: { mobile: mobileNumber.trim() }
      });

      setTimeout(() => {
        const card = document.getElementById('otp-verification-card');
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        inputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send OTP. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP inputs handling (NO auto-fill, manual entry)
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

  // Verify OTP & Proceed directly to Loan Selection (no password required)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');

    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await verifyOtp(mobileNumber.trim(), fullOtp, registeredName || fullName || 'Valued Borrower');
      if (res.success && res.customer && res.token) {
        setCustomerSession(res.customer, res.token);
        if (res.customer.fullName && res.customer.fullName !== 'Valued Customer') {
          setFullName(res.customer.fullName);
        }
        if (res.customer.email) setEmail(res.customer.email);
        if (res.customer.panNumber) setPanNumber(res.customer.panNumber);
        if (res.customer.dob) setDob(res.customer.dob);
        if (res.customer.pincode) setPincode(res.customer.pincode);
        if (res.customer.monthlyIncome) setMonthlyIncome(String(res.customer.monthlyIncome));
        if (res.customer.requiredLoanAmount) setAmountRequested(String(res.customer.requiredLoanAmount));

        // Log timeline activity
        logUserActivity({
          activityType: 'auth_success',
          description: 'Mobile number entered and verified successfully',
          customerId: res.customer.customerId,
          userMobile: mobileNumber.trim(),
          userName: res.customer.fullName,
          metadata: { mobile: mobileNumber.trim() }
        });

        // Navigate customer directly to Dashboard set to Home (First login home option)
        navigate('/dashboard?tab=home');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid verification code. Please check and re-enter.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle Loan Type Selection
  const handleSelectLoanType = (type: 'Personal Loan' | 'Business Loan') => {
    setSelectedLoanType(type);
    logUserActivity({
      activityType: 'category_view',
      description: `${type} selected`,
      customerId: customer?.customerId,
      userMobile: mobileNumber.trim(),
      userName: fullName || customer?.fullName,
      metadata: { category: type }
    });
    setCurrentStep('LENDER_SELECTION');
  };

  // Lender Partner Configurations using real URLs (Requirement 4)
  const personalLoanPartners: PartnerOption[] = [
    {
      id: 'werize',
      name: 'WeRize',
      badge: 'Salaried & Self-Employed',
      amountRange: '₹50,000 – ₹5,00,000',
      features: 'Flexible repayment tenure, customized credit assessment',
      description: 'Specially designed personal loans for salaried and self-employed individuals across India.',
      urlKey: 'werize',
      icon: Landmark,
      iconBg: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'ruloans',
      name: 'Ruloans',
      badge: 'Multi-Bank Aggregator',
      amountRange: '₹50,000 – ₹25,00,000',
      features: '275+ Partner Banks & NBFCs, lowest interest comparison',
      description: 'Pan-India loan aggregator comparing pre-approved offers from leading Indian banks.',
      urlKey: 'ruloans',
      icon: Building2,
      iconBg: 'bg-cyan-50 border-cyan-200',
      iconColor: 'text-cyan-600'
    },
    {
      id: 'choice-connect',
      name: 'Choice Connect',
      badge: 'Pre-Approved Offers',
      amountRange: '₹25,000 – ₹10,00,000',
      features: 'Instant paperless verification, quick digital sanction',
      description: 'Digital credit platform offering personalized loan eligibility from top financial partners.',
      urlKey: 'choice_connect',
      icon: ShieldCheck,
      iconBg: 'bg-rose-50 border-rose-200',
      iconColor: 'text-rose-600'
    },
    {
      id: 'true-balance',
      name: 'True Balance',
      badge: 'Digital Sanction',
      amountRange: '₹1,000 – ₹5,00,000',
      features: 'Fast mobile credit, minimal documentation',
      description: 'Instant paperless credit assistance directly processed through mobile application.',
      urlKey: 'true_balance',
      icon: Zap,
      iconBg: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600'
    }
  ];

  const businessLoanPartners: PartnerOption[] = [
    {
      id: 'ruloans-business',
      name: 'Ruloans',
      badge: 'Multi-Bank Business Credit',
      amountRange: '₹15,00,000 – ₹30,00,000',
      features: 'Working capital, machinery loans & expansion finance',
      description: 'High-ticket business loan solutions from India’s leading commercial banks and NBFCs.',
      urlKey: 'ruloans',
      icon: Building2,
      iconBg: 'bg-cyan-50 border-cyan-200',
      iconColor: 'text-cyan-600'
    },
    {
      id: 'choice-connect-business',
      name: 'Choice Connect',
      badge: 'High-Ticket Capital',
      amountRange: '₹15,00,000 – ₹30,00,000',
      features: 'Collateral-free business funding, fast processing',
      description: 'Customized business expansion loans for MSMEs and registered enterprises.',
      urlKey: 'choice_connect',
      icon: Briefcase,
      iconBg: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      id: 'werize-business',
      name: 'WeRize',
      badge: 'Small Business & Merchant Loan',
      amountRange: '₹1,00,000 – ₹5,00,000',
      features: 'Fast retail working capital, simple documentation',
      description: 'Credit solutions tailored for small shopkeepers, traders and local businesses.',
      urlKey: 'werize',
      icon: Landmark,
      iconBg: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600'
    }
  ];

  const currentPartners = selectedLoanType === 'Personal Loan' ? personalLoanPartners : businessLoanPartners;

  const getPartnerUrl = (key: 'werize' | 'ruloans' | 'choice_connect' | 'true_balance'): string => {
    switch (key) {
      case 'werize':
        return settings.personalBusinessLoanUrl || 'https://www.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU';
      case 'ruloans':
        return settings.allTypeLoanUrl || 'https://sdk.ruloans.com/?client_type=b2b_app&loan_type=personal_loan&auth_token=586994%7Cl5C67vJQndNESetPp7pcWqcejaZd4iN3VtJZLPKze6dedf38';
      case 'choice_connect':
        return settings.choiceConnectPersonalLoanUrl || 'https://choiceconnect.in/referral/loan/personal-loan/QzAxMTkyOTg=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r';
      case 'true_balance':
        return settings.instantLoanUrl || 'https://truebalance.onelink.me/bMoN/dlfim5uk';
      default:
        return 'https://choiceconnect.in';
    }
  };

  // Step 3: Handle Partner Selection -> Open FinCred Application Form
  const handleSelectPartner = (partner: PartnerOption) => {
    setSelectedPartner(partner);
    setErrorMessage('');

    logUserActivity({
      activityType: 'partner_click',
      description: `${partner.name} selected`,
      customerId: customer?.customerId,
      userMobile: mobileNumber.trim(),
      userName: fullName || customer?.fullName,
      metadata: { partner: partner.name, category: selectedLoanType }
    });

    logUserActivity({
      activityType: 'application_step',
      description: 'Application form opened',
      customerId: customer?.customerId,
      userMobile: mobileNumber.trim(),
      userName: fullName || customer?.fullName,
      metadata: { partner: partner.name }
    });

    setCurrentStep('APPLICATION_FORM');
  };

  // Step 5 & 6: Validate & SAVE DATA TO BACKEND BEFORE REDIRECT (Mandatory Requirement 6)
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full legal name as per PAN card.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!dob.trim()) {
      setErrorMessage('Please enter your date of birth.');
      return;
    }

    if (!panNumber.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.trim().toUpperCase())) {
      setErrorMessage('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
      return;
    }

    if (!pincode.trim() || pincode.trim().length !== 6) {
      setErrorMessage('Please enter a valid 6-digit residential pincode.');
      return;
    }

    if (!amountRequested || Number(amountRequested) <= 0) {
      setErrorMessage('Please enter the required loan amount.');
      return;
    }

    if (!consentChecked) {
      setErrorMessage('Please agree to authorize FinCred to submit your application.');
      return;
    }

    if (!selectedPartner) {
      setErrorMessage('Please select a lending partner.');
      return;
    }

    setIsSubmitting(true);

    const partnerUrl = getPartnerUrl(selectedPartner.urlKey);

    try {
      // 1. Save all details to backend database FIRST
      const res = await submitLoanApplication({
        fullName: fullName.trim(),
        applicantName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim().toLowerCase(),
        dob: dob.trim(),
        panNumber: panNumber.trim().toUpperCase(),
        pincode: pincode.trim(),
        loanCategory: selectedLoanType,
        partnerName: selectedPartner.name,
        selectedOptionName: selectedPartner.name,
        destinationUrl: partnerUrl,
        amountRequested: Number(amountRequested),
        customerId: customer?.customerId,

        // Personal loan fields
        ...(selectedLoanType === 'Personal Loan' && {
          employmentType,
          monthlyIncome: Number(monthlyIncome || 0),
          existingLoan
        }),

        // Business loan fields
        ...(selectedLoanType === 'Business Loan' && {
          businessType,
          businessVintage,
          turnover: businessTurnover,
          existingBusinessLoan
        })
      });

      if (!res.success || !res.application) {
        throw new Error((res as any).error || res.message || 'Failed to save application to database.');
      }

      const appId = res.applicationId || res.application.applicationId;
      setSavedLeadId(appId);
      setRedirectUrl(partnerUrl);

      // Log activities in timeline
      logUserActivity({
        activityType: 'application_submit',
        description: 'Application form submitted',
        customerId: customer?.customerId,
        userMobile: mobileNumber.trim(),
        userName: fullName.trim(),
        metadata: { applicationId: appId, partner: selectedPartner.name, category: selectedLoanType }
      });

      logUserActivity({
        activityType: 'application_step',
        description: 'Data successfully saved',
        customerId: customer?.customerId,
        userMobile: mobileNumber.trim(),
        userName: fullName.trim(),
        metadata: { applicationId: appId }
      });

      logUserActivity({
        activityType: 'partner_redirect',
        description: `Redirect completed to ${selectedPartner.name}`,
        customerId: customer?.customerId,
        userMobile: mobileNumber.trim(),
        userName: fullName.trim(),
        metadata: { applicationId: appId, url: partnerUrl }
      });

      // Move to Redirect Step
      setCurrentStep('SAVE_AND_REDIRECT');

      // Trigger actual redirect in new window after saving
      window.open(partnerUrl, '_blank', 'noopener,noreferrer');

    } catch (err: any) {
      // If saving fails: DO NOT REDIRECT
      console.error('Save failed:', err);
      setErrorMessage("We couldn't save your application. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alternative Lender Flow: return to lender list while preserving data (Requirement 10)
  const handleAlternativeLender = () => {
    setCurrentStep('LENDER_SELECTION');
  };

  return (
    <div className="w-full">
      {/* Top Floating OTP Alert Banner (NO AUTO-FILL, MANUAL ENTRY) */}
      <SmsNotificationBanner
        otp={activeOtpCode || ''}
        mobileNumber={mobileNumber}
        onClose={() => setActiveOtpCode(null)}
      />

      {/* ============================================================== */}
      {/* STEP 1: FIRST SCREEN – HERO LANDING & MOBILE NUMBER ONLY        */}
      {/* ============================================================== */}
      {currentStep === 'MOBILE_INPUT' ? (
        <div className="relative w-full min-h-[92vh] overflow-hidden bg-gradient-to-b from-blue-100/70 via-sky-50/50 to-white pb-14 sm:pb-20">
          
          {/* ============================================================ */}
          {/* HIGH-IMPACT FULL-WIDTH TOP PROMOTIONAL BANNER                */}
          {/* ============================================================ */}
          <div className="w-full relative overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 border-b border-blue-800/40 shadow-xl">
            {/* Background 3D Graphic */}
            <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
              <img
                src="/banner-3d-top.jpg"
                alt="FinCred 3D Banner Graphic"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Glowing Accent Flares */}
            <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Half 1: High-Impact Catchy Hinglish / English Copy */}
                <div className="lg:col-span-7 space-y-2.5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Digital Loan Fest • 2026 Special</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-['Outfit',sans-serif] leading-tight">
                    Sapno Ko Do Nayi Udaan
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-300">
                      Instant Loan Assistance Up to ₹30 Lakhs*
                    </span>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    Compare offers across 250+ RBI-registered NBFCs & Banks at competitive interest rates with zero branch visits and paperless processing.
                  </p>

                  {/* Feature Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-slate-200">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      5-Min Digital Sanction
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Zero Physical Docs
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15">
                      <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                      250+ Partner Network
                    </span>
                  </div>
                </div>

                {/* Half 2: 3D Highlight Stats & Quick Action */}
                <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {/* Stat 1 */}
                    <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-left shadow-lg">
                      <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-cyan-300 block">
                        Interest Rates
                      </span>
                      <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                        10.49% <span className="text-xs font-normal text-slate-300">p.a.*</span>
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">Starting range</span>
                    </div>

                    {/* Stat 2 */}
                    <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-left shadow-lg">
                      <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-300 block">
                        Loan Sanctions
                      </span>
                      <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                        ₹30 Lakhs
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">Max assistance</span>
                    </div>
                  </div>

                  {/* Quick Scroll Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('hero-mobile-input');
                      if (input) {
                        input.focus();
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="w-full py-3 px-5 rounded-2xl font-black text-xs sm:text-sm text-slate-900 bg-gradient-to-r from-cyan-400 via-sky-300 to-white hover:brightness-110 shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Check Your Loan Eligibility Now</span>
                    <ArrowRight className="w-4 h-4 text-slate-900" />
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* 3D Abstract Floating Shapes Background */}
          {/* 3D Sphere 1 */}
          <div className="absolute top-48 right-12 w-20 h-20 rounded-full bg-gradient-to-tr from-blue-400/40 via-sky-300/50 to-white/70 shadow-2xl shadow-blue-500/30 backdrop-blur-sm pointer-events-none transform rotate-12 animate-pulse" />
          {/* 3D Sphere 2 */}
          <div className="absolute top-96 left-8 w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400/40 to-blue-600/30 shadow-xl shadow-cyan-500/20 backdrop-blur-sm pointer-events-none" />
          {/* Soft-glow decorative blobs */}
          <div className="absolute top-28 right-0 -mr-20 w-88 sm:w-[480px] h-88 sm:h-[480px] rounded-full bg-gradient-to-b from-blue-300/30 via-sky-200/40 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-0 -ml-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-gradient-to-tr from-sky-300/30 to-indigo-200/30 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-88 h-88 rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />

          {/* Floating 3D Gold Accent Coin Pill */}
          <div className="hidden sm:flex absolute top-64 right-1/3 items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 pointer-events-none transform -rotate-6">
            <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-amber-600">₹</span>
            <span>Fast Disbursement</span>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 relative z-10">
            {/* Centered Main Content */}
            <div className="max-w-xl mx-auto space-y-4">
              {/* 4 Mini Benefit Circular Icon Cards */}
              <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100/90 shadow-xs w-full">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {/* Personal Loan */}
                    <div className="flex flex-col items-center group cursor-default">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-1.5 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 leading-tight">Personal</span>
                      <span className="text-[10px] text-slate-500 font-medium">Loan</span>
                    </div>

                    {/* Business Loan */}
                    <div className="flex flex-col items-center group cursor-default">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-1.5 shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 leading-tight">Business</span>
                      <span className="text-[10px] text-slate-500 font-medium">Loan</span>
                    </div>

                    {/* Multiple Lenders */}
                    <div className="flex flex-col items-center group cursor-default">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-violet-600 text-white flex items-center justify-center mb-1.5 shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 leading-tight">Multiple</span>
                      <span className="text-[10px] text-slate-500 font-medium">Lenders</span>
                    </div>

                    {/* Faster Process */}
                    <div className="flex flex-col items-center group cursor-default">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-blue-500 text-white flex items-center justify-center mb-1.5 shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
                        <Zap className="w-4 h-4 fill-white" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 leading-tight">Faster</span>
                      <span className="text-[10px] text-slate-500 font-medium">Process</span>
                    </div>
                  </div>
                </div>

                {/* The Prominent Mobile Number Card */}
                <div id="otp-verification-card" className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-900/10 border border-blue-100/90 max-w-lg space-y-4 scroll-mt-24">
                  {!otpSent ? (
                    /* Sub-step 1A: Mobile Number Field & Continue Button */
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>Mobile Number</span>
                          </label>
                          {isRegisteredNumber === true && (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Existing Customer {registeredName ? `(${registeredName.split(' ')[0]})` : ''}
                            </span>
                          )}
                        </div>

                        {/* Large Rounded Input with Flag +91 */}
                        <div className="relative flex items-center rounded-2xl bg-white border-2 border-blue-200 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition-all overflow-hidden shadow-2xs">
                          {/* Flag + Code */}
                          <div className="flex items-center gap-1.5 pl-3.5 pr-3 py-3.5 bg-slate-50/50 border-r border-slate-200 shrink-0">
                            <span className="text-lg">🇮🇳</span>
                            <span className="text-xs font-bold font-mono text-slate-800">+91</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </div>

                          <input
                            id="hero-mobile-input"
                            type="tel"
                            inputMode="numeric"
                            value={mobileNumber}
                            onChange={handleMobileChange}
                            placeholder="Enter 10-digit mobile number"
                            maxLength={10}
                            autoFocus
                            className="w-full px-4 py-3.5 text-sm font-semibold font-mono text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
                          />

                          <div className="pr-3.5 flex items-center pointer-events-none">
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

                      {/* Primary Continue Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || mobileNumber.length !== 10}
                        className={`w-full py-4 px-6 rounded-2xl font-black text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          mobileNumber.length === 10 && !isSubmitting
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-600/30 active:scale-[0.99]'
                            : 'bg-slate-300 cursor-not-allowed shadow-none'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Connecting Secure Gateway...</span>
                          </>
                        ) : (
                          <>
                            <span>Continue →</span>
                          </>
                        )}
                      </button>

                      {/* Security Disclaimer below button */}
                      <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-500 text-center">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Your details are securely handled and used only for your loan application.</span>
                      </div>
                    </form>
                  ) : (
                    /* Sub-step 1B: OTP Verification (NO auto-fill, manual entry) */
                    <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
                      <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                        <div>
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
                          className="text-[11px] font-bold text-blue-600 hover:underline px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          Change
                        </button>
                      </div>

                      {/* IN-SCREEN LIVE OTP DISPLAY (Always visible directly in customer view!) */}
                      {activeOtpCode && (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 border-2 border-blue-400/70 text-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-blue-600/40 border border-blue-400/50 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5 shadow-sm">
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
                                <span className="text-[10px] text-slate-400 block mt-1">Enter this 6-digit code in the boxes below</span>
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

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Enter 6-Digit OTP</span>
                        </label>

                        {/* 6 Digit Inputs (NO automated auto-fill) */}
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

                      {/* Verify Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || otpValues.join('').length !== 6}
                        className={`w-full py-4 px-6 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          otpValues.join('').length === 6 && !isSubmitting
                            ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-[0.99]'
                            : 'bg-slate-300 cursor-not-allowed shadow-none'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify & Continue →</span>
                          </>
                        )}
                      </button>

                      {/* Resend timer */}
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
                </div>
            </div>

            {/* 4 Trust & Benefits Strip */}
            <div className="mt-8 sm:mt-12 max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl border border-blue-100/80 p-5 sm:p-6 shadow-xl shadow-blue-900/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-center">
                {/* 1. Secure & Protected */}
                <div className="flex flex-col items-center pt-2 md:pt-0">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-xs border border-blue-100">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">100% Secure</span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5">& Protected</span>
                </div>

                {/* 2. Quick & Easy Process */}
                <div className="flex flex-col items-center pt-2 md:pt-0 md:pl-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2 shadow-xs border border-sky-100">
                    <Zap className="w-6 h-6 fill-sky-500 text-sky-500" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Quick & Easy</span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5">Process</span>
                </div>

                {/* 3. No Hidden Charges */}
                <div className="flex flex-col items-center pt-2 md:pt-0 md:pl-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 shadow-xs border border-indigo-100">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">No Hidden</span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5">Charges</span>
                </div>

                {/* 4. Dedicated Support */}
                <div className="flex flex-col items-center pt-2 md:pt-0 md:pl-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-xs border border-blue-100">
                    <Headphones className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Dedicated</span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5">Support</span>
                </div>
              </div>
            </div>

            {/* 250+ Banks & NBFCs Supported Section */}
            <div className="mt-4 sm:mt-5 max-w-4xl mx-auto bg-white rounded-3xl border border-blue-100/90 p-4 sm:p-5 shadow-lg shadow-blue-900/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">Trusted by</span>
                  <div className="text-sm font-black text-slate-900 font-['Outfit',sans-serif]">250+ Banks & NBFCs</div>
                </div>
              </div>

              <div className="hidden md:block h-8 w-[1px] bg-slate-200" />

              {/* Bank Logos matching reference */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {/* SBI */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90">
                  <div className="w-4 h-4 rounded-full bg-sky-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <span className="text-xs font-black text-sky-900 font-mono tracking-wider">SBI</span>
                </div>

                {/* HDFC BANK */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90">
                  <div className="w-3.5 h-3.5 bg-blue-900 flex items-center justify-center text-[7px] text-white font-bold p-0.5 border border-red-500">
                    H
                  </div>
                  <span className="text-xs font-black text-blue-950 font-mono tracking-tight">HDFC BANK</span>
                </div>

                {/* ICICI Bank */}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90">
                  <span className="text-xs font-extrabold text-orange-600 font-sans tracking-tight">ICICI</span>
                  <span className="text-[11px] font-bold text-slate-800">Bank</span>
                </div>

                {/* AXIS BANK */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90">
                  <div className="w-3.5 h-3.5 bg-rose-800 rounded-sm transform rotate-45" />
                  <span className="text-xs font-black text-rose-900 font-mono tracking-tight">AXIS BANK</span>
                </div>

                {/* + 246 More */}
                <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs hover:bg-blue-100 transition-colors cursor-pointer">
                  + 246 More
                </div>
              </div>
            </div>

            {/* Bottom Footer Accent */}
            <div className="mt-8 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
              <div className="h-[1px] w-12 bg-slate-200" />
              <span className="font-['Outfit',sans-serif] font-bold text-slate-500">
                Fin<span className="text-blue-600">Cred</span> • Loan Made Simple
              </span>
              <div className="h-[1px] w-12 bg-slate-200" />
            </div>

          </div>
        </div>
      ) : (
        <div className="w-full max-w-xl mx-auto py-6 sm:py-10 px-4">
          {/* ============================================================== */}
          {/* STEP 2: LOAN TYPE SELECTION (Requirement 3)                    */}
          {/* ============================================================== */}
      {currentStep === 'LOAN_TYPE_SELECTION' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Step 1 of 3
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif]">
              Choose Loan Requirement
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Select the financing category that best fits your immediate need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: PERSONAL LOAN */}
            <div
              onClick={() => handleSelectLoanType('Personal Loan')}
              className="p-5 sm:p-6 rounded-3xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-tight">
                    Instant Disbursal
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1 font-['Outfit',sans-serif] group-hover:text-blue-600 transition-colors">
                    PERSONAL LOAN
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-700 block mt-0.5">
                    ₹10,000 – ₹5,00,000
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Personal expenses, emergency needs, education, travel & more.
                </p>
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>Select Personal Loan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: BUSINESS LOAN */}
            <div
              onClick={() => handleSelectLoanType('Business Loan')}
              className="p-5 sm:p-6 rounded-3xl border-2 border-slate-200 hover:border-purple-600 hover:bg-purple-50/30 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase tracking-tight">
                    Growth Capital
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1 font-['Outfit',sans-serif] group-hover:text-purple-600 transition-colors">
                    BUSINESS LOAN
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-700 block mt-0.5">
                    ₹15,00,000 – ₹30,00,000
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Business expansion, working capital & business requirements.
                </p>
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-xl bg-purple-600 group-hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>Select Business Loan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: LENDER / LOAN OPTIONS (Requirement 4)                  */}
      {/* ============================================================== */}
      {currentStep === 'LENDER_SELECTION' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep('LOAN_TYPE_SELECTION')}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Loan Type</span>
            </button>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {selectedLoanType}
            </span>
          </div>

          <div className="text-left space-y-1">
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
              Select Preferred Lending Partner
            </h2>
            <p className="text-xs text-slate-600">
              Choose from our verified partner network configured for {selectedLoanType}:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentPartners.map(partner => {
              const Icon = partner.icon;
              return (
                <div
                  key={partner.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all flex flex-col justify-between space-y-3 group shadow-2xs hover:shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl ${partner.iconBg} border flex items-center justify-center ${partner.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        {partner.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors font-['Outfit',sans-serif]">
                        {partner.name}
                      </h4>
                      <span className="text-xs font-mono font-bold text-emerald-700 block mt-0.5">
                        {partner.amountRange}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-snug">
                      {partner.description}
                    </p>

                    <div className="pt-1 text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{partner.features}</span>
                    </div>
                  </div>

                  {/* "Apply Now →" button */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSelectPartner(partner)}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>Apply Now →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 4: CUSTOMER APPLICATION FORM (Requirement 5)              */}
      {/* ============================================================== */}
      {currentStep === 'APPLICATION_FORM' && selectedPartner && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={handleAlternativeLender}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Lenders</span>
            </button>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Partner: {selectedPartner.name}
            </span>
          </div>

          <div className="text-left space-y-1">
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
              {selectedLoanType} Application
            </h2>
            <p className="text-xs text-slate-500">
              Complete your basic details to submit your application for {selectedPartner.name}.
            </p>
          </div>

          {/* Zero Document Upload Notification Pill */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Zero Document Uploads on FinCred</strong>: Your application is 100% digital. No photo or PDF file required.</span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* The FinCred Loan Application Form (No Document Uploads) */}
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Full Name */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800">
                  Full Legal Name (as on PAN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              {/* Mobile Number (Pre-filled and Verified) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Mobile Number (Verified)
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 flex items-center justify-between">
                  <span>+91 {mobileNumber}</span>
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-bold">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              {/* PAN Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  PAN Card Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={panNumber}
                  onChange={e => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold uppercase text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              {/* Required Loan Amount */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Required Loan Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={amountRequested}
                  onChange={e => setAmountRequested(e.target.value)}
                  placeholder="e.g. 150000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              {/* Current Pincode */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Current Residential Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 110001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              {/* Personal Loan Specific Fields */}
              {selectedLoanType === 'Personal Loan' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Employment Type</label>
                    <select
                      value={employmentType}
                      onChange={e => setEmploymentType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                    >
                      <option value="Salaried">Salaried (Private / Govt)</option>
                      <option value="Self Employed">Self-Employed Professional</option>
                      <option value="Business Owner">Small Business Owner</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Monthly Net Income (₹)</label>
                    <input
                      type="number"
                      required
                      value={monthlyIncome}
                      onChange={e => setMonthlyIncome(e.target.value)}
                      placeholder="e.g. 35000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Salary Receipt Mode</label>
                    <select
                      value={salaryMode}
                      onChange={e => setSalaryMode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                    >
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Existing Loan EMIs</label>
                    <select
                      value={existingLoan}
                      onChange={e => setExistingLoan(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                    >
                      <option value="None">None (No Active EMIs)</option>
                      <option value="Below ₹10,000">Below ₹10,000 / month</option>
                      <option value="₹10,000 - ₹25,000">₹10,000 – ₹25,000 / month</option>
                      <option value="Above ₹25,000">Above ₹25,000 / month</option>
                    </select>
                  </div>
                </>
              ) : (
                /* Business Loan Specific Fields */
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Business Constitution</label>
                    <select
                      value={businessType}
                      onChange={e => setBusinessType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                    >
                      <option value="Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership Firm</option>
                      <option value="Private Limited">Private Limited Company</option>
                      <option value="LLP">Limited Liability Partnership (LLP)</option>
                      <option value="Individual / Retailer">Retail Shop / Trader</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Business Vintage</label>
                    <select
                      value={businessVintage}
                      onChange={e => setBusinessVintage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                    >
                      <option value="Less than 1 year">Less than 1 year</option>
                      <option value="1 - 3 years">1 – 3 years</option>
                      <option value="3 - 5 years">3 – 5 years</option>
                      <option value="5+ years">More than 5 years</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Annual Business Turnover</label>
                    <select
                      value={businessTurnover}
                      onChange={e => setBusinessTurnover(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                    >
                      <option value="Less than ₹15 Lakhs">Less than ₹15 Lakhs</option>
                      <option value="₹15L - ₹30L">₹15 Lakhs – ₹30 Lakhs</option>
                      <option value="₹30L - ₹1 Crore">₹30 Lakhs – ₹1 Crore</option>
                      <option value="Above ₹1 Crore">Above ₹1 Crore</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Existing Business Loan</label>
                    <select
                      value={existingBusinessLoan}
                      onChange={e => setExistingBusinessLoan(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                    >
                      <option value="None">None (No existing business debt)</option>
                      <option value="Active Working Capital">Active Working Capital / CC / OD</option>
                      <option value="Term Loan Running">Term Loan Running</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Consent checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
                />
                <span className="text-[11px] text-slate-600 leading-tight">
                  I authorize FinCred to securely store my application and transmit my details to <strong>{selectedPartner.name}</strong> for loan underwriting.
                </span>
              </label>
            </div>

            {/* Primary Submit Button: "Submit & Proceed to [Partner] →" */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-[0.99]'
                    : 'bg-slate-300 cursor-not-allowed shadow-none'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Database Before Redirect...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Proceed to {selectedPartner.name} →</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 5: SAVE & REDIRECT SUCCESS VIEW (Requirement 6)           */}
      {/* ============================================================== */}
      {currentStep === 'SAVE_AND_REDIRECT' && selectedPartner && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Data Successfully Saved
            </span>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
              Application Recorded!
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your application details have been safely registered with FinCred. You are being redirected to <strong>{selectedPartner.name}</strong> to complete your partner journey.
            </p>
          </div>

          {/* Lead ID Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-left space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Your FinCred Lead ID</span>
            <div className="flex items-center justify-between">
              <span className="text-base font-mono font-black text-blue-700">
                {savedLeadId || '#FC-CONFIRMED'}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Saved in Admin
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Partner: {selectedPartner.name} • Amount: ₹{Number(amountRequested).toLocaleString('en-IN')}
            </p>
          </div>

          {/* Action to manually click redirect if popup was blocked */}
          {redirectUrl && (
            <div className="pt-2 space-y-3">
              <a
                href={redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-sm mx-auto py-3.5 px-6 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Continue to {selectedPartner.name}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Alternative Lender Flow (Requirement 10) */}
              <div>
                <button
                  type="button"
                  onClick={handleAlternativeLender}
                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Explore Another Lending Partner (Without Re-entering Details)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
        </div>
      )}
    </div>
  );
};
