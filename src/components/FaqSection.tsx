import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: '1. What is FinCred?',
      a: 'FinCred is an independent digital loan-assistance and referral platform. We assist Indian consumers in discovering prospective loan products provided by verified third-party lending partners.',
    },
    {
      q: '2. How does FinCred help me explore loans?',
      a: 'We provide a simplified digital experience where you select your requirement, review basic eligibility criteria, and get seamlessly referred to the authorized lender that matches your profile.',
    },
    {
      q: '3. Does FinCred guarantee loan approval?',
      a: 'No. FinCred does not guarantee loan approval, sanction amount, interest rates, or disbursement under any circumstances. All credit decisions are strictly made by the respective lender.',
    },
    {
      q: '4. Who decides whether my loan is approved?',
      a: 'The independent participating bank, Non-Banking Financial Company (NBFC), or digital lender evaluates your profile and makes the sole final decision on your loan application.',
    },
    {
      q: '5. What documents may be required?',
      a: 'Typically, lenders request your PAN card, Aadhaar or government address proof, recent bank account statements, and salary slips or income tax returns. Exact requirements depend on the chosen lender.',
    },
    {
      q: '6. What determines the interest rate?',
      a: 'Interest rates and APR are set by the individual lender based on your credit score, repayment capacity, employment profile, requested loan amount, and tenure.',
    },
    {
      q: '7. Can my application be rejected?',
      a: 'Yes. An application can be declined if an applicant does not satisfy the underwriting policies, risk criteria, or documentation standards of the prospective lender.',
    },
    {
      q: '8. Why can a lender reject an application?',
      a: 'Common reasons include a low credit score, past defaults, high debt-to-income ratio, irregular income deposits, unserviceable locations, or discrepancy in submitted documentation.',
    },
    {
      q: '9. How long does the loan process take?',
      a: 'Submitting your initial details on FinCred takes 2-3 minutes. The subsequent verification, credit assessment, and disbursement duration varies by lender, ranging from a few hours to several business days.',
    },
    {
      q: '10. Are there any processing fees?',
      a: 'FinCred charges zero upfront registration or platform processing fees to users. Lenders may deduct their own processing fee directly from the sanctioned loan amount as specified in their sanction letter.',
    },
    {
      q: '11. How is my information used?',
      a: 'Your information is used strictly to assess eligibility and transmit your loan request securely to authorized lending partners. We adhere to high data privacy standards and never sell your data to unauthorized entities.',
    },
    {
      q: '12. What should I check before accepting a loan?',
      a: 'Always thoroughly inspect the Key Fact Statement (KFS), final sanctioned amount, annual percentage rate (APR), monthly EMI, repayment tenure, processing fee deductions, and prepayment conditions before signing.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 sm:py-20 bg-slate-50 border-b border-slate-200/90" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            Questions & Clarity
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Transparent answers to help you navigate your loan application process with confidence.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
