import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Edit3,
  LogOut,
  HelpCircle,
  FileText,
  ChevronRight,
  Headphones,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  Smartphone
} from 'lucide-react';
import { Customer } from '../../types.js';
import { useMobileAuth } from '../context/MobileAuthContext.js';

interface MobileProfileScreenProps {
  customer: Customer | null;
  onNavigateToApplications: () => void;
  onLogoutConfirm: () => void;
}

export const MobileProfileScreen: React.FC<MobileProfileScreenProps> = ({
  customer,
  onNavigateToApplications,
  onLogoutConfirm
}) => {
  const { updateProfile, isLoading } = useMobileAuth();

  // Edit profile state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(customer?.fullName || '');
  const [editEmail, setEditEmail] = useState(customer?.email || '');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // Help & Support modal
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Logout confirm modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleOpenEdit = () => {
    setEditName(customer?.fullName || '');
    setEditEmail(customer?.email || '');
    setEditError(null);
    setEditSuccess(false);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!editName.trim() || editName.trim().length < 2) {
      setEditError('Please enter a valid full name');
      return;
    }

    if (editEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) {
      setEditError('Please enter a valid email format');
      return;
    }

    try {
      await updateProfile({
        fullName: editName.trim(),
        email: editEmail.trim() || undefined
      });
      setEditSuccess(true);
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditSuccess(false);
      }, 1000);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Top Banner & Avatar */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#121B2F] via-[#0E1627] to-[#0A0F1D] border border-slate-800 relative overflow-hidden shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-blue-600/25 shrink-0">
            <div className="w-full h-full bg-[#0A0F1D] rounded-[14px] flex items-center justify-center font-black text-xl text-white">
              {customer?.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h2 className="text-base font-bold text-white truncate font-['Outfit',sans-serif]">
                {customer?.fullName || 'User Profile'}
              </h2>
            </div>
            <p className="text-xs font-mono text-slate-400 truncate">+91 {customer?.mobileNumber}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3" />
                RBI Compliant KYC
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenEdit}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer transition-all"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Member metadata */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400">Account ID:</span>
            <div className="font-mono font-bold text-cyan-400 text-[11px] truncate">
              {customer?.customerId || 'FC-USER'}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Member Since:</span>
            <div className="text-slate-300 font-semibold text-[11px]">
              {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Active'}
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Details Card */}
      <div className="p-4 rounded-2xl bg-[#111A2E] border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Personal Information
        </h3>

        <div className="divide-y divide-slate-800/80 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Full Name
            </span>
            <span className="font-semibold text-white">{customer?.fullName}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Mobile Number
            </span>
            <span className="font-mono font-semibold text-white">+91 {customer?.mobileNumber}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              Email Address
            </span>
            <span className="text-slate-300 font-medium">
              {customer?.email || <span className="text-slate-500 italic">Not specified</span>}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              Platform Origin
            </span>
            <span className="font-semibold text-cyan-400">FINCRED Mobile Application</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Menu */}
      <div className="p-2 rounded-2xl bg-[#111A2E] border border-slate-800 divide-y divide-slate-800/70 text-xs">
        <button
          type="button"
          onClick={onNavigateToApplications}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">My Loan Applications</div>
              <div className="text-[10px] text-slate-400">View real-time status & reference IDs</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => setIsHelpModalOpen(true)}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Help & Support</div>
              <div className="text-[10px] text-slate-400">Customer care helpline & FAQs</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out from FINCRED</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* EDIT PROFILE MODAL */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Update Profile Details</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A0F1D] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A0F1D] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* HELP & SUPPORT MODAL */}
      {/* ======================================================== */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">FINCRED Support Desk</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0A0F1D] border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Official Email Support:</div>
                <div className="font-semibold text-white">support@fincred.co.in</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0F1D] border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Assistance Helpline:</div>
                <div className="font-mono font-bold text-cyan-400">1800-889-FINCRED</div>
                <div className="text-[10px] text-slate-500">Mon - Sat: 9:30 AM to 6:30 PM IST</div>
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-slate-300">Frequently Asked Questions</h4>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <p className="font-semibold text-white">Do you charge any upfront loan fees?</p>
                  <p className="text-[11px] text-slate-400">
                    No. FINCRED never charges processing or commission fees to applicants. All loan offers originate through RBI-regulated partners.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <p className="font-semibold text-white">How long does disbursal take?</p>
                  <p className="text-[11px] text-slate-400">
                    Instant loan partners (like TrueBalance) disburse in as fast as 5–15 minutes upon digital KYC verification.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsHelpModalOpen(false)}
              className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
            >
              Close Support Desk
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* LOGOUT CONFIRM MODAL */}
      {/* ======================================================== */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-xs p-5 shadow-2xl space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Log out of FINCRED?</h3>
            <p className="text-xs text-slate-400">
              You will need to enter your mobile number/email and password to sign back in.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  onLogoutConfirm();
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
