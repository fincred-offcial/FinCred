import React, { useState, useEffect } from 'react';
import {
  Workflow,
  UserCheck,
  FileText,
  Receipt,
  AlertCircle,
  ShieldAlert,
  Lock,
  Scale,
  HelpCircle,
  Headphones,
  ChevronRight,
  ChevronDown,
  X,
  ArrowRight,
  Send,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { LegalModal, LegalModalType } from './LegalModals.js';

export type InfoItemId =
  | 'how-it-works'
  | 'eligibility'
  | 'documents'
  | 'costs'
  | 'rejection'
  | 'before-apply'
  | 'privacy'
  | 'disclaimer'
  | 'faq'
  | 'contact';

interface InfoItemConfig {
  id: InfoItemId;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge?: string;
}

const INFO_ITEMS: InfoItemConfig[] = [
  {
    id: 'how-it-works',
    title: 'How FinCred Works',
    subtitle: '6-step digital loan assistance journey',
    icon: Workflow,
    badge: 'Process'
  },
  {
    id: 'eligibility',
    title: 'Eligibility',
    subtitle: 'General criteria & lender variability',
    icon: UserCheck,
    badge: 'Criteria'
  },
  {
    id: 'documents',
    title: 'Documents Required',
    subtitle: 'Standard KYC & income proofs checklist',
    icon: FileText,
    badge: 'Checklist'
  },
  {
    id: 'costs',
    title: 'Loan Costs & Charges',
    subtitle: 'APR, processing fees, EMIs & total repayment',
    icon: Receipt,
    badge: 'Transparency'
  },
  {
    id: 'rejection',
    title: 'Why Applications May Be Declined',
    subtitle: 'Key factors considered by lending institutions',
    icon: AlertCircle,
    badge: 'Important'
  },
  {
    id: 'before-apply',
    title: 'Before You Apply',
    subtitle: '6 essential safety & verification guidelines',
    icon: ShieldAlert,
    badge: 'Safety'
  },
  {
    id: 'privacy',
    title: 'Privacy & Data',
    subtitle: 'How your customer information is protected',
    icon: Lock,
    badge: 'Security'
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    subtitle: 'Platform role & non-guarantee statement',
    icon: Scale,
    badge: 'Statutory'
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    subtitle: 'Answers to 8 common borrower questions',
    icon: HelpCircle,
    badge: 'Q&A'
  },
  {
    id: 'contact',
    title: 'Contact & Support',
    subtitle: 'Verified support channels & inquiry form',
    icon: Headphones,
    badge: 'Help'
  }
];

export const ImportantInformationSection: React.FC = () => {
  const [activeItem, setActiveItem] = useState<InfoItemId | null>(null);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Form state for Contact modal
  const [contactForm, setContactForm] = useState({
    name: '',
    mobile: '',
    subject: 'Personal Loan',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Listen to window hash changes to open corresponding modal if user clicked link in header/footer
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'how-it-works') setActiveItem('how-it-works');
      else if (hash === 'eligibility') setActiveItem('eligibility');
      else if (hash === 'faq') setActiveItem('faq');
      else if (hash === 'contact') setActiveItem('contact');
      else if (hash === 'disclaimer') setActiveItem('disclaimer');
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveItem(null);
      }
    };
    if (activeItem) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeItem]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({ name: '', mobile: '', subject: 'Personal Loan', message: '' });
    }, 4000);
  };

  const renderModalContent = () => {
    switch (activeItem) {
      case 'how-it-works':
        return (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Borrower Roadmap
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 font-['Outfit',sans-serif]">
                How FinCred Works
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                A simple, transparent 6-step flow connecting you with authorized Indian lenders.
              </p>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  step: '01',
                  title: 'Submit basic details',
                  desc: 'Provide your basic profile, employment type, and requested loan requirement online.'
                },
                {
                  step: '02',
                  title: 'Check available options',
                  desc: 'Explore loan options and referral channels matched to your general profile.'
                },
                {
                  step: '03',
                  title: 'Review applicable lender information',
                  desc: 'Understand indicative eligibility criteria, indicative interest rates, and loan features.'
                },
                {
                  step: '04',
                  title: 'Proceed with the relevant lender',
                  desc: 'Transition smoothly to the chosen partner institution or verified digital application.'
                },
                {
                  step: '05',
                  title: 'Lender performs its assessment',
                  desc: 'The lender independently verifies your KYC, income records, and credit bureau score.'
                },
                {
                  step: '06',
                  title: 'Final decision is made by the lender',
                  desc: 'All sanction terms, interest rates, charges, and disbursement decisions rest strictly with the lender.'
                }
              ].map(item => (
                <div
                  key={item.step}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 leading-relaxed">
              <strong>Please Note:</strong> FinCred does not charge borrowers any advance fees for loan referrals or exploring options.
            </div>
          </div>
        );

      case 'eligibility':
        return (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Evaluation Guidelines
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 font-['Outfit',sans-serif]">
                Eligibility
              </h3>
              <p className="text-xs font-medium text-slate-700 mt-1">
                Eligibility requirements vary by loan product and lender.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Age', desc: 'Typically between 21 and 60 years at the time of loan application.' },
                { title: 'Income', desc: 'Regular verified monthly salary or consistent business cashflow.' },
                { title: 'Employment / Business Profile', desc: 'Salaried at registered companies, self-employed, or established businesses.' },
                { title: 'Credit Profile', desc: 'Bureau repayment track record (e.g. CIBIL, Experian) evaluated by lenders.' },
                { title: 'Existing Obligations', desc: 'Current ongoing EMIs relative to net monthly earnings (FOIR / DTI ratio).' },
                { title: 'Other Lender Criteria', desc: 'Work vintage, location serviceability, and specific institutional guidelines.' }
              ].map(item => (
                <div key={item.title} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-blue-600">• {item.title}</span>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                Meeting basic criteria does not guarantee approval.
              </p>
              <p className="text-[11px] text-amber-800">
                Lenders assess applications holistically based on internal credit risk frameworks, risk tiering, and compliance guidelines.
              </p>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Verification Checklist
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 font-['Outfit',sans-serif]">
                Documents Required
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Documents may include the following standard verification items:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'PAN Card', desc: 'Mandatory primary identifier for all financial and credit bureau checks in India.' },
                { title: 'Identity & Address Proof', desc: 'Aadhaar Card, Passport, Voter ID, Driving License, or verified utility bills.' },
                { title: 'Income Information', desc: 'Salary slips (past 3 months) or audited ITR / financial statements for businesses.' },
                { title: 'Banking Information', desc: 'Bank account statements (past 3–6 months) reflecting salary credits or business operations.' },
                { title: 'Employment / Business Details', desc: 'Official company email, appointment letter, employee ID, or GST/Udyam certificate.' },
                { title: 'Other Lender Documents', desc: 'Additional verifications as requested by the specific lending institution.' }
              ].map(item => (
                <div key={item.title} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 font-medium">
              Requirements may vary by lender and loan product. Digital applications often verify documents via Aadhaar OTP and Account Aggregator.
            </div>
          </div>
        );

      case 'costs':
        return (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Transparent Borrowing
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 font-['Outfit',sans-serif]">
                Loan Costs & Charges
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Before accepting any loan offer, always review the Key Fact Statement (KFS):
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Interest Rate / APR', desc: 'Annual Percentage Rate represents the true yearly cost of borrowing, including fees.' },
                { title: 'Processing Fee', desc: 'One-time administrative fee charged by the lender upon sanction, usually 1% to 3%.' },
                { title: 'Applicable Charges', desc: 'Verification fees, stamp duty, NACH/e-mandate setup fees, and statutory GST.' },
                { title: 'Tenure', desc: 'Total loan duration in months or years, which impacts total interest paid over time.' },
                { title: 'EMI Amount', desc: 'Equated Monthly Installment due on a scheduled monthly date.' },
                { title: 'Total Repayment Amount', desc: 'Cumulative sum of principal borrowed, total interest, and applicable loan charges.' }
              ].map(item => (
                <div key={item.title} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-1.5">
              <p className="font-bold text-blue-300">
                Actual terms and charges are determined by the respective lender.
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                FinCred does not impose interest rates or disburse funds. Read the loan agreement and sanction letter issued by the lender carefully before signing.
              </p>
            </div>
          </div>
        );

      case 'rejection':
        return (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                Risk Factors
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 font-['Outfit',sans-serif]">
                Why Can a Loan Application Be Declined?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                A lender may decline an application because of factors such as:
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'Credit profile', desc: 'Past delays in repayments, high credit card utilization, or low bureau credit scores.' },
                { title: 'Income or repayment capacity', desc: 'Declared income insufficient to comfortably service new loan obligations.' },
                { title: 'Existing obligations', desc: 'High debt-to-income ratio (already paying multiple active EMIs).' },
                { title: 'Eligibility criteria', desc: 'Age, job stability, location non-serviceability, or employer profile mismatch.' },
                { title: 'Incomplete or incorrect information', desc: 'Discrepancies in PAN, address proof, or bank statement verifications.' },
                { title: 'Internal risk assessment', desc: 'Lender-specific industry policies or internal underwriting thresholds.' }
              ].map(item => (
                <div key={item.title} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <p className="font-bold">FinCred does not control the lender’s final decision.</p>
              <p className="text-[11px] text-amber-800 mt-1">
                A decline from one lender does not prevent you from improving your credit profile and exploring other options later.
              </p>
            </div>
          </div>
        );

      case 'before-apply':
        return (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Safety First
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 font-['Outfit',sans-serif]">
                Before You Apply
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please follow these 6 essential borrower safety guidelines:
              </p>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Review lender and loan terms carefully', desc: 'Ensure you understand all clauses, loan repayment dates, and terms.' },
                { title: 'Check applicable interest rate/APR and charges', desc: 'Inspect processing fees, bounce charges, and foreclosure rules upfront.' },
                { title: 'Understand your repayment obligation', desc: 'Borrow only what your monthly budget comfortably allows you to repay on time.' },
                { title: 'Keep your information accurate', desc: 'Mismatched personal or income records can delay or cancel applications.' },
                { title: 'Never share OTP, PIN or password', desc: 'FinCred and legitimate lenders will never ask for your banking passwords or OTPs.' },
                { title: 'Do not pay anyone promising guaranteed approval', desc: 'Guaranteed loans are illegal. Legitimate lending is strictly merit-based.' }
              ].map(item => (
                <div key={item.title} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium">
              Report any suspicious caller claiming to guarantee a loan from FinCred immediately to support@fincred.in.
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Data Protection
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 font-['Outfit',sans-serif]">
                Privacy & Data
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                How customer information is handled on FinCred:
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-700 leading-relaxed">
              <p>
                At FinCred, protecting your personal and financial information is our highest priority. We collect basic details solely for facilitating loan referrals, verifying preliminary eligibility criteria, and connecting you with authorized lending partners.
              </p>
              <p>
                We employ standard 256-bit SSL encryption to safeguard data in transit. We never sell your personal information to unauthorized third-party marketing companies, nor do we request or store your banking passwords, ATM PINs, or UPI credentials.
              </p>
              <p>
                Any data shared with partnering banks or NBFCs is conducted with explicit borrower consent to process and evaluate your loan application.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setLegalModalType('privacy')}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <span>Read Full Privacy Policy</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'disclaimer':
        return (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Statutory Notice
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 font-['Outfit',sans-serif]">
                Disclaimer
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Full platform role and non-guarantee declaration:
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-800 leading-relaxed">
              <p className="font-semibold text-slate-900 text-sm">
                “FinCred is a loan assistance/referral platform and does not guarantee loan approval. Loan approval, loan amount, interest rate, tenure, charges and other terms are determined by the respective lender based on its applicable eligibility and assessment criteria.”
              </p>
              <p className="text-slate-600">
                FinCred is not a bank, Non-Banking Financial Company (NBFC), or primary credit institution. FinCred does not issue loans directly, take credit underwriting decisions, or disburse funds to borrowers.
              </p>
              <p className="text-slate-600">
                Our technology platform assists users in discovering loan options, understanding criteria, and submitting information to partner lenders. All loans are sanctioned solely at the discretion of the respective lending institutions under applicable RBI regulatory guidelines.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-semibold">
              Loan approval and terms are subject to the respective lender’s criteria.
            </div>
          </div>
        );

      case 'faq':
        const faqList = [
          {
            q: 'What is FinCred?',
            a: 'FinCred is an independent digital loan assistance and referral facilitator based in India. We help consumers explore various personal and business loan options, check general eligibility criteria, and connect with authorized lending partners.'
          },
          {
            q: 'How does FinCred work?',
            a: 'You choose your loan requirement and submit basic preliminary details. FinCred guides you to available options from verified lending partners where you can complete your application digitally.'
          },
          {
            q: 'Does FinCred guarantee loan approval?',
            a: 'No. FinCred does not guarantee loan approval under any circumstances. Guaranteed loan approval does not exist legally. All credit sanctions are based strictly on the respective lender’s independent credit policies.'
          },
          {
            q: 'Who decides loan approval?',
            a: 'The respective RBI-registered bank or NBFC decides whether to sanction or decline an application. They evaluate your credit score, income stability, existing obligations, and verification documents.'
          },
          {
            q: 'What documents may be required?',
            a: 'Standard documents typically include your PAN Card, identity proof (Aadhaar, Voter ID, Passport), recent bank account statements (3-6 months), salary slips or business income records, and proof of address.'
          },
          {
            q: 'Why can an application be declined?',
            a: 'Applications may be declined due to low credit score, high existing debt obligations (EMIs), inconsistent income proof, documentation mismatches, or non-serviceable pin codes according to the lender’s internal policy.'
          },
          {
            q: 'What determines the interest rate?',
            a: 'The interest rate and Annual Percentage Rate (APR) are determined solely by the lender based on your credit profile, employment type, monthly income, loan amount, and chosen tenure.'
          },
          {
            q: 'Are there processing charges?',
            a: 'FinCred does not charge borrowers any advance fees. However, the respective lender may deduct a one-time processing fee (usually 1% to 3% plus GST) from the sanctioned loan amount as specified in their loan agreement.'
          }
        ];

        return (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Frequently Asked Questions
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 font-['Outfit',sans-serif]">
                Common Borrower Questions
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tap each question below to view clear and transparent answers.
              </p>
            </div>

            <div className="space-y-2.5">
              {faqList.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-slate-200 overflow-hidden bg-white transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left p-3.5 flex items-center justify-between gap-3 text-xs font-bold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Support & Inquiries
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 font-['Outfit',sans-serif]">
                Contact & Support
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Get in touch with our team for questions regarding loan assistance or technical guidance.
              </p>
            </div>

            {/* Verified Support Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Mail className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-500 block font-medium">Email Us</span>
                <a href="mailto:support@fincred.in" className="text-xs font-bold text-slate-900 hover:text-blue-600">
                  support@fincred.in
                </a>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Phone className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-500 block font-medium">Toll-Free Assistance</span>
                <span className="text-xs font-bold text-slate-900">1800-200-FINCRED</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-500 block font-medium">Operating Hours</span>
                <span className="text-xs font-bold text-slate-900">Mon–Sat: 9:30 AM–6:30 PM</span>
              </div>
            </div>

            {/* Enquiry Form */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 mb-3 font-['Outfit',sans-serif]">
                Send an Enquiry
              </h4>
              {formSubmitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Thank you! Your enquiry has been received.
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Our support team will review your details and respond within 24 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Enter your name"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        pattern="[6-9][0-9]{9}"
                        value={contactForm.mobile}
                        onChange={e => setContactForm({ ...contactForm, mobile: e.target.value.replace(/\D/g, '') })}
                        placeholder="10-digit mobile"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Query Subject
                    </label>
                    <select
                      value={contactForm.subject}
                      onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Personal Loan">Personal Loan Assistance</option>
                      <option value="Business Loan">Business Loan Assistance</option>
                      <option value="Application Status">Application Status Query</option>
                      <option value="General Support">General Platform Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={contactForm.message}
                      onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Briefly describe what you need assistance with..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <span>Submit Enquiry</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-slate-50/70 border-t border-slate-200" id="important-information">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-[11px] font-bold mb-3">
            <span>Essential Borrower Guidance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
            Important Information
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Tap any item below to view detailed guidelines, statutory disclosures, and lending procedures.
          </p>
        </div>

        {/* 10 Clean Clickable Cards / Expandable Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5 max-w-4xl mx-auto">
          {INFO_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                id={`info-card-${item.id}`}
                onClick={() => setActiveItem(item.id)}
                className="group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/5 transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {item.title}
                      </h3>
                      {item.badge && (
                        <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors ml-2">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Short Statutory Version mandated by Section 10 */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs font-semibold text-slate-500">
            Loan approval and terms are subject to the respective lender’s criteria.
          </p>
        </div>
      </div>

      {/* Modal / Bottom-Sheet for Detailed Information */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setActiveItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-['Outfit',sans-serif]">
                  FinCred Information
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {renderModalContent()}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 text-xs">
              <span className="text-[11px] text-slate-500">
                FinCred Loan Assistance Platform
              </span>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Privacy Modal reader if requested */}
      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
    </section>
  );
};
