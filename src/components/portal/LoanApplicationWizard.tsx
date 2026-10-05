import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  IndianRupee,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  Loader2,
  Clock,
  ShieldCheck,
  Building2,
  FileCheck2,
  Save,
  Check
} from 'lucide-react';
import { Customer, LoanApplication, ApplicationDocument, LoanCategory } from '../../types.js';
import { submitLoanApplication, uploadApplicationDocument } from '../../services/api.js';

interface LoanApplicationWizardProps {
  customer: Customer;
  existingApplication?: LoanApplication | null;
  onSuccess: (application?: LoanApplication) => void;
  onCancel?: () => void;
  onClose?: () => void;
  initialCategory?: LoanCategory | string;
}

export const LoanApplicationWizard: React.FC<LoanApplicationWizardProps> = ({
  customer,
  existingApplication,
  onSuccess,
  onCancel,
  onClose,
  initialCategory
}) => {
  const handleDismiss = () => {
    if (onClose) onClose();
    else if (onCancel) onCancel();
  };
  // Wizard steps: 1 to 5
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Step 1: Personal Details
  const initialParts = (customer.fullName || '').trim().split(' ');
  const [firstName, setFirstName] = useState(customer.firstName || initialParts[0] || '');
  const [lastName, setLastName] = useState(customer.lastName || initialParts.slice(1).join(' ') || '');
  const [fullName, setFullName] = useState(customer.fullName || '');
  const [mobileNumber] = useState(customer.mobileNumber || '');
  const [email, setEmail] = useState(customer.email || '');
  const [dob, setDob] = useState(customer.dob || customer.dateOfBirth || '');
  const [gender, setGender] = useState('Male');
  const [panNumber, setPanNumber] = useState(customer.panNumber || '');
  const [pincode, setPincode] = useState(customer.pincode || '');
  const [city, setCity] = useState(customer.city || '');

  // Step 2: Employment & Income
  const [employmentType, setEmploymentType] = useState(customer.employmentType || 'Salaried');
  const [employerName, setEmployerName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState<number | string>(customer.monthlyIncome || 45000);
  const [salaryMode, setSalaryMode] = useState('Bank Transfer');
  const [existingEmi, setExistingEmi] = useState<number | string>(0);

  // Step 3: Loan Details
  const [loanCategory, setLoanCategory] = useState<string>(initialCategory || existingApplication?.loanCategory || 'Personal Loan');
  const [amountRequested, setAmountRequested] = useState<number | string>(
    existingApplication?.amountRequested || customer.requiredLoanAmount || customer.amountRequested || 250000
  );
  const [tenureMonths, setTenureMonths] = useState<number>(36);
  const [loanPurpose, setLoanPurpose] = useState('Personal / Medical / Family Needs');

  // Step 4: Documents
  const [documents, setDocuments] = useState<ApplicationDocument[]>(
    existingApplication?.documents && existingApplication.documents.length > 0
      ? existingApplication.documents
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
        ]
  );
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  // Step 5: Review & Consent
  const [hasConsented, setHasConsented] = useState(true);

  // Restore draft from sessionStorage if exists
  useEffect(() => {
    try {
      const draft = sessionStorage.getItem(`fc_draft_${customer.customerId}`);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.employerName) setEmployerName(parsed.employerName);
        if (parsed.monthlyIncome) setMonthlyIncome(parsed.monthlyIncome);
        if (parsed.amountRequested) setAmountRequested(parsed.amountRequested);
        if (parsed.loanCategory) setLoanCategory(parsed.loanCategory);
      }
    } catch {
      // Ignore
    }
  }, [customer.customerId]);

  const saveDraft = () => {
    try {
      const draftData = {
        currentStep,
        fullName,
        email,
        dob,
        panNumber,
        pincode,
        city,
        employmentType,
        employerName,
        monthlyIncome,
        salaryMode,
        existingEmi,
        loanCategory,
        amountRequested,
        tenureMonths,
        loanPurpose
      };
      sessionStorage.setItem(`fc_draft_${customer.customerId}`, JSON.stringify(draftData));
      setSuccessNotice('Draft progress saved! You can continue anytime.');
      setTimeout(() => setSuccessNotice(''), 3000);
    } catch {
      // Ignore
    }
  };

  const stepsList = [
    { num: 1, label: 'Personal', icon: User },
    { num: 2, label: 'Income', icon: Briefcase },
    { num: 3, label: 'Loan', icon: IndianRupee },
    { num: 4, label: 'Documents', icon: FileText },
    { num: 5, label: 'Submit', icon: CheckCircle2 }
  ];

  // Document upload handler
  const handleFileUpload = async (docType: string, docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds 5MB limit. Please upload a smaller file.');
      return;
    }

    setUploadingDocType(docType);
    setErrorMessage('');

    try {
      // Read as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        // If existing application id is available, upload directly to server
        if (existingApplication?.applicationId) {
          const res = await uploadApplicationDocument({
            applicationId: existingApplication.applicationId,
            docType,
            name: docName,
            fileBase64: base64Data,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type
          });

          if (res.success && res.document) {
            setDocuments(prev => prev.map(d => d.docType === docType ? res.document : d));
          }
        } else {
          // Store in state document checklist
          setDocuments(prev =>
            prev.map(d =>
              d.docType === docType
                ? {
                    ...d,
                    fileName: file.name,
                    fileUrl: base64Data,
                    fileSize: file.size,
                    status: 'UPLOADED',
                    uploadedAt: new Date().toISOString()
                  }
                : d
            )
          );
        }
        setUploadingDocType(null);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage('Failed to upload document. Please try again.');
      setUploadingDocType(null);
    }
  };

  // Step Validation & Navigation
  const handleNext = () => {
    setErrorMessage('');

    if (currentStep === 1) {
      if (!firstName.trim()) {
        setErrorMessage('Please enter your First Name.');
        return;
      }
      if (!lastName.trim()) {
        setErrorMessage('Please enter your Last Name.');
        return;
      }
      if (!dob) {
        setErrorMessage('Please enter your Date of Birth.');
        return;
      }
      if (!monthlyIncome || Number(monthlyIncome) <= 0) {
        setErrorMessage('Please enter your Monthly Net Income.');
        return;
      }
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      const cleanPan = panNumber.trim().toUpperCase();
      if (!cleanPan || cleanPan.length < 8) {
        setErrorMessage('Please enter a valid PAN Card (e.g. ABCDE1234F) or Voter ID Number.');
        return;
      }
      if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
        setErrorMessage('Please enter a valid 6-digit Pincode.');
        return;
      }
    } else if (currentStep === 2) {
      if (!monthlyIncome || Number(monthlyIncome) <= 0) {
        setErrorMessage('Please enter your monthly in-hand income.');
        return;
      }
    } else if (currentStep === 3) {
      if (!amountRequested || Number(amountRequested) < 25000) {
        setErrorMessage('Minimum loan request amount is ₹25,000.');
        return;
      }
    }

    saveDraft();
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setErrorMessage('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    setErrorMessage('');
    if (!hasConsented) {
      setErrorMessage('Please agree to the privacy policy and consent declaration to submit your application.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await submitLoanApplication({
        fullName: fullName.trim(),
        mobileNumber,
        email: email.trim().toLowerCase(),
        dob,
        panNumber: panNumber.trim().toUpperCase(),
        pincode: pincode.trim(),
        loanCategory,
        amountRequested: Number(amountRequested),
        employmentType,
        monthlyIncome: Number(monthlyIncome),
        city,
        customerId: customer.customerId,
        hasConsented: true,
        source: 'web'
      });

      if (res.success && res.application) {
        // Upload any pending documents if they were uploaded locally
        for (const doc of documents) {
          if (doc.status === 'UPLOADED' && doc.fileUrl && doc.fileUrl.startsWith('data:')) {
            try {
              await uploadApplicationDocument({
                applicationId: res.application.applicationId,
                docType: doc.docType,
                name: doc.name,
                fileBase64: doc.fileUrl,
                fileName: doc.fileName || `${doc.name}.pdf`,
                fileSize: doc.fileSize
              });
            } catch {
              // Non-blocking
            }
          }
        }

        // Clear draft
        sessionStorage.removeItem(`fc_draft_${customer.customerId}`);
        onSuccess(res.application);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Application submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
      
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
            New Loan Application
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
            Apply for Loan
          </h2>
          <p className="text-xs text-slate-500">
            Step-by-step paperless evaluation across RBI-registered lender network
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={saveDraft}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Exit</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Visible Step Indicator: Personal → Income → Loan → Documents → Submit */}
      <div className="py-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (stepsList.length - 1)) * 100}%` }}
          />

          {stepsList.map(step => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            const Icon = step.icon;

            return (
              <div key={step.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                      : 'bg-white border border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-bold mt-1.5 transition-colors ${
                    isCurrent ? 'text-blue-700' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error & Success Messages */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* STEP 1: PERSONAL DETAILS */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-600" />
            <span>Step 1: Personal Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={e => {
                  setFirstName(e.target.value);
                  setFullName(`${e.target.value} ${lastName}`.trim());
                }}
                placeholder="e.g. Rahul"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={e => {
                  setLastName(e.target.value);
                  setFullName(`${firstName} ${e.target.value}`.trim());
                }}
                placeholder="e.g. Sharma"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Date of Birth (DOB) *</label>
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Monthly Net Income (₹) *</label>
              <input
                type="number"
                min={1000}
                value={monthlyIncome}
                onChange={e => setMonthlyIncome(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 45000"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 font-mono font-bold text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">PAN Card / Voter ID Number *</label>
              <input
                type="text"
                maxLength={16}
                value={panNumber}
                onChange={e => setPanNumber(e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F or Voter ID"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 font-mono font-bold uppercase text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mobile Number (Verified)</label>
              <input
                type="text"
                disabled
                value={`+91 ${mobileNumber}`}
                className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 font-mono font-bold text-sm text-slate-600 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Residential Pincode *</label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="110001"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 font-mono font-bold text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: EMPLOYMENT & INCOME */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Step 2: Employment & Income Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Employment Type *</label>
              <select
                value={employmentType}
                onChange={e => setEmploymentType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
              >
                <option value="Salaried">Salaried (Private / Govt)</option>
                <option value="Self-Employed">Self-Employed Professional</option>
                <option value="Business Owner">Business Owner / Trader</option>
                <option value="Freelancer / Other">Freelancer / Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Company / Business Name</label>
              <input
                type="text"
                value={employerName}
                onChange={e => setEmployerName(e.target.value)}
                placeholder="e.g. Tata Consultancy / Self"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Net Monthly In-Hand Income *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-mono font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min={10000}
                  step={5000}
                  value={monthlyIncome}
                  onChange={e => setMonthlyIncome(e.target.value)}
                  placeholder="45000"
                  className="w-full pl-8 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 font-mono font-bold text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Salary Received Mode</label>
              <select
                value={salaryMode}
                onChange={e => setSalaryMode(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
              >
                <option value="Bank Transfer">Direct Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Total Existing Monthly EMIs (if any)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-mono font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={existingEmi}
                  onChange={e => setExistingEmi(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 font-mono font-bold text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: LOAN DETAILS */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <span>Step 3: Loan Requirement & Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Loan Category *</label>
              <select
                value={loanCategory}
                onChange={e => setLoanCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
              >
                <option value="Personal Loan">Personal Loan (Choice Connect / Direct Bank)</option>
                <option value="Personal / Business Loan">Personal / Business Loan (WeRize NBFC)</option>
                <option value="Instant Loan">Instant Cash Loan (TrueBalance Partner)</option>
                <option value="All Type Loan">Multi-Bank Loan (RuLoans Network)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Requested Loan Amount (₹) *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-mono font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min={25000}
                  max={2500000}
                  step={10000}
                  value={amountRequested}
                  onChange={e => setAmountRequested(e.target.value)}
                  placeholder="250000"
                  className="w-full pl-8 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 font-mono font-bold text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Preferred Tenure</label>
              <select
                value={tenureMonths}
                onChange={e => setTenureMonths(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
              >
                <option value={12}>12 Months (1 Year)</option>
                <option value={24}>24 Months (2 Years)</option>
                <option value={36}>36 Months (3 Years)</option>
                <option value={48}>48 Months (4 Years)</option>
                <option value={60}>60 Months (5 Years)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Primary Purpose</label>
              <select
                value={loanPurpose}
                onChange={e => setLoanPurpose(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
              >
                <option value="Personal / Medical / Family Needs">Medical / Family Emergency</option>
                <option value="Debt Consolidation / Credit Card Bill">Debt Consolidation</option>
                <option value="Home Renovation / Improvement">Home Renovation</option>
                <option value="Business Working Capital">Business Working Capital</option>
                <option value="Education / Travel">Education / Travel</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: REQUIRED DOCUMENTS */}
      {currentStep === 4 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Step 4: Upload Required Documents</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">PDF, JPG, PNG (Max 5MB)</span>
          </div>

          <p className="text-xs text-slate-600">
            Upload clear digital copies for paperless verification. You can also upload or update documents later from the Customer Portal.
          </p>

          <div className="space-y-3">
            {documents.map(doc => {
              const isUploaded = doc.status === 'UPLOADED' || doc.status === 'VERIFIED';
              const isUploading = uploadingDocType === doc.docType;

              return (
                <div
                  key={doc.id || doc.docType}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{doc.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isUploaded
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isUploaded ? 'UPLOADED' : 'PENDING'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {isUploaded && doc.fileName ? `File: ${doc.fileName}` : 'Upload scanned copy or photo'}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <label className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isUploaded
                        ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}>
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploaded ? 'Re-upload' : 'Upload File'}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        disabled={isUploading}
                        onChange={e => handleFileUpload(doc.docType, doc.name, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & SUBMIT */}
      {currentStep === 5 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Step 5: Review & Submit Application</span>
          </h3>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
              <span className="font-bold text-slate-700">Applicant:</span>
              <span className="font-black text-slate-900">{fullName} (+91 {mobileNumber})</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
              <span className="font-bold text-slate-700">PAN & DOB:</span>
              <span className="font-mono font-bold text-slate-900">{panNumber} • {dob}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
              <span className="font-bold text-slate-700">Requested Loan:</span>
              <span className="font-mono font-black text-emerald-700 text-sm">
                ₹{Number(amountRequested).toLocaleString('en-IN')} ({loanCategory})
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
              <span className="font-bold text-slate-700">Employment & Income:</span>
              <span className="font-bold text-slate-900">
                {employmentType} • ₹{Number(monthlyIncome).toLocaleString('en-IN')}/mo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Preferred Tenure:</span>
              <span className="font-bold text-slate-900">{tenureMonths} Months</span>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasConsented}
                onChange={e => setHasConsented(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-600 leading-snug">
                I hereby declare all provided information is accurate. I acknowledge that loan sanction and interest rates are determined by RBI-registered partner lenders based on their credit assessment.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            disabled={isLoading}
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isLoading || !hasConsented}
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <span>SUBMIT APPLICATION</span>
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
