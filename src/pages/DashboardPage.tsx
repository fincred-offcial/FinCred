import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  Bell,
  ArrowRight,
  CreditCard,
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Landmark,
  Building2,
  Check,
  X,
  Plus,
  LogOut,
  SlidersHorizontal,
  Smartphone,
  Phone,
  Mail,
  Calendar,
  Layers,
  Search,
  Eye,
  FileCheck2,
  HelpCircle,
  TrendingUp,
  Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import {
  fetchCustomerApplications,
  fetchCustomerNotifications,
  uploadApplicationDocument,
  logUserActivity,
  updateCustomerProfile
} from '../services/api.js';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestBrowserNotificationPermission,
  listenForLiveNotifications,
  showBrowserNotification
} from '../services/notificationService.js';
import { LoanApplication, ApplicationDocument, CustomerNotification, LoanCategory } from '../types.js';
import { LoanApplicationWizard } from '../components/portal/LoanApplicationWizard.js';
import { EarnAndReferSection } from '../components/portal/EarnAndReferSection.js';
import { BasicLenderApplyModal } from '../components/portal/BasicLenderApplyModal.js';

interface LoanCardItem {
  id: string;
  name: string;
  category: 'Personal' | 'Business' | 'Instant' | 'Aggregator' | 'Payment';
  amountRange: string;
  tag: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  partnerKey?: 'true_balance' | 'werize' | 'ruloans' | 'choice_connect' | 'navi';
  isExternal?: boolean;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { customer, isCustomerLoggedIn, customerLogout, settings, openLoanModal, openInstantLoanModal, openCibilModal } = useAuth();

  // Active section tab: 'home' | 'options' | 'applications' | 'documents' | 'notifications' | 'profile'
  const tabParam = searchParams.get('tab') || 'home';
  const [activeTab, setActiveTab] = useState<string>(tabParam);

  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Category Selection Modal state (Requirement 6)
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<'Personal Loan' | 'Business Loan' | null>(null);

