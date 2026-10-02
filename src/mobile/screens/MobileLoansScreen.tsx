import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Zap,
  Filter,
  Percent,
  Calendar,
  IndianRupee,
  Loader2
} from 'lucide-react';
import { LoanProduct } from '../../types.js';
import { appFetchLoanProducts } from '../../services/api.js';

interface MobileLoansScreenProps {
  onOpenApply: (product: LoanProduct) => void;
}

export const MobileLoansScreen: React.FC<MobileLoansScreenProps> = ({ onOpenApply }) => {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await appFetchLoanProducts();
        setProducts(res.products || []);
      } catch (err) {
        console.error('Failed to load loan products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = [
    { id: 'ALL', label: 'All Services' },
    { id: 'Personal / Business Loan', label: 'Personal & Business' },
    { id: 'Instant Loan', label: 'Instant Fast-Track' },
    { id: 'All Type Loan', label: 'Rate Compare' },
    { id: 'Safe UPI & Finance', label: 'Safe UPI' }
  ];

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-cyan-400 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white font-['Outfit',sans-serif]">
            Loan Assistance Catalog
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Compare pre-qualified offers from 100+ RBI NBFCs & Banks
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by loan type, partner name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
        />
      </div>

      {/* Filter Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[#111827] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Cards */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs">Fetching current loan packages...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No loan services matching your filters.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="p-4 rounded-2xl bg-[#111A2E] border border-slate-800/90 hover:border-slate-700 transition-all space-y-3 shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-500/15 text-cyan-300 text-[10px] font-bold border border-blue-500/20 mb-1">
                    {product.badge}
                  </span>
                  <h3 className="text-sm font-bold text-white leading-snug">{product.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Partner: {product.partnerName}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {product.maxAmount}
                  </div>
                  <div className="text-[10px] text-slate-400">{product.category}</div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#0A0F1D]/80 border border-slate-800/80 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Percent className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Rate: </span>
                  <span className="font-semibold text-white font-mono">{product.interestRate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Tenure: </span>
                  <span className="font-semibold text-white font-mono">{product.tenure}</span>
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-1">
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onOpenApply(product)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Apply Now</span>
                </button>

                <a
                  href={product.destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Direct partner portal"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
