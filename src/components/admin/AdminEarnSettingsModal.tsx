import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Gift,
  Users,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { fetchAdminEarnSettings, updateAdminEarnSettings } from '../../services/api.js';
import { EarnSettings } from '../../types.js';

interface AdminEarnSettingsModalProps {
  adminToken: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminEarnSettingsModal: React.FC<AdminEarnSettingsModalProps> = ({
  adminToken,
  isOpen,
  onClose
}) => {
  const [settings, setSettings] = useState<EarnSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchAdminEarnSettings(adminToken)
        .then(setSettings)
        .catch(err => setFeedback({ type: 'error', message: err.message || 'Failed to load settings' }))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, adminToken]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      const updated = await updateAdminEarnSettings(adminToken, settings);
      setSettings(updated);
      setFeedback({ type: 'success', message: 'Earn & Refer settings saved successfully!' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <h4 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
              Earn & Refer System Control
            </h4>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        {isLoading || !settings ? (
          <div className="p-8 text-center text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs">Loading reward settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* App Download Reward Group */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Gift className="w-4 h-4 text-blue-600" />
                <span>App Download Reward Parameters</span>
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    App Reward Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    value={settings.appRewardAmount}
                    onChange={(e) => setSettings({ ...settings, appRewardAmount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    User Initial Send (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={settings.userInitialPayment}
                    onChange={(e) => setSettings({ ...settings, userInitialPayment: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                Formula: ₹{settings.userInitialPayment} received + ₹{settings.appRewardAmount} reward = <strong>₹{settings.userInitialPayment + settings.appRewardAmount} Total Payout</strong>
              </div>
            </div>

            {/* Loan Referral Group */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Loan Disbursal Referral Parameters</span>
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Primary Referrer Reward (₹)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={5000}
                    value={settings.primaryLoanReferralReward}
                    onChange={(e) => setSettings({ ...settings, primaryLoanReferralReward: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Second-Level Tier-2 (₹)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={2000}
                    value={settings.secondaryReferralReward}
                    onChange={(e) => setSettings({ ...settings, secondaryReferralReward: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Payout Window (Hours after Disbursal)
                </label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={settings.payoutWindowHours}
                  onChange={(e) => setSettings({ ...settings, payoutWindowHours: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isFirstTimeRewardEnabled}
                  onChange={(e) => setSettings({ ...settings, isFirstTimeRewardEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-700">Enable First-Time App Download Reward</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isLoanReferralEnabled}
                  onChange={(e) => setSettings({ ...settings, isLoanReferralEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-700">Enable Loan Referral Program</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isFraudReviewEnabled}
                  onChange={(e) => setSettings({ ...settings, isFraudReviewEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-700">Automatic Duplicate Reference Check</span>
              </label>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Reward Settings</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