  // New Loan Wizard Modal
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardCategory, setWizardCategory] = useState<LoanCategory>('Personal Loan');

  // Push notification permission state
  const [pushPermission, setPushPermission] = useState<string>(() => getNotificationPermission());
  const [pushFeedback, setPushFeedback] = useState<string | null>(null);

  // Document upload state
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: customer?.fullName || '',
    email: customer?.email || '',
    dob: customer?.dob || customer?.dateOfBirth || '',
    panNumber: customer?.panNumber || '',
    pincode: customer?.pincode || '',
    employmentType: customer?.employmentType || 'Salaried',
    monthlyIncome: customer?.monthlyIncome || '',
    requiredLoanAmount: customer?.requiredLoanAmount || ''
  });
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Category filter on 'options' tab
  const [optionCategoryFilter, setOptionCategoryFilter] = useState<string>('ALL');

  // Sync tab with URL
  useEffect(() => {
    if (tabParam) {
      if (tabParam === 'my_loan' || tabParam === 'status') {
        setActiveTab('applications');
      } else {
        setActiveTab(tabParam);
      }
    }
  }, [tabParam]);

  const setTab = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Load customer data from backend
  const loadCustomerData = async () => {
    if (!customer) return;
    try {
      const [apps, notifs] = await Promise.all([
        fetchCustomerApplications(customer.customerId, customer.mobileNumber),
        fetchCustomerNotifications(customer.customerId, customer.mobileNumber)
      ]);
      setApplications(apps || []);
      setNotifications(notifs || []);
    } catch (err) {
      console.warn('Error loading customer portal data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isCustomerLoggedIn || !customer) {
      navigate('/login');
      return;
    }
    loadCustomerData();

    // Setup real-time listener for incoming broadcast/push notifications
    const unsub = listenForLiveNotifications(
      customer.customerId,
      customer.mobileNumber,
      newNotif => {
        setNotifications(prev => [newNotif, ...prev.filter(n => n.id !== newNotif.id)]);
      }
    );

    return () => {
      unsub();
    };
  }, [customer, isCustomerLoggedIn, navigate]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCustomerData();
  };

  const handleRequestPush = async () => {
    const granted = await requestBrowserNotificationPermission();
    const current = getNotificationPermission();
    setPushPermission(current);
    if (granted) {
      setPushFeedback('Push notifications activated for Chrome & Mobile Web!');
      showBrowserNotification('🔔 FINCRED Notifications Active', {
        body: 'You will now receive instant loan status and offer alerts!'
      });
      setTimeout(() => setPushFeedback(null), 4000);
    } else {
      setPushFeedback('Notification permission not granted. You can enable it anytime in browser settings.');
      setTimeout(() => setPushFeedback(null), 4000);
    }
  };

  // Basic Lender Application Modal (Required: Name, Mobile, Email, PAN, DOB before redirect)
  const [basicApplyModal, setBasicApplyModal] = useState<{
    isOpen: boolean;
    lenderName: string;
    lenderTag?: string;
    lenderAmount?: string;
    lenderUrl: string;
    category?: string;
  }>({
    isOpen: false,
    lenderName: '',
    lenderTag: '',
    lenderAmount: '',
    lenderUrl: '',
    category: 'Personal Loan'
  });

  const handlePartnerRedirect = (url: string, partnerName: string, category: string, amountRange?: string, tag?: string) => {
    setBasicApplyModal({
      isOpen: true,
      lenderName: partnerName,
      lenderTag: tag || 'RBI Registered Partner',
      lenderAmount: amountRange,
      lenderUrl: url,
      category: category || 'Personal Loan'
    });
  };

  const handleOpenCategoryModal = (cat: 'Personal Loan' | 'Business Loan') => {
    setSelectedCategoryModal(cat);
  };

  const handleStartInAppApplication = (cat: LoanCategory) => {
    setWizardCategory(cat);
    setIsWizardOpen(true);
    setSelectedCategoryModal(null);
  };

  // Primary active application
  const activeApp: LoanApplication | null = applications.length > 0 ? applications[0] : null;

  // Documents
  const activeDocs: ApplicationDocument[] = activeApp?.documents && activeApp.documents.length > 0
    ? activeApp.documents
    : [
        { id: 'doc-pan', name: 'PAN Card', docType: 'PAN', fileName: '', fileUrl: '', status: 'PENDING' },
        { id: 'doc-aadhaar', name: 'Aadhaar Card (Front & Back)', docType: 'AADHAAR', fileName: '', fileUrl: '', status: 'PENDING' },
        { id: 'doc-statement', name: 'Bank Statement (Last 3 Months)', docType: 'BANK_STATEMENT', fileName: '', fileUrl: '', status: 'PENDING' },
        { id: 'doc-income', name: 'Salary Slip / ITR / Business Proof', docType: 'SALARY_SLIP', fileName: '', fileUrl: '', status: 'PENDING' }
      ];

  const handleDocUpload = async (docType: string, docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeApp) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadFeedback({ type: 'error', message: 'File exceeds 5MB limit. Please upload a smaller file.' });
      return;
    }

    setUploadingDocId(docType);
    setUploadFeedback(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const fileData = event.target?.result as string;
          const res = await uploadApplicationDocument({
            applicationId: activeApp.applicationId,
            docType: docType as any,
            name: docName,
            fileName: file.name,
            fileBase64: fileData,
            mimeType: file.type
          });

          if (res.success && res.application) {
            setApplications(prev =>
              prev.map(app => (app.applicationId === res.application.applicationId ? res.application : app))
            );
            setUploadFeedback({ type: 'success', message: `${docName} uploaded successfully! Verification in progress.` });
          }
        } catch (err: any) {
          setUploadFeedback({ type: 'error', message: err.message || 'Upload failed. Please try again.' });
        } finally {
          setUploadingDocId(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadFeedback({ type: 'error', message: err.message || 'Upload failed.' });
      setUploadingDocId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setProfileFeedback(null);
    try {
      const res = await updateCustomerProfile(customer.customerId, {
        fullName: profileForm.fullName,
        email: profileForm.email,
        dob: profileForm.dob,
        panNumber: profileForm.panNumber,
        pincode: profileForm.pincode,
        employmentType: profileForm.employmentType,
        monthlyIncome: profileForm.monthlyIncome ? Number(profileForm.monthlyIncome) : undefined,
        requiredLoanAmount: profileForm.requiredLoanAmount ? Number(profileForm.requiredLoanAmount) : undefined
      });
      if (res.success) {
        setProfileFeedback({ type: 'success', message: 'Profile updated successfully!' });
        setIsEditingProfile(false);
      }
    } catch (err: any) {
      setProfileFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    }
  };

  // Provider Data (Requirements 3, 4, 5)
  const loanCards: LoanCardItem[] = [
    {
      id: 'true-balance',
      name: 'True Balance',
      category: 'Instant',
      amountRange: '₹1,000 – ₹5,00,000',
      tag: 'Instant Disbursal',
      description: 'Quick digital sanction with 100% paperless mobile approval',
      icon: Zap,
      iconBg: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      partnerKey: 'true_balance',
      isExternal: true
    },
    {
      id: 'personal-loan-quick',
      name: 'Personal Loan (Quick)',
      category: 'Personal',
      amountRange: '₹10,000 – ₹50,000',
      tag: 'Minimal KYC',
      description: 'Instant pocket loans for emergency and personal expenses',
      icon: User,
      iconBg: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      id: 'personal-loan-general',
      name: 'Personal Loan',
      category: 'Personal',
      amountRange: '₹10,000 – ₹5,00,000',
      tag: 'Lowest Interest',
      description: 'Multi-bank personal loan options with flexible tenures',
      icon: CreditCard,
      iconBg: 'bg-indigo-50 border-indigo-200',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'business-loan-high',
      name: 'Business Loan',
      category: 'Business',
      amountRange: '₹15,00,000 – ₹30,00,000',
      tag: 'High Ticket',
      description: 'Working capital, inventory and business expansion finance',
      icon: Briefcase,
      iconBg: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      id: 'werize',
      name: 'Werize Financial',
      category: 'Personal',
      amountRange: '₹50,000 – ₹5,00,000',
      tag: 'Salaried & Business',
      description: 'Customized credit solutions for tier 2 & tier 3 cities',
      icon: Landmark,
      iconBg: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600',
      partnerKey: 'werize',
      isExternal: true
    },
    {
      id: 'ruloans',
      name: 'Ruloans Aggregator',
      category: 'Aggregator',
      amountRange: '₹50,000 – ₹25,00,000',
      tag: '275+ Banks',
      description: 'Compare offers across India’s leading private & PSU banks',
      icon: Building2,
      iconBg: 'bg-cyan-50 border-cyan-200',
      iconColor: 'text-cyan-600',
      partnerKey: 'ruloans',
      isExternal: true
    },
    {
      id: 'choice-connect',
      name: 'Choice Connect',
      category: 'Personal',
      amountRange: '₹25,000 – ₹10,00,000',
      tag: 'Pre-Approved',
      description: 'Instant paperless personal loan offers from top NBFCs',
      icon: ShieldCheck,
      iconBg: 'bg-rose-50 border-rose-200',
      iconColor: 'text-rose-600',
      partnerKey: 'choice_connect',
      isExternal: true
    },
    {
      id: 'navi-upi',
      name: 'Navi Safe UPI',
      category: 'Payment',
      amountRange: 'Zero Fee UPI',
      tag: 'NPCI Approved',
      description: '24x7 intelligent fraud defense, zero failure rate & cashbacks',
      icon: Smartphone,
      iconBg: 'bg-teal-50 border-teal-200',
      iconColor: 'text-teal-600',
      partnerKey: 'navi',
      isExternal: true
    }
  ];

  const handleCardClick = (card: LoanCardItem) => {
    if (card.partnerKey === 'true_balance') {
      handlePartnerRedirect(settings.instantLoanUrl || 'https://truebalance.onelink.me/bMoN/dlfim5uk', 'True Balance', 'Instant Loan');
    } else if (card.partnerKey === 'werize') {
      handlePartnerRedirect(settings.personalBusinessLoanUrl || 'https://www.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU', 'Werize', 'Personal Loan');
    } else if (card.partnerKey === 'ruloans') {
      handlePartnerRedirect(settings.allTypeLoanUrl || 'https://sdk.ruloans.com/?client_type=b2b_app&loan_type=personal_loan&auth_token=586994%7Cl5C67vJQndNESetPp7pcWqcejaZd4iN3VtJZLPKze6dedf38', 'Ruloans', 'All Type Loan');
    } else if (card.partnerKey === 'choice_connect') {
      handlePartnerRedirect(settings.choiceConnectPersonalLoanUrl || 'https://choiceconnect.in/referral/loan/personal-loan/QzAxMTkyOTg=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r', 'Choice Connect', 'Personal Loan');
    } else if (card.partnerKey === 'navi') {
      handlePartnerRedirect(settings.safeUpiUrl || 'https://r.navi.com/t3HqoB', 'Navi Safe UPI', 'Safe UPI');
    } else if (card.category === 'Business') {
      handleOpenCategoryModal('Business Loan');
    } else {
      handleOpenCategoryModal('Personal Loan');
    }
  };

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-12">
      {/* ============================================================== */}
      {/* TOP HEADER SECTION (Requirement 2)                             */}
      {/* ============================================================== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Left: Branding & Greeting */}
          <div className="flex items-center gap-3">
            {/* Profile Avatar with First Letter */}
            <button
              type="button"
              onClick={() => setTab('profile')}
              title="View Profile"
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 p-[1.5px] shadow-xs cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="w-full h-full bg-blue-600 text-white rounded-[14px] flex items-center justify-center font-black text-sm font-['Outfit',sans-serif]">
                {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'C'}
              </div>
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif] tracking-tight">
                  Hello, {customer.fullName ? customer.fullName.split(' ')[0] : 'Customer'} 👋
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Find the loan option that matches your requirement.
              </p>
            </div>
          </div>

          {/* Right: Notification Icon & Profile / Logout */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('notifications')}
              title="Notifications"
              className={`relative p-2.5 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Earn & Refer Header Action */}
            <button
              type="button"
              onClick={() => setTab('earn')}
              className={`px-3 py-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black ${
                activeTab === 'earn'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-300 text-amber-900 shadow-2xs'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xs:inline">Earn & Refer</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                ₹301
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab('profile')}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-bold ${
                activeTab === 'profile'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={customerLogout}
              title="Logout"
              className="p-2.5 rounded-2xl bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-500 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 space-y-6">
        
        {/* Push Notification Banner for Chrome / Mobile (Requirement from Hindi prompt) */}
        {pushPermission !== 'granted' && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  Enable Instant Loan Alerts in Chrome & Mobile
                </p>
                <p className="text-[11px] text-blue-100 leading-tight">
                  Get real-time loan approval, document updates & special low-interest offers directly on your device.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRequestPush}
              className="px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-black shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Allow Notifications</span>
            </button>
          </div>
        )}

        {pushFeedback && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pushFeedback}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: HOME (Dashboard Overview & Compact Loan Cards)          */}
        {/* ============================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Center Golden Coin Instant Loan Feature Card */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-4 sm:p-6 text-white shadow-xl border-2 border-amber-400/40">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  {/* Rotating 3D Golden Coin (Large circle shape) */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-1 shadow-xl shadow-amber-500/40 shrink-0">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-amber-400 via-yellow-200 to-amber-600 flex items-center justify-center border-2 border-amber-100 animate-[spin_6s_linear_infinite]">
                      <span className="text-2xl sm:text-3xl font-black text-amber-950 font-serif drop-shadow-xs select-none">₹</span>
                    </div>
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Pre-Approved Instant Disbursal</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white font-['Outfit',sans-serif]">
                      Instant Cash Loan (₹1,000 – ₹20 Lakhs)
                    </h3>
                    <p className="text-xs text-amber-100/80 mt-0.5">
                      Direct instant disbursement via TrueBalance, Branch & Navi in 5 minutes
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openInstantLoanModal}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-500 hover:to-yellow-400 text-amber-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <span>Open Instant Loan Links</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* "How can we help you today?" & Quick Action Cards (Requirement 8) */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
                How can we help you today?
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3.5">
                {/* 1. Personal Loan */}
                <button
                  type="button"
                  onClick={() => handleOpenCategoryModal('Personal Loan')}
                  className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-2 group-hover:scale-105 transition-transform">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                      Personal Loan
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">₹10K – ₹5 Lakh</span>
                  </div>
                </button>

                {/* 2. Business Loan */}
                <button
                  type="button"
                  onClick={() => handleOpenCategoryModal('Business Loan')}
                  className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-2 group-hover:scale-105 transition-transform">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-purple-600 transition-colors">
                      Business Loan
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">₹15L – ₹30 Lakh</span>
                  </div>
                </button>

                {/* 3. Check Loan Options */}
                <button
                  type="button"
                  onClick={() => setTab('options')}
                  className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-2 group-hover:scale-105 transition-transform">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-600 transition-colors">
                      Check Options
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">All 8 Loan Partners</span>
                  </div>
                </button>

                {/* 4. My Applications */}
                <button
                  type="button"
                  onClick={() => setTab('applications')}
                  className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-600 transition-colors">
                      My Applications
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {applications.length > 0 ? `${applications.length} Active Lead` : 'Track Status'}
                    </span>
                  </div>
                </button>

                {/* 5. Earn & Refer (Requirement 1) */}
                <button
                  type="button"
                  onClick={() => setTab('earn')}
                  className="col-span-2 sm:col-span-1 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/60 p-3.5 sm:p-4 rounded-2xl border-2 border-amber-300 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-xs">
                    <Gift className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-950 block group-hover:text-amber-700 transition-colors">
                      Earn & Refer
                    </span>
                    <span className="text-[10px] text-amber-800 font-bold block">
                      ₹100 App + ₹200/Loan
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Active Application Status Strip (Compact, Not Huge) */}
            {activeApp && (
              <div className="bg-white rounded-2xl border border-blue-200/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-800">
                        {activeApp.applicationId}
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-black tracking-wide bg-blue-100 text-blue-900">
                        {activeApp.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {activeApp.loanCategory || 'Personal Loan'} • Requested ₹{Number(activeApp.amountRequested || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setTab('applications')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <span>View Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* CIBIL Score Improvement Offer Banner */}
            <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/80 text-white shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                      CIBIL Recovery Offer
                    </span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      ₹599 - ₹199 = ₹299 Only
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white font-['Outfit',sans-serif]">
                    Fix Low CIBIL Score & Unlock Branch Pre-Approved Loan Link
                  </h3>
                  <p className="text-xs text-slate-300 leading-snug">
                    Pay ₹299 to official UPI <strong className="font-mono text-cyan-300">fincredlo@nyes</strong>, submit your UTR, and get your dedicated Branch loan link verified directly by FinCred Admin.
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openCibilModal()}
                    className="py-2.5 px-4 rounded-xl font-black text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <TrendingUp className="w-4 h-4 text-amber-300" />
                    <span>Improve CIBIL (Pay ₹299)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openCibilModal(customer?.mobileNumber)}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>Track Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Available Loan Options – SMALL 2-COLUMN CARD GRID (Requirements 3, 4, 8) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                    Available Loan Options
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Data-driven loan amounts & verified partner links
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('options')}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>See All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 2-COLUMN RESPONSIVE CARD GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {loanCards.map(card => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 p-3 sm:p-4 flex flex-col justify-between transition-all group relative overflow-hidden"
                    >
                      <div className="space-y-2">
                        {/* Top: Icon & Category Tag */}
                        <div className="flex items-center justify-between">
                          <div className={`w-8 h-8 rounded-xl ${card.iconBg} border flex items-center justify-center ${card.iconColor} group-hover:scale-105 transition-transform`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-tight">
                            {card.tag}
                          </span>
                        </div>

                        {/* Title & Amount Range */}
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {card.name}
                          </h4>
                          <span className="text-xs font-mono font-black text-emerald-700 block mt-0.5">
                            {card.amountRange}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                          {card.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 mt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleCardClick(card)}
                          className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 active:scale-[0.99]"
                        >
                          <span>{card.category === 'Payment' ? 'Use Now' : 'Apply Now'}</span>
                          {card.isExternal ? (
                            <ExternalLink className="w-3 h-3 opacity-90" />
                          ) : (
                            <ArrowRight className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick In-App Application Banner */}
            <div className="rounded-3xl p-5 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Fast Digital Application
                </span>
                <h3 className="text-lg sm:text-xl font-black font-['Outfit',sans-serif]">
                  Need a customized loan offer?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
                  Submit your details directly in FINCRED to get tailored recommendations from multiple RBI-registered lenders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleStartInAppApplication('Personal Loan')}
                className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-black shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Start Application</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: LOAN OPTIONS (Full Grid with Filter, Req 3 & 4)         */}
        {/* ============================================================== */}
        {activeTab === 'options' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
                  All Available Loan Options
                </h2>
                <p className="text-xs text-slate-500">
                  Select a category or provider to start your online application
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['ALL', 'Personal', 'Business', 'Instant', 'Payment'].map(filter => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setOptionCategoryFilter(filter)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      optionCategoryFilter === filter
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {filter === 'ALL' ? 'All Loans' : `${filter}`}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-COLUMN GRID ON MOBILE */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {loanCards
                .filter(c => optionCategoryFilter === 'ALL' || c.category === optionCategoryFilter)
                .map(card => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 p-3 sm:p-4 flex flex-col justify-between transition-all group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`w-8 h-8 rounded-xl ${card.iconBg} border flex items-center justify-center ${card.iconColor} group-hover:scale-105 transition-transform`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                            {card.tag}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {card.name}
                          </h4>
                          <span className="text-xs font-mono font-black text-emerald-700 block mt-0.5">
                            {card.amountRange}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                          {card.description}
                        </p>
                      </div>

                      <div className="pt-3 mt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleCardClick(card)}
                          className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 active:scale-[0.99]"
                        >
                          <span>{card.category === 'Payment' ? 'Use Now' : 'Apply Now'}</span>
                          {card.isExternal ? (
                            <ExternalLink className="w-3 h-3 opacity-80" />
                          ) : (
                            <ArrowRight className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: APPLICATIONS (Requirement 9)                            */}
        {/* ============================================================== */}
        {activeTab === 'applications' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
                  My Loan Applications
                </h2>
                <p className="text-xs text-slate-500">
                  Track your application status and verification updates
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartInAppApplication('Personal Loan')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Application</span>
                </button>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">No Applications Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You haven't submitted any loan applications yet. Explore loan options or start an application today.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartInAppApplication('Personal Loan')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Apply for Loan</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map(app => {
                  const statusColors: Record<string, string> = {
                    'NEW': 'bg-blue-100 text-blue-900 border-blue-200',
                    'FORM SUBMITTED': 'bg-blue-100 text-blue-900 border-blue-200',
                    'DETAILS SUBMITTED': 'bg-indigo-100 text-indigo-900 border-indigo-200',
                    'DOCUMENTS SUBMITTED': 'bg-indigo-100 text-indigo-900 border-indigo-200',
                    'VERIFICATION': 'bg-amber-100 text-amber-900 border-amber-200',
                    'UNDER REVIEW': 'bg-purple-100 text-purple-900 border-purple-200',
                    'APPROVED': 'bg-emerald-100 text-emerald-900 border-emerald-200',
                    'REJECTED': 'bg-red-100 text-red-900 border-red-200',
                    'COMPLETED': 'bg-emerald-100 text-emerald-900 border-emerald-200'
                  };

                  const badgeClass = statusColors[app.status] || 'bg-slate-100 text-slate-800 border-slate-200';

                  return (
                    <div
                      key={app.applicationId}
                      className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-900">
                              #{app.applicationId}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border ${badgeClass}`}>
                              {app.status}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900">
                            {app.loanCategory || 'Personal Loan'}
                          </h4>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Requested Amount</span>
                          <span className="text-base sm:text-lg font-mono font-black text-emerald-700">
                            ₹{Number(app.amountRequested || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Detail Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Applicant</span>
                          <span className="font-semibold text-slate-800 block truncate">{app.fullName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Monthly Income</span>
                          <span className="font-semibold text-slate-800 block">
                            ₹{Number(app.monthlyIncome || customer.monthlyIncome || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Submitted On</span>
                          <span className="font-semibold text-slate-800 block truncate">
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Last Update</span>
                          <span className="font-semibold text-slate-800 block truncate">
                            {new Date(app.updatedAt || app.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Document Status within application */}
                      {app.documents && app.documents.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-700 block">Documents:</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {app.documents.map(d => (
                              <div
                                key={d.id}
                                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] flex items-center justify-between"
                              >
                                <span className="font-medium text-slate-700 truncate pr-1">{d.name}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded font-black shrink-0 ${
                                    d.status === 'VERIFIED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : d.status === 'UPLOADED'
                                      ? 'bg-blue-100 text-blue-800'
                                      : d.status === 'RE_UPLOAD_REQUESTED'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {d.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: NOTIFICATIONS TAB                                       */}
        {/* ============================================================== */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
                  Notifications & Alerts
                </h2>
                <p className="text-xs text-slate-500">
                  Stay updated on application status, broadcasts and new loan offers
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-2xs">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No Notifications</h3>
                <p className="text-xs text-slate-400">You are all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-start gap-3.5 hover:border-slate-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(notif.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.actionUrl && (
                        <div className="pt-1">
                          <Link
                            to={notif.actionUrl}
                            className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: PROFILE TAB                                             */}
        {/* ============================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl mx-auto">
            <div className="pb-2 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
                Customer Profile
              </h2>
              <p className="text-xs text-slate-500">
                Your registered borrower credentials and contact information
              </p>
            </div>

            {profileFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  profileFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{profileFeedback.message}</span>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                    {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{customer.fullName}</h3>
                    <p className="text-xs font-mono text-slate-500">+91 {customer.mobileNumber}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {!isEditingProfile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Customer ID</span>
                    <span className="font-mono font-bold text-slate-800 block truncate">{customer.customerId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Email</span>
                    <span className="font-medium text-slate-800 block truncate">{customer.email || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Date of Birth</span>
                    <span className="font-medium text-slate-800 block">{customer.dob || customer.dateOfBirth || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">PAN Card</span>
                    <span className="font-mono font-bold text-slate-800 block">{customer.panNumber || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Employment Type</span>
                    <span className="font-medium text-slate-800 block">{customer.employmentType || 'Salaried'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Monthly Income</span>
                    <span className="font-mono font-bold text-slate-800 block">
                      ₹{Number(customer.monthlyIncome || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">PAN Number</label>
                      <input
                        type="text"
                        value={profileForm.panNumber}
                        onChange={e => setProfileForm(p => ({ ...p, panNumber: e.target.value.toUpperCase() }))}
                        maxLength={10}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono uppercase font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Pincode</label>
                      <input
                        type="text"
                        value={profileForm.pincode}
                        onChange={e => setProfileForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, '') }))}
                        maxLength={6}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Account session is encrypted</span>
                <button
                  type="button"
                  onClick={customerLogout}
                  className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout Account</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: EARN & REFER SECTION                                    */}
        {/* ============================================================== */}
        {activeTab === 'earn' && (
          <EarnAndReferSection customer={customer} />
        )}
      </main>

      {/* ============================================================== */}
      {/* CATEGORY PROVIDER SELECTION MODAL (Requirement 6)             */}
      {/* ============================================================== */}
      {selectedCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Select Provider
                </span>
                <h3 className="text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
                  {selectedCategoryModal} Options
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategoryModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Choose from verified lending partners configured for {selectedCategoryModal}:
            </p>

            <div className="space-y-2.5">
              {selectedCategoryModal === 'Personal Loan' ? (
                <>
                  {/* True Balance */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">True Balance</h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Instant
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-700 block">₹1,000 – ₹5,00,000</span>
                      <p className="text-[10px] text-slate-500">Paperless digital disbursal in minutes</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePartnerRedirect(settings.instantLoanUrl || 'https://truebalance.onelink.me/bMoN/dlfim5uk', 'True Balance', 'Personal Loan')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Werize */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">Werize Financial</h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Salaried & Small Business
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-700 block">₹50,000 – ₹5,00,000</span>
                      <p className="text-[10px] text-slate-500">Fast personal credit assistance</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePartnerRedirect(settings.personalBusinessLoanUrl || 'https://www.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU', 'Werize', 'Personal Loan')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Ruloans */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/20 transition-all flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">Ruloans Aggregator</h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                          275+ Banks
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-700 block">₹50,000 – ₹25,00,000</span>
                      <p className="text-[10px] text-slate-500">Multi-lender loan comparison</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePartnerRedirect(settings.allTypeLoanUrl || 'https://sdk.ruloans.com/?client_type=b2b_app&loan_type=personal_loan&auth_token=586994%7Cl5C67vJQndNESetPp7pcWqcejaZd4iN3VtJZLPKze6dedf38', 'Ruloans', 'Personal Loan')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Choice Connect */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/20 transition-all flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">Choice Connect</h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Pre-Approved
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-700 block">₹25,000 – ₹10,00,000</span>
                      <p className="text-[10px] text-slate-500">Digital KYC & immediate eligibility check</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePartnerRedirect(settings.choiceConnectPersonalLoanUrl || 'https://choiceconnect.in/referral/loan/personal-loan/QzAxMTkyOTg=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r', 'Choice Connect', 'Personal Loan')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Business Loan: Ruloans */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/20 transition-all flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">Ruloans Business Finance</h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          Working Capital
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-700 block">₹15,00,000 – ₹30,00,000</span>
                      <p className="text-[10px] text-slate-500">Unsecured loans for businesses & enterprises</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePartnerRedirect(settings.allTypeLoanUrl || 'https://sdk.ruloans.com/?client_type=b2b_app&loan_type=personal_loan&auth_token=586994%7Cl5C67vJQndNESetPp7pcWqcejaZd4iN3VtJZLPKze6dedf38', 'Ruloans Business', 'Business Loan')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Business Loan: Choice Connect */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/20 transition-all flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">Choice Connect Business</h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          High Ticket
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-700 block">₹15,00,000 – ₹30,00,000</span>
                      <p className="text-[10px] text-slate-500">Collateral-free business expansion capital</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePartnerRedirect(settings.choiceConnectPersonalLoanUrl || 'https://choiceconnect.in/referral/loan/personal-loan/QzAxMTkyOTg=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r', 'Choice Connect Business', 'Business Loan')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}

              {/* Direct In-App Application Option */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => handleStartInAppApplication(selectedCategoryModal)}
                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Or apply directly via FINCRED Assisted Flow</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Step-by-Step Loan Application Wizard */}
      {isWizardOpen && (
        <LoanApplicationWizard
          customer={customer}
          initialCategory={wizardCategory}
          onClose={() => setIsWizardOpen(false)}
          onCancel={() => setIsWizardOpen(false)}
          onSuccess={() => {
            setIsWizardOpen(false);
            setTab('applications');
            loadCustomerData();
          }}
        />
      )}

      {/* Basic Lender Application Form (Required: Name, Mobile, Email, PAN, DOB -> Redirect) */}
      <BasicLenderApplyModal
        isOpen={basicApplyModal.isOpen}
        onClose={() => setBasicApplyModal(prev => ({ ...prev, isOpen: false }))}
        lenderName={basicApplyModal.lenderName}
        lenderTag={basicApplyModal.lenderTag}
        lenderAmount={basicApplyModal.lenderAmount}
        lenderUrl={basicApplyModal.lenderUrl}
        category={basicApplyModal.category}
        customer={customer}
        onSuccessRedirect={(url) => {
          window.open(url, '_blank', 'noopener,noreferrer');
        }}
      />
    </div>
  );
};
