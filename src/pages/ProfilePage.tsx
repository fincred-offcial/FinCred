import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Smartphone, Edit2, Check, LayoutDashboard, FileClock, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { updateCustomerProfile, fetchCustomerApplications } from '../services/api.js';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { customer, isCustomerLoggedIn, updateCustomerName, customerLogout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(customer?.fullName || '');
  const [appCount, setAppCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isCustomerLoggedIn || !customer) {
      navigate('/login');
      return;
    }
    setNameInput(customer.fullName || '');

    fetchCustomerApplications(customer.customerId, customer.mobileNumber)
      .then(apps => setAppCount(apps.length))
      .catch(() => {});
  }, [customer, isCustomerLoggedIn, navigate]);

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      setFeedback({ type: 'error', message: 'Name must be at least 2 characters long.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      if (customer?.customerId) {
        await updateCustomerProfile(customer.customerId, nameInput.trim());
      }
      updateCustomerName(nameInput.trim());
      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update name.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    customerLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
          Customer Account & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Manage your verified credentials and referral settings.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-slate-900">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-sm">
            {customer?.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
              {customer?.fullName || 'Valued Customer'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-600 font-mono">+91 {customer?.mobileNumber}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                OTP Verified
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details & Allowed Edits */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Full Legal Name
            </label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm outline-none focus:border-blue-600"
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    setNameInput(customer?.fullName || '');
                    setIsEditing(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-sm font-semibold text-slate-900">{customer?.fullName}</span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Name</span>
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Verified Mobile Number
            </label>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-sm font-mono text-slate-900">+91 {customer?.mobileNumber}</span>
              <span className="text-[10px] text-slate-400">Locked to carrier verification</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Total Central Applications
            </label>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="text-sm font-semibold text-amber-700">{appCount} loan referral request(s)</span>
              <Link to="/applications" className="text-xs text-blue-600 hover:underline font-medium">
                View History
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Navigation Controls */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Open Customer Dashboard</span>
          </Link>

          <Link
            to="/applications"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
          >
            <FileClock className="w-4 h-4" />
            <span>View All Applications</span>
          </Link>
        </div>

        {/* Logout */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            id="profile-logout-btn"
            className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Device</span>
          </button>
        </div>
      </div>
    </div>
  );
};
