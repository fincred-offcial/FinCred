import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  Landmark,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Send,
  Lock,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  DollarSign
} from 'lucide-react';
import {
  fetchAdminLoanReferrals,
  fetchAdminPayouts,
  actionAdminPayout,
  fetchAdminUserBankDetails
} from '../../services/api.js';
import { LoanReferral, Payout } from '../../types.js';

interface AdminLoanReferralsTabProps {
  adminToken: string;
}

export const AdminLoanReferralsTab: React.FC<AdminLoanReferralsTabProps> = ({ adminToken }) => {
  const [referrals, setReferrals] = useState<LoanReferral[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Secure Bank Details Modal state
  const [bankModalUserId, setBankModalUserId] = useState<string | null>(null);
  const [bankModalData, setBankModalData] = useState<{ bankName: string; accountNumber: string; ifscCode: string } | null>(null);
  const [bankModalLoading, setBankModalLoading] = useState(false);
  const [bankModalError, setBankModalError] = useState<string | null>(null);

  // Payout Action State
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [payoutTxnId, setPayoutTxnId] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedReferrals, fetchedPayouts] = await Promise.all([
        fetchAdminLoanReferrals(adminToken),
        fetchAdminPayouts(adminToken)
      ]);
      setReferrals(fetchedReferrals || []);
      setPayouts(fetchedPayouts || []);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load referral data' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [adminToken]);

  // Securely retrieve bank details with audit log
  const handleViewBankDetails = async (userId: string) => {
    setBankModalUserId(userId);
    setBankModalData(null);
    setBankModalLoading(true);
    setBankModalError(null);
    try {
      const data = await fetchAdminUserBankDetails(adminToken, userId);
      setBankModalData(data);
    } catch (err: any) {
      setBankModalError(err.message || 'Failed to load bank details');
    } finally {
      setBankModalLoading(false);
    }
  };

  // Execute payout status change
  const handlePayoutAction = async (action: 'APPROVE' | 'MARK_PAID' | 'HOLD' | 'REJECT') => {
    if (!selectedPayout) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const updated = await actionAdminPayout(
        adminToken,
        selectedPayout.payoutId,
        action,
        payoutTxnId.trim() || undefined,
        payoutNotes.trim() || undefined
      );

      setPayouts(prev => prev.map(p => (p.payoutId === updated.payoutId ? updated : p)));
      setSelectedPayout(null);
      setPayoutTxnId('');
      setPayoutNotes('');
      setFeedback({
        type: 'success',
        message: `Payout ${updated.payoutId} updated to ${updated.status} successfully!`
      });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Action failed' });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to calculate hours left for 24-hr deadline
  const formatDeadlineRemaining = (deadlineStr?: string) => {
    if (!deadlineStr) return { text: 'N/A', isUrgent: false };
    const diff = new Date(deadlineStr).getTime() - Date.now();
    if (diff <= 0) {
      return { text: 'OVERDUE (24h Window Passed)', isUrgent: true };
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return {
      text: `${hours}h ${mins}m left in 24h window`,
      isUrgent: hours < 6
    };
  };

  const filteredReferrals = referrals.filter((ref) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ref.referrerName.toLowerCase().includes(q) ||
      ref.referralCode.toLowerCase().includes(q) ||
      ref.referredCustomerName.toLowerCase().includes(q) ||
      ref.referredCustomerMobile.includes(q) ||
      ref.applicationId.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || ref.payoutStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDisbursed = referrals.filter(r => r.disbursalStatus === 'DISBURSED').length;
  const pendingPayouts = payouts.filter(p => p.status === 'PAYOUT PENDING').length;
  const totalPaidAmount = payouts
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.rewardAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Referrals</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">{referrals.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase block">Qualifying Disbursals</span>
          <span className="text-xl sm:text-2xl font-black text-blue-600 mt-1 block">{totalDisbursed}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase block">24h Payouts Pending</span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 mt-1 block">{pendingPayouts}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase block">Total Rewards Paid</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">₹{totalPaidAmount}</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
            ×
          </button>
        </div>
      )}

      {/* Control / Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by referrer, code, customer, mobile, or App ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="REFERRED">Referred</option>
            <option value="DISBURSED">Disbursed (Qualifying)</option>
            <option value="PAYOUT PENDING">Payout Pending</option>
            <option value="PAID">Paid Out</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pending Payouts Banner & Action List */}
      {payouts.filter(p => p.status === 'PAYOUT PENDING').length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pending 24-Hour Referral Payouts ({pendingPayouts})</span>
            </h4>
            <span className="text-[11px] text-amber-800 font-medium">
              Must be disbursed within 24 hours of loan qualification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {payouts
              .filter(p => p.status === 'PAYOUT PENDING')
              .map(p => {
                const deadline = formatDeadlineRemaining(p.deadline);
                return (
                  <div key={p.id} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900">{p.userName}</span>
                        <div className="text-[11px] text-slate-500">{p.reason}</div>
                        <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                          {p.bankName} • {p.accountNumberMasked} (IFSC: {p.ifscCode})
                        </div>
                      </div>
                      <span className="text-sm font-black text-emerald-600">
                        ₹{p.rewardAmount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className={`font-bold ${deadline.isUrgent ? 'text-red-600 animate-pulse' : 'text-amber-700'}`}>
                        {deadline.text}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewBankDetails(p.userId)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px]"
                        >
                          View Bank Details
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPayout(p)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                        >
                          Process Payout
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Referrals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs">Loading loan referrals...</p>
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold">No loan referrals found matching criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Referrer (User A)</th>
                  <th className="py-3 px-4">Customer (User B)</th>
                  <th className="py-3 px-4">Loan / Partner</th>
                  <th className="py-3 px-4">Disbursal</th>
                  <th className="py-3 px-4">24h Deadline</th>
                  <th className="py-3 px-4">Reward</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReferrals.map((ref) => {
                  const deadline = formatDeadlineRemaining(ref.payoutDeadline);
                  return (
                    <tr key={ref.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{ref.referrerName}</div>
                        <div className="text-[10px] font-mono text-blue-600 font-bold">
                          Code: {ref.referralCode}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{ref.referredCustomerName}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {ref.referredCustomerMobile} • {ref.applicationId}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{ref.loanType}</div>
                        <div className="text-[10px] text-slate-400">{ref.provider}</div>
                      </td>
                      <td className="py-3 px-4">
                        {ref.disbursalStatus === 'DISBURSED' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Disbursed
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Pending Disbursal</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {ref.payoutDeadline ? (
                          <span className={`text-[10px] font-bold ${deadline.isUrgent ? 'text-red-600' : 'text-slate-700'}`}>
                            {deadline.text}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900">
                        ₹{ref.rewardAmount}
                        <span className="text-[9px] block text-slate-400 font-normal">
                          {ref.rewardTier === 'SECONDARY' ? 'Tier-2' : 'Tier-1'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            ref.payoutStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ref.payoutStatus === 'PAYOUT PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : ref.payoutStatus === 'REWARD ELIGIBLE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ref.payoutStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleViewBankDetails(ref.referrerUserId)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="View Referrer Bank Details"
                          >
                            <Landmark className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Secure Bank Details Modal */}
      {bankModalUserId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-black text-slate-900 font-['Outfit',sans-serif]">
                  Secure Bank Details
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setBankModalUserId(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {bankModalLoading ? (
              <div className="p-8 text-center text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-xs">Decrypting bank records & creating audit log...</p>
              </div>
            ) : bankModalError ? (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">
                {bankModalError}
              </div>
            ) : bankModalData ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Bank Name</span>
                  <span className="font-bold text-slate-900 text-sm">{bankModalData.bankName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Account Number</span>
                  <span className="font-mono font-black text-blue-700 text-sm select-all">
                    {bankModalData.accountNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">IFSC Code</span>
                  <span className="font-mono font-black text-slate-900 text-sm select-all">
                    {bankModalData.ifscCode}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                  🔒 Access to these banking credentials has been securely logged with admin ID and timestamp.
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setBankModalUserId(null)}
              className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Process Payout Action Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 font-['Outfit',sans-serif]">
                Process Referral Payout: ₹{selectedPayout.rewardAmount}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedPayout(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <div className="font-bold text-slate-900">{selectedPayout.userName} ({selectedPayout.mobileNumber})</div>
                <div className="font-mono text-slate-600">
                  {selectedPayout.bankName} • {selectedPayout.accountNumberMasked} (IFSC: {selectedPayout.ifscCode})
                </div>
                <div className="text-[11px] text-emerald-700 font-bold">
                  Amount: ₹{selectedPayout.rewardAmount}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  IMPS / UPI Transaction Reference (UTR)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 427189998123"
                  value={payoutTxnId}
                  onChange={(e) => setPayoutTxnId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Admin Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Processed via HDFC NetBanking..."
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handlePayoutAction('MARK_PAID')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Mark Paid (Complete)
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handlePayoutAction('HOLD')}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                >
                  Hold Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
