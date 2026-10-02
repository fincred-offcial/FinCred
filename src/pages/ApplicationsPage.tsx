import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, ExternalLink, ShieldCheck, AlertCircle, Clock, CheckCircle2, ArrowRight, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { fetchCustomerApplications } from '../services/api.js';
import { LoanApplication } from '../types.js';

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { customer, isCustomerLoggedIn, openLoanModal } = useAuth();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Strictly a User Portal Page: redirect to login if not logged in
    if (!isCustomerLoggedIn || !customer) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    fetchCustomerApplications(customer.customerId, customer.mobileNumber)
      .then(apps => {
        setApplications(apps || []);
        setIsLoading(false);
      })
      .catch(() => {
        setApplications([]);
        setIsLoading(false);
      });
  }, [customer, isCustomerLoggedIn, navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Redirected to Partner':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under External Review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Status Update Pending':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Contact Pending':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Request Submitted':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  if (!isCustomerLoggedIn || !customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6 pb-24">
      {/* User Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Customer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            My Loan Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Track referral requests submitted for <span className="font-semibold text-slate-900">{customer.fullName}</span> (+91 {customer.mobileNumber})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            Dashboard
          </Link>
          <Link
            to="/profile"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            My Profile
          </Link>
        </div>
      </div>

      {/* Statutory Status Disclosure */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-bold text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Statutory Status Disclosure</span>
        </div>
        <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed">
          “Final approval and loan status depend on the respective lender or partner. Submission of information or redirection to a partner platform does not guarantee loan approval.”
        </p>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
            Retrieving your application records...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <FileText className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Application Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't submitted any loan referral requests yet. Browse our verified categories and apply in minutes.
            </p>
            <div className="pt-2">
              <Link
                to="/#loans"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <span>Explore Loan Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          applications.map(app => (
            <div
              key={app.applicationId}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      ID: {app.applicationId}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(app.submittedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                    {app.loanCategory}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="block text-[11px] text-slate-500">Applicant Name</span>
                  <span className="font-semibold text-slate-800">{app.fullName}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">Registered Mobile</span>
                  <span className="font-semibold text-slate-800">+91 {app.mobileNumber}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">Partner Platform</span>
                  <span className="font-semibold text-blue-700">{app.partnerName}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">PAN Record</span>
                  <span className="font-mono font-semibold text-slate-800">{app.panMasked || 'Verified'}</span>
                </div>
              </div>

              {app.attachedDriveDocs && app.attachedDriveDocs.length > 0 && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Attached Documents ({app.attachedDriveDocs.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {app.attachedDriveDocs.map((doc, dIdx) => (
                      <a
                        key={dIdx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium shadow-2xs transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate max-w-[180px]">{doc.name}</span>
                        <ExternalLink className="w-3 h-3 text-blue-400 ml-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100">
                <p className="text-[11px] text-slate-500">
                  Transferred securely to partner endpoint with authorized customer referral token.
                </p>
                {app.destinationUrl && (
                  <a
                    href={app.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <span>Re-visit Partner Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
