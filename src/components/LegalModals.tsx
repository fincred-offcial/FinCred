import React from 'react';
import { X, ShieldCheck, AlertCircle, FileText, Lock, HelpCircle } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'disclaimer' | 'grievance' | 'disclosure' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            {type === 'privacy' && <Lock className="w-5 h-5 text-blue-600" />}
            {type === 'terms' && <FileText className="w-5 h-5 text-blue-600" />}
            {type === 'disclaimer' && <AlertCircle className="w-5 h-5 text-amber-600" />}
            {type === 'grievance' && <HelpCircle className="w-5 h-5 text-blue-600" />}
            {type === 'disclosure' && <ShieldCheck className="w-5 h-5 text-blue-600" />}
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'terms' && 'Terms & Conditions'}
              {type === 'disclaimer' && 'Platform Disclaimer'}
              {type === 'grievance' && 'Grievance & Support Redressal'}
              {type === 'disclosure' && 'Statutory Loan Disclosure'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {type === 'privacy' && (
            <>
              <p>
                FinCred (“we”, “our”, or “us”) operates an independent loan-assistance and referral platform designed to help Indian citizens explore prospective loan options offered by independent financial institutions.
              </p>
              <h4 className="font-bold text-slate-900 text-sm mt-3">1. Information Collection</h4>
              <p>
                We collect information you explicitly provide, such as your full legal name, contact telephone number, email address, and demographic details to determine loan eligibility and facilitate partner referrals.
              </p>
              <h4 className="font-bold text-slate-900 text-sm mt-3">2. Data Utilization & Security</h4>
              <p>
                Your data is never sold to arbitrary unauthorized parties. Contact information is transmitted securely using standard industry protocols to our authorized lending partners when you apply for a loan option.
              </p>
              <h4 className="font-bold text-slate-900 text-sm mt-3">3. Consent & Rights</h4>
              <p>
                By submitting your information, you authorize FinCred and its partner network to communicate with you regarding your application. You may request deletion of your stored records by contacting our grievance officer.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                Welcome to FinCred. By using our website and referral services, you acknowledge and agree to the following terms and operating conditions.
              </p>
              <h4 className="font-bold text-slate-900 text-sm mt-3">1. Nature of Platform</h4>
              <p>
                FinCred is strictly a loan-assistance, information, and referral service. FinCred is NOT a bank, Non-Banking Financial Company (NBFC), or lending institution. We do not lend funds directly.
              </p>
              <h4 className="font-bold text-slate-900 text-sm mt-3">2. No Guaranteed Approval</h4>
              <p>
                FinCred does NOT guarantee loan sanction, approval, disbursement, interest rates, or loan amounts. All lending decisions are made independently by the respective third-party lender under their proprietary credit criteria.
              </p>
              <h4 className="font-bold text-slate-900 text-sm mt-3">3. Free Service</h4>
              <p>
                FinCred does not collect any upfront processing fee or security deposit from applicants. Never pay any fee claiming to be for guaranteed loan approvals.
              </p>
            </>
          )}

          {type === 'disclaimer' && (
            <>
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-medium">
                Important: FinCred is an independent technology facilitator and referral service. FinCred is neither a bank nor an NBFC.
              </div>
              <p>
                All loan products, interest rates, repayment tenures, processing fees, and related charges displayed or referenced are indicative. Final terms are governed exclusively by the agreements executed between the applicant and the respective lender.
              </p>
              <p>
                Submission of details on FinCred does not constitute a loan offer or guarantee of approval. All applications are subject to documentation verification and credit underwriting by the destination lending entity.
              </p>
              <p>
                FinCred disclaims liability for any discrepancy between illustrative computations (e.g. EMI calculators) and actual offers provided by lenders.
              </p>
            </>
          )}

          {type === 'grievance' && (
            <>
              <p>
                In compliance with consumer protection practices and digital lending guidelines, FinCred maintains a dedicated grievance redressal mechanism.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2">
                <p className="font-bold text-slate-900 text-sm">Grievance Officer</p>
                <p><strong>Platform:</strong> FinCred India Support Desk</p>
                <p><strong>Email:</strong> support@fincred.in / grievance@fincred.in</p>
                <p><strong>Response Turnaround:</strong> Typically within 24 to 48 business hours</p>
                <p><strong>Address:</strong> FinCred Digital Operations, India</p>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                For grievances concerning final loan sanctions, interest deductions, or EMI collections, users are also advised to contact their specific sanctioned lending partner directly.
              </p>
            </>
          )}

          {type === 'disclosure' && (
            <>
              <h4 className="font-bold text-slate-900 text-sm">Statutory Loan Disclosure & Code of Conduct</h4>
              <p>
                1. <strong>Lender Decision:</strong> Final loan approval, loan sanction amount, interest rate (APR), processing fees, tenure, and applicable charges are determined solely by the respective lender.
              </p>
              <p>
                2. <strong>Zero Upfront Fees:</strong> FinCred does not charge any upfront platform processing or registration fee from users.
              </p>
              <p>
                3. <strong>Responsible Borrowing:</strong> Applicants should carefully examine the lender’s Key Fact Statement (KFS) and sanction letter before accepting any loan facility.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
