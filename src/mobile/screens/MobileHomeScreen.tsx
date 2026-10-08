import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Calculator,
  ChevronRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  Percent,
  RefreshCw,
  ExternalLink,
  Smartphone,
  CreditCard,
  Building2,
  Award
} from 'lucide-react';
import { Customer, LoanProduct, Banner, LoanApplication } from '../../types.js';
import { fetchActiveBanners, appFetchLoanProducts, appFetchMyApplications } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface MobileHomeScreenProps {
  customer: Customer | null;
  onOpenApply: (product: LoanProduct | null) => void;
  onNavigateTab: (tab: 'home' | 'loans' | 'applications' | 'profile') => void;
}

export const MobileHomeScreen: React.FC<MobileHomeScreenProps> = ({
  customer,
  onOpenApply,
  onNavigateTab
}) => {
  const { openCibilModal } = useAuth();
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [recentApps, setRecentApps] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // EMI Calculator State
  const [calcAmount, setCalcAmount] = useState(100000);
  const [calcTenure, setCalcTenure] = useState(24);
  const [calcRate, setCalcRate] = useState(12.5);

  const calculateEmi = () => {
    const r = calcRate / 12 / 100;
    const n = calcTenure;
    const emi = (calcAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, banRes] = await Promise.all([
        appFetchLoanProducts().catch(() => ({ products: [] })),
        fetchActiveBanners().catch(() => [])
      ]);
      setProducts(prodRes.products || []);
      const sortedBanners = [...(banRes || [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setBanners(sortedBanners);

      if (customer?.customerId || customer?.mobileNumber) {
        const apps = await appFetchMyApplications(customer?.customerId, customer?.mobileNumber).catch(() => []);
        setRecentApps(apps);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [customer]);

  const estimatedEmi = calculateEmi();
  const totalRepayment = estimatedEmi * calcTenure;
  const totalInterest = totalRepayment - calcAmount;

  return (
    <div className="space-y-5 pb-20 select-none">
      {/* User Greeting Bar */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#131D33] via-[#0F182B] to-[#0A0F1D] border border-slate-800/80 shadow-lg relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-[#0A0F1D] rounded-[14px] flex items-center justify-center font-bold text-white text-base">
                {customer?.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Welcome Back,</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Verified
                </span>
              </div>
              <h2 className="text-base font-bold text-white font-['Outfit',sans-serif] leading-tight">
                {customer?.fullName || 'FINCRED Valued Customer'}
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                +91 {customer?.mobileNumber || 'Registered'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white cursor-pointer transition-all active:rotate-180"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats Pill */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-[#0A0F1D]/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Active Requests:</span>
            <span className="font-bold text-cyan-400 font-mono">{recentApps.length}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#0A0F1D]/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Instant Limit:</span>
            <span className="font-bold text-emerald-400 font-mono">Up to ₹50L</span>
          </div>
        </div>
      </div>

      {/* CIBIL Score Improve Offer Card for Mobile App */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#0A1322] to-teal-950 border border-emerald-500/60 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
              Low CIBIL Solution
            </span>
            <span className="text-[11px] font-bold text-emerald-400">₹599 - ₹199 = ₹299 Only</span>
          </div>
          <span className="text-[10px] text-cyan-300 font-mono font-bold">Branch Unlock</span>
        </div>

        <h3 className="text-sm font-black text-white leading-snug">
          Improve Low CIBIL & Unlock Branch Loan
        </h3>
        <p className="text-[11px] text-slate-300 leading-snug mt-1">
          Pay ₹299 via UPI to <strong className="text-cyan-300 font-mono">fincredlo@nyes</strong>, enter UTR, and get verified Branch pre-approved link directly.
        </p>

        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => openCibilModal()}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
            <span>Pay ₹299 & Improve</span>
          </button>

          <button
            type="button"
            onClick={() => openCibilModal(customer?.mobileNumber)}
            className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            Track Status
          </button>
        </div>
      </div>

      {/* Dynamic Promotional Banners */}
      {banners.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Special Assistance Offers
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {banners.map(banner => (
              <div
                key={banner.bannerId}
                className="shrink-0 w-[88vw] max-w-[320px] snap-center rounded-2xl overflow-hidden border border-slate-700/60 bg-[#121B2F] relative shadow-md group"
              >
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-36 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-r from-blue-900 to-indigo-950 flex items-center justify-center p-4">
                    <span className="text-sm font-bold text-white text-center">{banner.title}</span>
                  </div>
                )}
                <div className="p-3 bg-gradient-to-t from-[#0A0F1D] via-[#0A0F1D]/90 to-transparent">
                  <h4 className="text-xs font-bold text-white leading-tight">{banner.title}</h4>
                  <div className="mt-2 flex items-center justify-between">
                    <a
                      href={banner.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-xs cursor-pointer"
                    >
                      <span>{banner.buttonText || 'Explore Now'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onOpenApply(null)}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-900/40 border border-blue-500/30 text-left hover:border-blue-400/50 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 mb-2 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-white">Apply for Loan</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Quick multi-bank approval</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('applications')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-cyan-900/40 border border-cyan-500/30 text-left hover:border-cyan-400/50 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/30 mb-2 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-white">Track Applications</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {recentApps.length > 0 ? `${recentApps.length} active application(s)` : 'View real-time status'}
          </p>
        </button>
      </div>

      {/* Loan Services / Products Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-bold text-white font-['Outfit',sans-serif]">
              Available Loan Services
            </h3>
            <p className="text-[11px] text-slate-400">Direct assisted partner solutions</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('loans')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {(products || []).slice(0, 3).map(product => {
            const productFeatures = Array.isArray(product.features)
              ? product.features
              : (Array.isArray((product as any).eligibilityInfo) ? (product as any).eligibilityInfo : []);

            return (
              <div
                key={product.id}
                className="p-4 rounded-2xl bg-[#111A2E] border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-blue-500/15 text-cyan-300 text-[10px] font-bold border border-blue-500/20 mb-1">
                      {product.badge}
                    </span>
                    <h4 className="text-sm font-bold text-white">{product.name}</h4>
                    <p className="text-[11px] text-slate-400">Partner: {product.partnerName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-emerald-400 font-mono">{product.maxAmount}</div>
                    <div className="text-[10px] text-slate-400">{product.interestRate}</div>
                  </div>
                </div>

                {/* Features Chips */}
                {productFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(productFeatures || []).slice(0, 2).map((f: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-[#0A0F1D] px-2 py-1 rounded-lg border border-slate-800"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => onOpenApply(product)}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>Quick Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                <a
                  href={product.destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="Visit Partner Site"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Financial Tool: Loan & EMI Calculator */}
      <div className="p-4 rounded-3xl bg-[#111A2E] border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Smart EMI Calculator</h3>
              <p className="text-[10px] text-slate-400">Estimate monthly budget upfront</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
            Live Tool
          </span>
        </div>

        {/* Calculated Results Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-900/40 grid grid-cols-3 text-center divide-x divide-slate-800">
          <div>
            <div className="text-[10px] text-slate-400">Monthly EMI</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">
              ₹{estimatedEmi.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Total Interest</div>
            <div className="text-sm font-bold text-amber-400 font-mono">
              ₹{Math.max(0, totalInterest).toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Total Payable</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              ₹{totalRepayment.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Loan Amount</span>
              <span className="font-bold text-cyan-400 font-mono">₹{calcAmount.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={20000}
              max={1500000}
              step={10000}
              value={calcAmount}
              onChange={e => setCalcAmount(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Tenure (Months)</span>
              <span className="font-bold text-cyan-400 font-mono">{calcTenure} Months</span>
            </div>
            <input
              type="range"
              min={6}
              max={60}
              step={6}
              value={calcTenure}
              onChange={e => setCalcTenure(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Security Trust Note */}
      <div className="p-3.5 rounded-2xl bg-[#0B1220] border border-slate-800/80 flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
        <div className="text-[11px] text-slate-400 leading-snug">
          <span className="font-bold text-slate-200">RBI NBFC Compliance Assured:</span> No upfront processing charges. Free transparent loan comparison for Indian citizens.
        </div>
      </div>
    </div>
  );
};
