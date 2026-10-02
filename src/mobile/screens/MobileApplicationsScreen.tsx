import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Loader2,
  Sparkles,
  Search
} from 'lucide-react';
import { Customer, LoanApplication, ApplicationStatus } from '../../types.js';
import { appFetchMyApplications } from '../../services/api.js';

interface MobileApplicationsScreenProps {
  customer: Customer | null;
  onNavigateToLoans: () => void;
}

export const MobileApplicationsScreen: React.FC<MobileApplicationsScreenProps> = ({
  customer,
  onNavigateToLoans
}) => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadApplications = async () => {
    setLoading(true);
    try {
      if (customer?.customerId || customer?.mobileNumber) {
        const data = await appFetchMyApplications(customer?.customerId, customer?.mobileNumber);
        setApplications(data);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [customer]);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Request Submitted':
        return {
          bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
          icon: Clock
        };
      case 'Contact Pending':
        return {
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: AlertCircle
        };
      case 'Redirected to Partner':
        return {
          bg: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
          icon: ExternalLink
        };
      case 'Under External Review':
        return {
          bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          icon: Sparkles
        };
      case 'Status Update Pending':
      default:
        return {
          bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
          icon: Clock
        };
    }
  };

  const filtered = applications.filter(a => {
    return (
      a.applicationId.toLowerCase().includes(search.toLowerCase()) ||
      a.loanCategory.toLowerCase().includes(search.toLowerCase()) ||
      a.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      a.status.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white font-['Outfit',sans-serif]">
              My Loan Requests
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time tracking synchronized with FINCRED Admin Panel
          </p>
        </div>

        <button
          type="button"
          onClick={loadApplications}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer active:scale-95 transition-all"
          title="Refresh Applications"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search Input */}
      {applications.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by App ID or loan type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#111827] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>
      )}

      {/* Applications List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-xs">Checking registered applications...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#111A2E] border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No Loan Requests Found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            You haven't submitted any loan assistance applications yet. Browse pre-qualified offers and apply in under 2 minutes.
          </p>
          <button
            type="button"
            onClick={onNavigateToLoans}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
          >
            <span>Explore Loan Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const badge = getStatusBadge(app.status);
            const StatusIcon = badge.icon;

            return (
              <div
                key={app.applicationId}
                className="p-4 rounded-2xl bg-[#111A2E] border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-cyan-400 text-xs tracking-wider">
                      {app.applicationId}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{app.loanCategory}</h3>
                    <p className="text-[11px] text-slate-400">Lending Partner: {app.partnerName}</p>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    <span>{app.status}</span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#0A0F1D]/80 border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400">Requested Amount:</span>
                    <div className="font-bold text-emerald-400 font-mono">
                      {app.amountRequested ? `₹${app.amountRequested.toLocaleString('en-IN')}` : 'Standard'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Masked PAN:</span>
                    <div className="font-mono text-slate-300 font-semibold">
                      {app.panMasked || '••••••••'}
                    </div>
                  </div>
                </div>

                {/* Footer status timeline info */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</span>
                  <span className="text-slate-500 font-mono">
                    {new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
