import React, { useState, useEffect } from 'react';
import {
  Gift,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Send,
  Check,
  XCircle,
  Eye,
  FileText
} from 'lucide-react';
import { fetchAdminAppRewards, actionAdminAppReward } from '../../services/api.js';
import { AppReward, AppRewardStatus } from '../../types.js';

interface AdminAppRewardsTabProps {
  adminToken: string;
}

export const AdminAppRewardsTab: React.FC<AdminAppRewardsTabProps> = ({ adminToken }) => {
  const [rewards, setRewards] = useState<AppReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedReward, setSelectedReward] = useState<AppReward | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadRewards = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAppRewards(adminToken);
      setRewards(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load app rewards' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, [adminToken]);

  const handleAction = async (
    userId: string,
    action: 'VERIFY_1' | 'APPROVE_REWARD' | 'MARK_PAID' | 'REJECT' | 'HOLD'
  ) => {
    setActionLoadingId(userId);
    setFeedback(null);
    try {
      const updated = await actionAdminAppReward(adminToken, userId, action, adminNotesInput.trim() || undefined);
      setRewards(prev => prev.map(r => (r.userId === userId ? updated : r)));
      if (selectedReward?.userId === userId) {
        setSelectedReward(updated);
      }
      setFeedback({
        type: 'success',
        message: `Action ${action} completed successfully for user ${userId}`
      });
      setAdminNotesInput('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || `Failed to perform ${action}` });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredRewards = rewards.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.userName.toLowerCase().includes(q) ||
      r.mobileNumber.includes(q) ||
      r.userId.toLowerCase().includes(q) ||
      (r.paymentReference && r.paymentReference.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalClaims = rewards.length;
  const verifiedCount = rewards.filter(r => ['PAYMENT VERIFIED', '₹100 REWARD PENDING', '₹100 REWARD SENT', 'COMPLETED'].includes(r.status)).length;
  const pendingCount = rewards.filter(r => ['₹1 PAYMENT RECEIVED', 'PAYMENT VERIFIED', '₹100 REWARD PENDING'].includes(r.status)).length;
  const totalPaid = rewards
    .filter(r => ['COMPLETED', '₹100 REWARD SENT', 'PAID'].includes(r.status))
    .reduce((sum, r) => sum + (r.totalReturn || 101), 0);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total App Claims</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">{totalClaims}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase block">₹1 Verified</span>
          <span className="text-xl sm:text-2xl font-black text-blue-600 mt-1 block">{verifiedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase block">Reward Pending</span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 mt-1 block">{pendingCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase block">Total Paid Out</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">₹{totalPaid}</span>
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
            placeholder="Search by name, mobile, user ID, or UTR/Txn ID..."
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
            <option value="DOWNLOAD LINK OPENED">Link Opened</option>
            <option value="₹1 PAYMENT PENDING">₹1 Pending</option>
            <option value="₹1 PAYMENT RECEIVED">₹1 Received (Awaiting Verification)</option>
            <option value="PAYMENT VERIFIED">Payment Verified</option>
            <option value="₹100 REWARD PENDING">₹100 Pending</option>
            <option value="COMPLETED">Completed / Paid</option>
            <option value="ON HOLD">On Hold</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button
            type="button"
            onClick={loadRewards}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs">Loading App Reward claims...</p>
          </div>
        ) : filteredRewards.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Gift className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold">No App Reward claims match criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Navi Link</th>
                  <th className="py-3 px-4">₹1 Txn / UTR</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Fraud Check</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRewards.map((reward) => (
                  <tr key={reward.userId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{reward.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{reward.userId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {reward.mobileNumber}
                    </td>
                    <td className="py-3 px-4">
                      {reward.naviLinkClicked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <Check className="w-2.5 h-2.5" /> Opened
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Not clicked</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {reward.paymentReference ? (
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 select-all">
                          {reward.paymentReference}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Not submitted</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      ₹101
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          reward.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : reward.status === 'PAYMENT VERIFIED'
                            ? 'bg-blue-100 text-blue-800'
                            : reward.status === '₹1 PAYMENT RECEIVED'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : reward.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {reward.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {reward.isFraudFlagged ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <ShieldAlert className="w-2.5 h-2.5" /> Duplicate Flag
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                          <Check className="w-2.5 h-2.5" /> Clean
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReward(reward)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Verify ₹1 Button */}
                        {reward.paymentReference && reward.status !== 'COMPLETED' && reward.status !== 'PAYMENT VERIFIED' && (
                          <button
                            type="button"
                            disabled={actionLoadingId === reward.userId}
                            onClick={() => handleAction(reward.userId, 'VERIFY_1')}
                            className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition-colors"
                          >
                            Verify ₹1
                          </button>
                        )}

                        {/* Quick Mark Paid Button */}
                        {reward.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            disabled={actionLoadingId === reward.userId}
                            onClick={() => handleAction(reward.userId, 'MARK_PAID')}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details & Action Modal */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                App Reward Claim Details
              </h4>
              <button
                type="button"
                onClick={() => setSelectedReward(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Customer Name</span>
                  <span className="font-bold text-slate-800">{selectedReward.userName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Mobile Number</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReward.mobileNumber}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">₹1 Transaction UTR</span>
                  <span className="font-mono font-bold text-blue-700">
                    {selectedReward.paymentReference || 'N/A'}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Current Status</span>
                  <span className="font-bold text-emerald-700">{selectedReward.status}</span>
                </div>
              </div>

              {/* Admin Notes Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Add Admin Verification Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified via Navi Statement txn #994..."
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  disabled={actionLoadingId === selectedReward.userId}
                  onClick={() => handleAction(selectedReward.userId, 'VERIFY_1')}
                  className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Verify ₹1
                </button>

                <button
                  type="button"
                  disabled={actionLoadingId === selectedReward.userId}
                  onClick={() => handleAction(selectedReward.userId, 'APPROVE_REWARD')}
                  className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Approve ₹100
                </button>

                <button
                  type="button"
                  disabled={actionLoadingId === selectedReward.userId}
                  onClick={() => handleAction(selectedReward.userId, 'MARK_PAID')}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Mark Paid
                </button>

                <button
                  type="button"
                  disabled={actionLoadingId === selectedReward.userId}
                  onClick={() => handleAction(selectedReward.userId, 'HOLD')}
                  className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                >
                  Hold
                </button>

                <button
                  type="button"
                  disabled={actionLoadingId === selectedReward.userId}
                  onClick={() => handleAction(selectedReward.userId, 'REJECT')}
                  className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Reject
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReward(null)}
                  className="py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
