import React, { useState, useEffect } from 'react';
import {
  Gift,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Landmark,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Users,
  ChevronRight,
  Send,
  Lock,
  Wallet,
  TrendingUp,
  RefreshCw,
  QrCode
} from 'lucide-react';
import {
  fetchEarnSettings,
  fetchReferralProfile,
  activateReferralProfile,
  checkAppReward,
  recordNaviClick,
  submitAppRewardPayment,
  fetchMyReferrals
} from '../../services/api.js';
import { EarnSettings, ReferralProfile, AppReward, LoanReferral } from '../../types.js';

interface EarnAndReferSectionProps {
  customer: {
    customerId: string;
    fullName: string;
    mobileNumber: string;
    email?: string;
  };
}

export const EarnAndReferSection: React.FC<EarnAndReferSectionProps> = ({ customer }) => {
  const [activeTab, setActiveTab] = useState<'app_reward' | 'loan_referral'>('app_reward');
  const [settings, setSettings] = useState<EarnSettings | null>(null);
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [appReward, setAppReward] = useState<AppReward | null>(null);
  const [referrals, setReferrals] = useState<LoanReferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // App Reward State
  const [paymentRefInput, setPaymentRefInput] = useState('');
  const [paymentRefError, setPaymentRefError] = useState<string | null>(null);
  const [appRewardSuccessMsg, setAppRewardSuccessMsg] = useState<string | null>(null);
  const [isCopiedUpi, setIsCopiedUpi] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Bank Registration Form State
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    isConfirmed: false
  });
  const [bankFormError, setBankFormError] = useState<string | null>(null);
  const [bankFormSuccess, setBankFormSuccess] = useState<string | null>(null);

  // Copy state for referral code / link
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  const fincredUpiId = 'fincredlo@nyes';
  const naviDownloadUrl = 'https://r.navi.com/t3HqoB';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedSettings, fetchedProfile, rewardStatus, fetchedReferrals] = await Promise.all([
        fetchEarnSettings().catch(() => null),
        fetchReferralProfile(customer.customerId).catch(() => null),
        checkAppReward(customer.customerId, customer.mobileNumber).catch(() => null),
        fetchMyReferrals(customer.customerId).catch(() => [])
      ]);

      if (fetchedSettings) setSettings(fetchedSettings);
      if (fetchedProfile) setProfile(fetchedProfile);
      if (rewardStatus?.reward) setAppReward(rewardStatus.reward);
      setReferrals(fetchedReferrals || []);
    } catch (err) {
      console.error('Error loading Earn & Refer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [customer.customerId]);

  // Handle Navi download click
  const handleNaviDownload = async () => {
    try {
      const updated = await recordNaviClick({
        userId: customer.customerId,
        userName: customer.fullName || 'Customer',
        mobileNumber: customer.mobileNumber
      });
      setAppReward(updated);
    } catch (err) {
      console.error('Error recording Navi link click:', err);
    }
    window.open(naviDownloadUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle ₹1 payment reference submission
  const handleSubmitPaymentRef = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentRefError(null);
    setAppRewardSuccessMsg(null);

    const ref = paymentRefInput.trim();
    if (!ref) {
      setPaymentRefError('Please enter your 12-digit UPI / UTR Transaction Reference ID');
      return;
    }
    if (ref.length < 8) {
      setPaymentRefError('Transaction reference number is too short. Please enter the valid UTR ID from your payment app.');
      return;
    }

    setIsActionLoading(true);
    try {
      const updated = await submitAppRewardPayment(customer.customerId, ref);
      setAppReward(updated);
      setAppRewardSuccessMsg('₹1 Payment reference submitted successfully! Our automated system is verifying your ₹101 return reward.');
      setPaymentRefInput('');
    } catch (err: any) {
      setPaymentRefError(err.message || 'Failed to submit payment reference. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Copy UPI ID helper
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(fincredUpiId);
    setIsCopiedUpi(true);
    setTimeout(() => setIsCopiedUpi(false), 2500);
  };

  // Copy Referral Code
  const handleCopyCode = () => {
    if (!profile?.referralCode) return;
    navigator.clipboard.writeText(profile.referralCode);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2500);
  };

  // Copy Referral Link
  const handleCopyLink = () => {
    if (!profile?.referralCode) return;
    const origin = (typeof window !== 'undefined' && window.location.origin)
      ? window.location.origin
      : (import.meta.env.VITE_APP_BASE_URL || '');
    const link = origin ? `${origin}/?ref=${profile.referralCode}` : `/?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(link);
    setIsCopiedLink(true);
    setTimeout(() => setIsCopiedLink(false), 2500);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    if (!profile?.referralCode) return;
    const origin = (typeof window !== 'undefined' && window.location.origin)
      ? window.location.origin
      : (import.meta.env.VITE_APP_BASE_URL || '');
    const link = origin ? `${origin}/?ref=${profile.referralCode}` : `/?ref=${profile.referralCode}`;
    const text = `Namaste! 🇮🇳 Urgent cash loan chahiye bina kisi pareshani ke? FinCred par instant ₹10,000 se ₹20 Lakh tak ka loan approve karwayein lowest interest rate par. 

Aapke liye direct link:
${link}

Referral Code: ${profile.referralCode}
Abhi apply karein aur instant disbursal paayein!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Handle Bank Registration Form Submission
  const handleActivateReferralProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankFormError(null);
    setBankFormSuccess(null);

    const { bankName, accountNumber, confirmAccountNumber, ifscCode, isConfirmed } = bankForm;

    if (!bankName.trim()) {
      setBankFormError('Please enter your Bank Name');
      return;
    }
    if (!accountNumber.trim()) {
      setBankFormError('Please enter your Bank Account Number');
      return;
    }
    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      setBankFormError('Account Number and Confirm Account Number do not match');
      return;
    }
    if (!/^\d{9,18}$/.test(accountNumber.trim())) {
      setBankFormError('Please enter a valid 9 to 18-digit Indian bank account number');
      return;
    }
    const cleanIfsc = ifscCode.trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      setBankFormError('Please enter a valid 11-character Indian IFSC code (e.g., SBIN0001234)');
      return;
    }
    if (!isConfirmed) {
      setBankFormError('Please check the confirmation box verifying that your bank details are correct');
      return;
    }

    setIsActionLoading(true);
    try {
      const parentRef = localStorage.getItem('fc_referrer_code') || sessionStorage.getItem('fc_referrer_code') || undefined;
      const newProfile = await activateReferralProfile({
        userId: customer.customerId,
        fullName: customer.fullName,
        mobileNumber: customer.mobileNumber,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        confirmAccountNumber: confirmAccountNumber.trim(),
        ifscCode: cleanIfsc,
        parentReferrerCode: parentRef
      });
      setProfile(newProfile);
      setBankFormSuccess('🎉 Bank details verified & Referral Profile activated successfully! Your unique referral link is ready.');
    } catch (err: any) {
      setBankFormError(err.message || 'Failed to activate referral profile. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const isAlreadyClaimed =
    appReward &&
    ['COMPLETED', '₹100 REWARD SENT', 'PAID'].includes(appReward.status);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Gift className="w-3.5 h-3.5 text-indigo-400" />
              <span>FinCred Rewards Program</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">
              Earn & Refer Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Earn real cash rewards directly into your bank account. Claim your <strong>₹100 App Download Reward</strong> and get <strong>₹200 for every successful loan disbursal</strong> you refer!
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-2 sm:p-3 rounded-2xl shrink-0">
            <div className="text-center px-2 sm:px-3">
              <span className="text-[10px] text-slate-400 block font-medium">Total Earned</span>
              <span className="text-base sm:text-lg font-black text-emerald-400">
                ₹{profile ? profile.totalEarned : (isAlreadyClaimed ? 101 : 0)}
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center px-2 sm:px-3">
              <span className="text-[10px] text-slate-400 block font-medium">Pending</span>
              <span className="text-base sm:text-lg font-black text-amber-400">
                ₹{profile ? profile.pendingRewards : (appReward && !isAlreadyClaimed ? 101 : 0)}
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center px-2 sm:px-3">
              <span className="text-[10px] text-slate-400 block font-medium">Referrals</span>
              <span className="text-base sm:text-lg font-black text-indigo-300">
                {referrals.length}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex gap-2 pt-6 mt-6 border-t border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('app_reward')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'app_reward'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>App Download Reward</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">
              ₹101
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('loan_referral')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'loan_referral'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Loan Refer & Earn</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-400 text-slate-950">
              ₹200/Loan
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: APP DOWNLOAD REWARD (₹1 Send -> ₹101 Return)         */}
      {/* ============================================================== */}
      {activeTab === 'app_reward' && (
        <div className="space-y-6">
          {/* Main Proposition Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                  First-Time Exclusive Welcome Bonus
                </span>
                <h3 className="text-xl font-black text-slate-900 font-['Outfit',sans-serif] mt-0.5">
                  Download Navi App & Earn ₹100 Reward
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Send ₹1 from your downloaded Navi app to FinCred. Once verified, get <strong>₹101 returned</strong> (₹1 refunded + ₹100 Welcome Cash Reward)!
                </p>
              </div>

              {/* The ₹1 -> ₹101 Formula Badge */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3 shrink-0 text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase block">Payout Calculation</span>
                <span className="text-xs font-black text-slate-900 mt-0.5 block">
                  ₹1 received + ₹100 reward = <span className="text-emerald-600 text-sm">₹101 total</span>
                </span>
              </div>
            </div>

            {/* Already Claimed Banner */}
            {isAlreadyClaimed ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black">Your ₹100 first-time reward has already been claimed.</h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Status: <strong>COMPLETED</strong> | Total Payout: <strong>₹101</strong> (Ref: {appReward?.paymentReference || 'VERIFIED'})
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Thank you for being a verified FinCred customer! You can now start earning <strong>₹200 per loan</strong> by referring your friends in the <em>Loan Refer & Earn</em> section.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* 3 Step Interactive Workflow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* STEP 1 */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                          1
                        </span>
                        {appReward?.naviLinkClicked && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Link Opened
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Download Navi App</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Download and install the official Navi app on your mobile phone using our verified partner download link.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleNaviDownload}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Download Navi App</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* STEP 2 */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                          2
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          Amount: ₹1
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Send ₹1 via Navi UPI</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Open Navi app UPI, and send exactly <strong>₹1</strong> to FinCred designated receiving UPI ID:
                      </p>

                      <div className="mt-2.5 p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-800 select-all">
                          {fincredUpiId}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {isCopiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopiedUpi ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Payment QR / UPI ID</span>
                    </button>
                  </div>

                  {/* STEP 3 */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                          3
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Receive ₹101
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Submit UTR & Claim ₹101</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Enter the 12-digit transaction ID / UTR from your ₹1 payment receipt below to start the verification:
                      </p>
                    </div>

                    <form onSubmit={handleSubmitPaymentRef} className="space-y-2">
                      <input
                        type="text"
                        value={paymentRefInput}
                        onChange={(e) => setPaymentRefInput(e.target.value)}
                        placeholder="e.g. 427189123456"
                        maxLength={24}
                        disabled={isActionLoading || !!appReward?.paymentReference}
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <button
                        type="submit"
                        disabled={isActionLoading || !!appReward?.paymentReference}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        {isActionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>
                          {appReward?.paymentReference ? 'Payment Submitted' : 'Submit & Claim ₹100'}
                        </span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Feedback / Errors */}
                {paymentRefError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{paymentRefError}</span>
                  </div>
                )}

                {appRewardSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{appRewardSuccessMsg}</span>
                  </div>
                )}

                {/* Reward Stage Progress Stepper */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Real-Time Reward Stages:</span>
                  </h4>

                  <div className="overflow-x-auto pb-2">
                    <div className="flex items-center gap-2 min-w-[650px] text-xs">
                      {[
                        { key: 'NOT STARTED', label: '1. Not Started' },
                        { key: 'DOWNLOAD LINK OPENED', label: '2. Link Opened' },
                        { key: '₹1 PAYMENT PENDING', label: '3. ₹1 Pending' },
                        { key: '₹1 PAYMENT RECEIVED', label: '4. ₹1 Received' },
                        { key: 'PAYMENT VERIFIED', label: '5. Verified' },
                        { key: '₹100 REWARD PENDING', label: '6. ₹100 Pending' },
                        { key: 'COMPLETED', label: '7. ₹101 Paid' }
                      ].map((stage, idx) => {
                        const currentStatus = appReward?.status || 'NOT STARTED';
                        const isDone =
                          currentStatus === stage.key ||
                          (currentStatus === 'COMPLETED' && true) ||
                          (currentStatus === '₹100 REWARD SENT' && idx <= 5) ||
                          (currentStatus === 'PAYMENT VERIFIED' && idx <= 4) ||
                          (currentStatus === '₹1 PAYMENT RECEIVED' && idx <= 3) ||
                          (currentStatus === 'DOWNLOAD LINK OPENED' && idx <= 1);

                        const isCurrent = currentStatus === stage.key;

                        return (
                          <div
                            key={stage.key}
                            className={`flex-1 p-2 rounded-xl border text-center transition-all ${
                              isCurrent
                                ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
                                : isDone
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                          >
                            <span className="text-[10px] block truncate">{stage.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {appReward?.paymentReference && (
                    <p className="text-[11px] text-slate-500 mt-2">
                      Submitted Transaction Reference: <strong className="text-slate-800 font-mono">{appReward.paymentReference}</strong> (Status: {appReward.status})
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: LOAN REFER & EARN (₹200 per Qualifying Disbursal)    */}
      {/* ============================================================== */}
      {activeTab === 'loan_referral' && (
        <div className="space-y-6">
          {!profile?.isActivated ? (
            /* First-Time Referral Registration Form: Bank Details */
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-wider mb-1.5">
                  <Landmark className="w-3 h-3" />
                  <span>Referral Payout Setup Required</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
                  Bank Details for Referral Payout
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Complete your bank details to activate your referral account and generate your personalized referral code & link. Your rewards will be directly credited to this account.
                </p>
              </div>

              <form onSubmit={handleActivateReferralProfile} className="space-y-4 max-w-xl">
                {/* Bank Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. State Bank of India / HDFC Bank / ICICI Bank"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* IFSC Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2. IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SBIN0001234"
                    maxLength={11}
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    11-character bank branch identifier (4 letters, 0, 6 letters/digits)
                  </span>
                </div>

                {/* Account Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      3. Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 123456789012"
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      4. Confirm Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Re-enter Account Number"
                      value={bankForm.confirmAccountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Strict Privacy & Security Notice */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Confidential & Encrypted:</strong> Bank details are stored securely and only accessible by authorized finance administrators for IMPS/NEFT reward transfers. They will never be displayed publicly.
                  </p>
                </div>

                {/* Checkbox Confirmation */}
                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={bankForm.isConfirmed}
                    onChange={(e) => setBankForm({ ...bankForm, isConfirmed: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    I confirm that the bank details provided by me are correct and belong to me.
                  </span>
                </label>

                {bankFormError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{bankFormError}</span>
                  </div>
                )}

                {bankFormSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{bankFormSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="w-full py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Save Bank Details & Activate Referral Link</span>
                </button>
              </form>
            </div>
          ) : (
            /* Referral Profile is Activated */
            <div className="space-y-6">
              {/* Personalized Referral Link Card */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white inline-block">
                        Active Referral Profile
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif] mt-1">
                        Your Personalized Referral Hub
                      </h3>
                    </div>

                    <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 px-4 text-center border border-white/20">
                      <span className="text-[10px] text-blue-100 block font-medium">Reward Per Disbursal</span>
                      <span className="text-xl font-black text-amber-300">₹200 Instant</span>
                    </div>
                  </div>

                  {/* Referral Code & Link Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Code Box */}
                    <div className="bg-slate-900/60 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-blue-200 block uppercase font-bold">Your Referral Code</span>
                        <span className="text-base sm:text-lg font-black font-mono tracking-wider text-amber-300">
                          {profile.referralCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {isCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Link Box */}
                    <div className="bg-slate-900/60 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center justify-between">
                      <div className="truncate mr-2">
                        <span className="text-[10px] text-blue-200 block uppercase font-bold">Your Referral Link</span>
                        <span className="text-xs font-mono text-white truncate block">
                          {profile.referralLink}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {isCopiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopiedLink ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Sharing Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share on WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Link</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Verified Payout Bank Information */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Payout Bank Account</span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {profile.bankName} • {profile.accountNumberMasked}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500">IFSC: {profile.ifscCode}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Direct Deposit Ready</span>
                  </span>
                </div>
              </div>

              {/* How Loan Referral Works (Requirement 11, 12, 13) */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
                <h4 className="text-sm font-black text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>How the ₹200 Referral Payout Flow Works:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center mb-2">1</span>
                    <h5 className="font-bold text-slate-900">Share Link</h5>
                    <p className="text-[11px] text-slate-600 mt-1">Friend clicks your referral link and applies for a loan.</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center mb-2">2</span>
                    <h5 className="font-bold text-slate-900">Loan Disbursal</h5>
                    <p className="text-[11px] text-slate-600 mt-1">Lender verifies and successfully disburses the loan amount.</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center mb-2">3</span>
                    <h5 className="font-bold text-slate-900">24-Hour Timer</h5>
                    <p className="text-[11px] text-slate-600 mt-1">Reward is scheduled and paid within 24 hours of verified disbursal.</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center mb-2">4</span>
                    <h5 className="font-bold text-slate-900">₹200 Credited</h5>
                    <p className="text-[11px] text-slate-600 mt-1">Direct IMPS/UPI transfer to your saved bank account.</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                  <strong>✨ Second-Level Reward (Tier-2):</strong> If your referred friend refers another contact who gets a loan disbursed, you automatically receive an additional <strong>₹150 Tier-2 reward</strong>!
                </div>
              </div>

              {/* My Referrals History Table */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 font-['Outfit',sans-serif]">
                    My Referrals Activity ({referrals.length})
                  </h4>
                  <button
                    type="button"
                    onClick={loadData}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {referrals.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold">No referrals recorded yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Share your referral link on WhatsApp to start earning ₹200 per loan!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                          <th className="pb-2.5">Customer</th>
                          <th className="pb-2.5">Loan Type</th>
                          <th className="pb-2.5">Date</th>
                          <th className="pb-2.5">Disbursal</th>
                          <th className="pb-2.5">Reward</th>
                          <th className="pb-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {referrals.map((ref) => (
                          <tr key={ref.id} className="text-slate-800">
                            <td className="py-2.5 font-bold">{ref.referredCustomerName}</td>
                            <td className="py-2.5 text-slate-600">{ref.loanType}</td>
                            <td className="py-2.5 text-slate-500 text-[11px]">
                              {new Date(ref.applicationDate || ref.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-2.5">
                              {ref.disbursalStatus === 'DISBURSED' ? (
                                <span className="text-emerald-700 font-bold">Disbursed</span>
                              ) : (
                                <span className="text-slate-500">Processing</span>
                              )}
                            </td>
                            <td className="py-2.5 font-black text-emerald-600">
                              ₹{ref.rewardAmount}
                            </td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {ref.payoutStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Modal for ₹1 payment */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <h4 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
              Send ₹1 via Navi UPI
            </h4>
            <p className="text-xs text-slate-600">
              Open Navi UPI and scan or pay ₹1 to this official receiving UPI ID:
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="font-mono text-sm font-black text-blue-700 select-all block">
                {fincredUpiId}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyUpi}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
              >
                {isCopiedUpi ? 'Copied UPI ID' : 'Copy UPI ID'}
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
