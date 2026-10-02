import React from 'react';
import { CreditCard, MapPin, FileSpreadsheet, Building2, Briefcase, FileText, AlertCircle } from 'lucide-react';

export const DocumentsSection: React.FC = () => {
  const docs = [
    {
      title: 'PAN Card',
      desc: 'Mandatory primary tax identifier required for identity verification and credit bureau bureau pull.',
      icon: CreditCard,
    },
    {
      title: 'Identity / Address Proof',
      desc: 'Aadhaar card, Passport, Voter ID, or Driving License verifying legal name and current residence.',
      icon: MapPin,
    },
    {
      title: 'Income Information',
      desc: 'Salary slips (last 3-6 months), Form 16, or ITR acknowledgements with computation of income.',
      icon: FileSpreadsheet,
    },
    {
      title: 'Banking Information',
      desc: 'Recent 3 to 6 months bank account statements demonstrating salary credit or operational cash flow.',
      icon: Building2,
    },
    {
      title: 'Employment / Business Details',
      desc: 'Employee ID card, company appointment letter, GST certificate, business incorporation, or shop license.',
      icon: Briefcase,
    },
    {
      title: 'Other Documents',
      desc: 'Additional documentation such as property title papers or collateral records as requested by the lender.',
      icon: FileText,
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-white text-slate-900 border-b border-slate-200/90" id="documents">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            Checklist Guide
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] mt-1">
            Documents You May Need
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Keep these general documents accessible to expedite lender processing once redirected.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {docs.map((doc, idx) => {
            const Icon = doc.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-blue-300 hover:bg-white transition-all space-y-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shadow-xs">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {doc.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Important note */}
        <div className="mt-8 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 max-w-3xl mx-auto text-xs text-blue-950">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Important note:</strong> “Document requirements may vary by lender and loan product. Not all applicants are required to submit identical documentation.”
          </p>
        </div>
      </div>
    </section>
  );
};
