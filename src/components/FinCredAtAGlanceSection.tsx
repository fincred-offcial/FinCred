import React, { useState, useEffect, useRef } from 'react';
import { Users, FileCheck, Star, Smartphone, Landmark, X, ShieldCheck, MessageSquare, CheckCircle2 } from 'lucide-react';

export const FinCredAtAGlanceSection: React.FC = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState({
    customers: 0,
    applications: 0,
    reviews: 0,
  });
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Viewport detection to trigger count animation once
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasAnimated]);

  // Subtle and fast number-count animation (1000ms duration with ease-out)
  useEffect(() => {
    if (!hasAnimated) return;

    const duration = 1200; // ms
    const startTime = performance.now();

    const targetCustomers = 10000;
    const targetApplications = 378;
    const targetReviews = 1000;

    let animationFrameId: number;

    const updateCounts = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCounts({
        customers: Math.round(targetCustomers * easeOut),
        applications: Math.round(targetApplications * easeOut),
        reviews: Math.round(targetReviews * easeOut),
      });

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounts);
      }
    };

    animationFrameId = requestAnimationFrame(updateCounts);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasAnimated]);

  // Handle Escape key to close Reviews modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsReviewsModalOpen(false);
      }
    };
    if (isReviewsModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReviewsModalOpen]);

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 bg-white border-t border-slate-200/90 text-slate-900"
      id="fincred-at-a-glance"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[11px] font-bold mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Platform Snapshot</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
            FinCred at a Glance
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 font-normal leading-relaxed">
            Growing with customers through a simple and transparent digital loan-assistance experience.
          </p>
        </div>

        {/* 5 Statistic Cards */}
        {/* Desktop: 5-column horizontal grid. Mobile: 2-column grid with 5th card spanning 2 cols */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-4 max-w-6xl mx-auto">
          {/* Card 1: Customers */}
          <div
            id="stat-card-customers"
            className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 transition-all"
          >
            <div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif] tracking-tight">
                {counts.customers.toLocaleString()}+
              </div>
              <h3 className="text-xs font-bold text-slate-800 font-['Outfit',sans-serif] mt-1">
                Customers Joined
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-2 pt-2 border-t border-slate-100">
              Customers who have connected with FinCred.
            </p>
          </div>

          {/* Card 2: Loan Applications */}
          <div
            id="stat-card-applications"
            className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 transition-all"
          >
            <div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif] tracking-tight">
                {counts.applications}+
              </div>
              <h3 className="text-xs font-bold text-slate-800 font-['Outfit',sans-serif] mt-1">
                Loan Applications Assisted
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-2 pt-2 border-t border-slate-100">
              Loan applications assisted through the FinCred platform.
            </p>
          </div>

          {/* Card 3: Customer Reviews (Clickable) */}
          <button
            type="button"
            id="stat-card-reviews"
            onClick={() => setIsReviewsModalOpen(true)}
            className="group flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/5 transition-all text-left cursor-pointer relative"
            title="Tap to view Customer Reviews & Feedback"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/70 group-hover:bg-amber-100 transition-colors">
                  Tap to view ›
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif] tracking-tight">
                {counts.reviews}+
              </div>
              <h3 className="text-xs font-bold text-slate-800 font-['Outfit',sans-serif] mt-1 group-hover:text-blue-600 transition-colors">
                Customer Reviews
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-2 pt-2 border-t border-slate-100">
              Reviews received from customers.
            </p>
          </button>

          {/* Card 4: Digital Access */}
          <div
            id="stat-card-access"
            className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 transition-all"
          >
            <div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif] tracking-tight">
                24/7
              </div>
              <h3 className="text-xs font-bold text-slate-800 font-['Outfit',sans-serif] mt-1">
                Online Access
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-2 pt-2 border-t border-slate-100">
              Explore FinCred services online.
            </p>
          </div>

          {/* Card 5: Loan Options (Spans 2 cols on mobile for centered clean balance) */}
          <div
            id="stat-card-options"
            className="col-span-2 sm:col-span-1 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 transition-all"
          >
            <div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-3">
                <Landmark className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif] tracking-tight">
                Multiple
              </div>
              <h3 className="text-xs font-bold text-slate-800 font-['Outfit',sans-serif] mt-1">
                Loan Options
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-2 pt-2 border-t border-slate-100">
              Explore available loan options based on eligibility.
            </p>
          </div>
        </div>

        {/* Mandatory Trust Note */}
        <div className="mt-6 sm:mt-8 text-center max-w-xl mx-auto">
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed">
            “Figures shown are based on FinCred’s available records and may change over time.”
          </p>
        </div>
      </div>

      {/* Customer Reviews & Feedback Modal (Opened on Card 3 tap) */}
      {isReviewsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsReviewsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] sm:max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-['Outfit',sans-serif]">
                  Customer Reviews & Feedback
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-700 text-xs leading-relaxed">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg font-black shrink-0">
                  4.8
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <p className="font-bold text-slate-900 text-xs">
                    Overall Satisfaction Score
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Based on 1,000+ customer feedback ratings recorded on FinCred.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Feedback & Review Policy
                </h4>
                <div className="space-y-2 text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Reviews and ratings are voluntarily submitted by users after completing their digital enquiry or loan referral flow.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      FinCred maintains a strict policy against fabricated testimonials and does not pay users for endorsements.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      Borrower feedback is used continuously to optimize platform responsiveness, transparent loan cost disclosures, and support service.
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                Have you recently explored loan options via FinCred? Share your experience with our quality assurance team at{' '}
                <a href="mailto:support@fincred.in" className="font-semibold text-blue-600 underline">
                  support@fincred.in
                </a>.
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 text-xs">
              <span className="text-[11px] text-slate-500">
                FinCred Transparency Portal
              </span>
              <button
                type="button"
                onClick={() => setIsReviewsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
