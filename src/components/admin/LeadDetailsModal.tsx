import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Briefcase,
  IndianRupee,
  Building2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Laptop,
  Smartphone,
  Copy,
  Check,
  Eye,
  EyeOff,
  FileText,
  Upload,
  AlertCircle,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { LoanApplication, ApplicationStatus, ApplicationDocument } from '../../types.js';

interface LeadDetailsModalProps {
  application: LoanApplication | null;
  onClose: () => void;
  onStatusChange: (appId: string, status: ApplicationStatus) => Promise<void>;
  onDocumentStatusChange?: (appId: string, docId: string, status: 'VERIFIED' | 'RE_UPLOAD_REQUESTED' | 'REJECTED' | 'UPLOADED' | 'PENDING', remark?: string) => Promise<void>;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  application,
  onClose,
  onStatusChange,
  onDocumentStatusChange
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPanRevealed, setIsPanRevealed] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updatingDocId, setUpdatingDocId] = useState<string | null>(null);
  const [reUploadRemarkPrompt, setReUploadRemarkPrompt] = useState<{ docId: string; docName: string } | null>(null);
  const [remarkInput, setRemarkInput] = useState('');

  if (!application) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusSelect = async (newStatus: ApplicationStatus) => {
    setIsUpdatingStatus(true);
    try {
      await onStatusChange(application.applicationId, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDocAction = async (docId: string, status: 'VERIFIED' | 'RE_UPLOAD_REQUESTED', remark?: string) => {
    if (!onDocumentStatusChange) return;
    setUpdatingDocId(docId);
    try {
      await onDocumentStatusChange(application.applicationId, docId, status, remark);
      setReUploadRemarkPrompt(null);
      setRemarkInput('');
    } finally {
      setUpdatingDocId(null);
    }
  };

  const panToDisplay = isPanRevealed
    ? (application.panNumber || application.panMasked || 'Not provided')
    : (application.panMasked || (application.panNumber ? `${application.panNumber.slice(0, 2)}••••••${application.panNumber.slice(-2)}` : '••••••••'));

  const docsList: ApplicationDocument[] = application.documents && application.documents.length > 0
    ? application.documents
    : [
        {
          id: 'doc-pan',
          name: 'PAN Card',
          docType: 'PAN',
          fileName: '',
          fileUrl: '',
          status: 'PENDING'
        },
        {
          id: 'doc-aadhaar',
          name: 'Aadhaar Card (Front & Back)',
          docType: 'AADHAAR',
          fileName: '',
          fileUrl: '',
          status: 'PENDING'
        },
        {
          id: 'doc-statement',
          name: 'Bank Statement (Last 3 Months)',
          docType: 'BANK_STATEMENT',
          fileName: '',
          fileUrl: '',
          status: 'PENDING'
        }
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl my-6 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {application.applicationId}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  {application.loanCategory}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Submitted on {new Date(application.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Status Section (Updated with all Portal Stages) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-amber-900 block">
                Current Application Status:
              </span>
              <span className="text-base font-black text-amber-950 font-['Outfit',sans-serif]">
                {application.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">
                Update Status:
              </label>
              <select
                value={application.status}
                disabled={isUpdatingStatus}
                onChange={e => handleStatusSelect(e.target.value as ApplicationStatus)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
              >
                <optgroup label="Portal Primary Stages">
                  <option value="APPLICATION STARTED">APPLICATION STARTED</option>
                  <option value="DETAILS SUBMITTED">DETAILS SUBMITTED</option>
                  <option value="DOCUMENTS SUBMITTED">DOCUMENTS SUBMITTED</option>
                  <option value="VERIFICATION">VERIFICATION</option>
                  <option value="UNDER REVIEW">UNDER REVIEW</option>
                  <option value="DECISION">DECISION</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </optgroup>
                <optgroup label="System / Partner States">
                  <option value="NEW">NEW</option>
                  <option value="FORM SUBMITTED">FORM SUBMITTED</option>
                  <option value="PARTNER SELECTED">PARTNER SELECTED</option>
                  <option value="REDIRECTED">REDIRECTED</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CLOSED">CLOSED</option>
                </optgroup>
              </select>
            </div>
            {application.adminUpdated && (
              <div className="w-full pt-1 border-t border-amber-200/60 text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                <span>⚠️ Note: Status manually verified/updated by Admin</span>
              </div>
            )}
          </div>

          {/* Grid 1: Personal Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Customer Personal Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[10px]">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{application.fullName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Mobile Number</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-800">+91 {application.mobileNumber}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(application.mobileNumber, 'mobile')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                    title="Copy Mobile"
                  >
                    {copiedField === 'mobile' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Email Address</span>
                <span className="font-medium text-slate-800">
                  {application.email || 'Not provided'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">PAN Card</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 tracking-wider">
                    {panToDisplay}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPanRevealed(!isPanRevealed)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                    title={isPanRevealed ? 'Mask PAN' : 'Reveal PAN'}
                  >
                    {isPanRevealed ? <EyeOff className="w-3 h-3 text-amber-600" /> : <Eye className="w-3 h-3 text-blue-600" />}
                  </button>
                  {isPanRevealed && (application.panNumber || application.panMasked) && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(application.panNumber || application.panMasked, 'pan')}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                      title="Copy PAN"
                    >
                      {copiedField === 'pan' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                <span className="font-medium text-slate-800">
                  {application.dateOfBirth || application.dob || 'Not provided'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Pincode</span>
                <span className="font-mono font-bold text-slate-800">
                  {application.pincode || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Grid 2: Loan & Financial Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Loan & Employment Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[10px]">Loan Category</span>
                <span className="font-bold text-slate-900">{application.loanCategory}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Requested Amount</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {application.amountRequested ? `₹${application.amountRequested.toLocaleString('en-IN')}` : 'As Eligible'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Employment Type</span>
                <span className="font-medium text-slate-800 capitalize">
                  {application.employmentType || 'Not specified'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Monthly Income</span>
                <span className="font-medium text-slate-800">
                  {application.monthlyIncome ? `₹${Number(application.monthlyIncome).toLocaleString('en-IN')}/mo` : 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Grid 3: DOCUMENTS & VERIFICATION STATUS */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Customer Uploaded Documents & Verification</span>
            </h4>

            {reUploadRemarkPrompt && (
              <div className="p-3 mb-3 rounded-2xl bg-amber-50 border border-amber-300 space-y-2">
                <span className="text-xs font-bold text-amber-900 block">
                  Request Re-upload for: {reUploadRemarkPrompt.docName}
                </span>
                <input
                  type="text"
                  value={remarkInput}
                  onChange={e => setRemarkInput(e.target.value)}
                  placeholder="Enter reason for customer (e.g. Blurry photo, please re-upload clear image)"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-amber-300 outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReUploadRemarkPrompt(null)}
                    className="px-3 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDocAction(reUploadRemarkPrompt.docId, 'RE_UPLOAD_REQUESTED', remarkInput)}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Send Re-upload Request
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              {docsList.map(doc => {
                const isUploaded = doc.status === 'UPLOADED' || doc.status === 'VERIFIED';
                const isVerified = doc.status === 'VERIFIED';
                const isReUpload = doc.status === 'RE_UPLOAD_REQUESTED';
                const isProcessing = updatingDocId === doc.id || updatingDocId === doc.docType;

                return (
                  <div
                    key={doc.id || doc.docType}
                    className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{doc.name}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : isReUpload
                              ? 'bg-amber-100 text-amber-800'
                              : isUploaded
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {doc.fileName ? `File: ${doc.fileName}` : 'No file uploaded yet'}
                        {doc.adminRemark && ` • Note: ${doc.adminRemark}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {doc.fileUrl && !doc.fileUrl.startsWith('data:') && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          View File
                        </a>
                      )}

                      {onDocumentStatusChange && isUploaded && !isVerified && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleDocAction(doc.id || doc.docType, 'VERIFIED')}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                        >
                          Mark Verified
                        </button>
                      )}

                      {onDocumentStatusChange && isUploaded && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => setReUploadRemarkPrompt({ docId: doc.id || doc.docType, docName: doc.name })}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
                        >
                          Ask Re-upload
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid 4: Audit & Device Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Device & Verification Trace</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Source</span>
                <span className="font-semibold text-slate-800 capitalize">{application.source || 'Web'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Device</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {application.deviceSummary || application.deviceType || 'Web Browser'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Location</span>
                <span className="font-semibold text-slate-800 truncate block">{application.location || 'India'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">IP Address</span>
                <span className="font-mono text-slate-800 truncate block">{application.ipAddress || 'Recorded'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Lead ID: {application.applicationId}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
