import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  X,
  FileText,
  BadgeCheck,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  Info,
  Link as LinkIcon
} from 'lucide-react';
import { PartnerPlatform, PartnerLender, LoanOption } from '../../types.js';
import {
  fetchPartnerPlatforms,
  savePartnerPlatformAdmin,
  deletePartnerPlatformAdmin
} from '../../services/api.js';
import { subscribeToPartnerPlatforms } from '../../services/firestoreService.js';

interface LoanOptionsTabProps {
  options?: LoanOption[];
  adminToken: string;
  onRefresh?: () => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const LoanOptionsTab: React.FC<LoanOptionsTabProps> = ({
  adminToken,
  onNotify
}) => {
  const [platforms, setPlatforms] = useState<PartnerPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Personal' | 'Business'>('ALL');

  // Modal State for Partner Platform
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<PartnerPlatform | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [platformToDelete, setPlatformToDelete] = useState<PartnerPlatform | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [form, setForm] = useState<{
    name: string;
    logoUrl: string;
    description: string;
    partnerNetworkSummary: string;
    verifiedPartnerCount: string;
    isCompleteLenderListAvailable: boolean;
    lenderNetworkDisclaimer: string;
    personalLoanUrl: string;
    businessLoanUrl: string;
    supportedCategories: string[];
    loanAmountRange: string;
    tenureRange: string;
    interestRate: string;
    badge: string;
    priority: number;
    productType: string;
    eligibility: string;
    importantConditions: string;
    displayOrder: number;
    isActive: boolean;
    sourceReference: string;
    lastVerifiedDate: string;
    lenders: PartnerLender[];
  }>({
    name: '',
    logoUrl: '',
    description: '',
    partnerNetworkSummary: 'Partner Banks & NBFCs',
    verifiedPartnerCount: '',
    isCompleteLenderListAvailable: false,
    lenderNetworkDisclaimer: "Multiple bank and NBFC partners are available through this platform. The specific lender applicable to an application is determined according to the platform's eligibility and underwriting process.",
    personalLoanUrl: '',
    businessLoanUrl: '',
    supportedCategories: ['Personal Loan'],
    loanAmountRange: '',
    tenureRange: '',
    interestRate: '',
    badge: '',
    priority: 1,
    productType: '',
    eligibility: '',
    importantConditions: '',
    displayOrder: 1,
    isActive: true,
    sourceReference: 'Verified Institutional Disclosures',
    lastVerifiedDate: new Date().toISOString().split('T')[0],
    lenders: []
  });

  // New Lender input within modal
  const [newLender, setNewLender] = useState<Partial<PartnerLender>>({
    lenderName: '',
    lenderType: 'NBFC',
    loanCategory: 'Personal Loan',
    productType: 'Credit Facility',
    sourceVerification: 'Official Disclosures',
    lastVerifiedDate: new Date().toISOString().split('T')[0],
    isActive: true
  });
  const [showAddLenderRow, setShowAddLenderRow] = useState(false);

  // Expanded card lenders view
  const [expandedPlatformId, setExpandedPlatformId] = useState<string | null>(null);

  // Load and subscribe to Partner Platforms
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPartnerPlatforms(
      (livePlatforms) => {
        setPlatforms(livePlatforms);
        setLoading(false);
      },
      () => {
        fetchPartnerPlatforms()
          .then((list) => {
            setPlatforms(list);
            setLoading(false);
          })
          .catch((err) => {
            console.error('Failed to fetch partner platforms:', err);
            setLoading(false);
          });
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const openAddModal = () => {
    setEditingPlatform(null);
    setForm({
      name: '',
      logoUrl: '',
      description: '',
      partnerNetworkSummary: 'Partner Banks & NBFCs',
      verifiedPartnerCount: '',
      isCompleteLenderListAvailable: false,
      lenderNetworkDisclaimer: "Multiple bank and NBFC partners are available through this platform. The specific lender applicable to an application is determined according to the platform's eligibility and underwriting process.",
      personalLoanUrl: '',
      businessLoanUrl: '',
      supportedCategories: ['Personal Loan'],
      loanAmountRange: '₹50,000 – ₹10,00,000',
      tenureRange: '12 to 48 Months',
      interestRate: 'Competitive Rates',
      badge: 'Fast Paperless Verification',
      priority: platforms.length + 1,
      productType: 'Digital Unsecured Loan',
      eligibility: 'Min age 21, valid PAN, Aadhaar & regular verifiable cashflow',
      importantConditions: 'Approval strictly subject to partner credit policy and document verification',
      displayOrder: platforms.length + 1,
      isActive: true,
      sourceReference: 'Official Regulatory Disclosures',
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      lenders: []
    });
    setShowAddLenderRow(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: PartnerPlatform) => {
    setEditingPlatform(p);
    setForm({
      name: p.name || '',
      logoUrl: p.logoUrl || '',
      description: p.description || '',
      partnerNetworkSummary: p.partnerNetworkSummary || 'Partner Banks & NBFCs',
      verifiedPartnerCount: p.verifiedPartnerCount != null ? String(p.verifiedPartnerCount) : '',
      isCompleteLenderListAvailable: Boolean(p.isCompleteLenderListAvailable),
      lenderNetworkDisclaimer: p.lenderNetworkDisclaimer || "Multiple bank and NBFC partners are available through this platform. The specific lender applicable to an application is determined according to the platform's eligibility and underwriting process.",
      personalLoanUrl: p.personalLoanUrl || '',
      businessLoanUrl: p.businessLoanUrl || '',
      supportedCategories: Array.isArray(p.supportedCategories) ? p.supportedCategories : ['Personal Loan'],
      loanAmountRange: p.loanAmountRange || '',
      tenureRange: p.tenureRange || '',
      interestRate: p.interestRate || '',
      badge: p.badge || '',
      priority: p.priority ?? p.displayOrder ?? 1,
      productType: p.productType || '',
      eligibility: p.eligibility || '',
      importantConditions: p.importantConditions || '',
      displayOrder: p.displayOrder ?? 1,
      isActive: p.isActive !== false,
      sourceReference: p.sourceReference || 'Verified Disclosures',
      lastVerifiedDate: p.lastVerifiedDate || new Date().toISOString().split('T')[0],
      lenders: Array.isArray(p.lenders) ? [...p.lenders] : []
    });
    setShowAddLenderRow(false);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (p: PartnerPlatform) => {
    try {
      await savePartnerPlatformAdmin(adminToken, {
        platformId: p.platformId,
        isActive: !p.isActive
      });
      onNotify(`Platform "${p.name}" status updated to: ${!p.isActive ? 'Active' : 'Inactive'}`, 'success');
    } catch (err: any) {
      onNotify(err.message || 'Failed to toggle status', 'error');
    }
  };

  const handleCategoryToggle = (category: string) => {
    const current = [...form.supportedCategories];
    const index = current.indexOf(category);
    if (index >= 0) {
      if (current.length > 1) {
        current.splice(index, 1);
      }
    } else {
      current.push(category);
    }
    setForm({ ...form, supportedCategories: current });
  };

  // Add Lender to the platform's list
  const handleAddLender = () => {
    if (!newLender.lenderName?.trim()) {
      onNotify('Please enter the legal Lender Name', 'error');
      return;
    }

    const created: PartnerLender = {
      lenderId: `lnd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      partnerPlatformId: editingPlatform?.platformId || 'temp',
      lenderName: newLender.lenderName.trim(),
      lenderType: (newLender.lenderType as any) || 'NBFC',
      loanCategory: newLender.loanCategory || 'Personal Loan',
      productType: newLender.productType || 'Credit Facility',
      isActive: true,
      sourceVerification: newLender.sourceVerification || form.sourceReference,
      lastVerifiedDate: newLender.lastVerifiedDate || form.lastVerifiedDate,
      displayOrder: form.lenders.length + 1
    };

    setForm({
      ...form,
      lenders: [...form.lenders, created]
    });

    setNewLender({
      lenderName: '',
      lenderType: 'NBFC',
      loanCategory: 'Personal Loan',
      productType: 'Credit Facility',
      sourceVerification: form.sourceReference,
      lastVerifiedDate: form.lastVerifiedDate,
      isActive: true
    });
    setShowAddLenderRow(false);
  };

  const handleRemoveLender = (lenderId: string) => {
    setForm({
      ...form,
      lenders: form.lenders.filter((l) => l.lenderId !== lenderId)
    });
  };

  // Save Platform to Firebase
  const handleSavePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      onNotify('Partner Platform Name is required', 'error');
      return;
    }

    if (!form.personalLoanUrl.trim() && !form.businessLoanUrl.trim()) {
      onNotify('At least one application URL (Personal or Business) is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<PartnerPlatform> = {
        platformId: editingPlatform?.platformId,
        name: form.name.trim(),
        logoUrl: form.logoUrl.trim() || undefined,
        description: form.description.trim(),
        partnerNetworkSummary: form.partnerNetworkSummary.trim(),
        verifiedPartnerCount: form.verifiedPartnerCount.trim() || undefined,
        isCompleteLenderListAvailable: form.isCompleteLenderListAvailable,
        lenderNetworkDisclaimer: form.lenderNetworkDisclaimer.trim(),
        personalLoanUrl: form.personalLoanUrl.trim(),
        businessLoanUrl: form.businessLoanUrl.trim() || undefined,
        supportedCategories: form.supportedCategories,
        loanAmountRange: form.loanAmountRange.trim() || undefined,
        tenureRange: form.tenureRange.trim() || undefined,
        interestRate: form.interestRate.trim() || undefined,
        badge: form.badge.trim() || undefined,
        priority: Number(form.priority) || 1,
        productType: form.productType.trim() || undefined,
        eligibility: form.eligibility.trim() || undefined,
        importantConditions: form.importantConditions.trim() || undefined,
        displayOrder: Number(form.displayOrder) || 1,
        isActive: form.isActive,
        sourceReference: form.sourceReference.trim(),
        lastVerifiedDate: form.lastVerifiedDate.trim(),
        lenders: form.lenders
      };

      await savePartnerPlatformAdmin(adminToken, payload);
      onNotify(`Partner platform "${form.name}" saved successfully to Firebase!`, 'success');
      setIsModalOpen(false);
    } catch (err: any) {
      onNotify(err.message || 'Failed to save partner platform', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Platform
  const handleConfirmDelete = async () => {
    if (!platformToDelete) return;
    setIsDeleting(true);
    try {
      await deletePartnerPlatformAdmin(adminToken, platformToDelete.platformId);
      onNotify(`Partner platform "${platformToDelete.name}" deleted successfully`, 'success');
      setPlatformToDelete(null);
    } catch (err: any) {
      onNotify(err.message || 'Failed to delete partner platform', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered platforms
  const filtered = platforms.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.partnerNetworkSummary && p.partnerNetworkSummary.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (categoryFilter === 'Personal') {
      return p.supportedCategories?.some((c) => c.toLowerCase().includes('personal')) || Boolean(p.personalLoanUrl);
    }
    if (categoryFilter === 'Business') {
      return p.supportedCategories?.some((c) => c.toLowerCase().includes('business')) || Boolean(p.businessLoanUrl);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
              Partner Platform & Lender Management
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800">
              {platforms.length} Platforms Configured
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage your verified lending partners (WeRize, Ruloans, Choice Connect, True Balance, etc.), their referral links, supported loan categories, and verified Bank/NBFC partner institutions in Firestore.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 shrink-0 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Partner Platform</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search platforms, networks, lenders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              categoryFilter === 'ALL' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Categories
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('Personal')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              categoryFilter === 'Personal' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Personal Loan
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('Business')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              categoryFilter === 'Business' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Business Loan
          </button>
        </div>
      </div>

      {/* Platforms Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs">Loading partner platforms from Cloud Firestore...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-2">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No partner platforms found</p>
          <p className="text-xs text-slate-400">Try adjusting your search criteria or add a new partner.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((platform) => {
            const lenders = Array.isArray(platform.lenders) ? platform.lenders : [];
            const isExpanded = expandedPlatformId === platform.platformId;

            return (
              <div
                key={platform.platformId}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Platform Summary Header */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                          {platform.name}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          ID: {platform.platformId}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            platform.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {platform.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {platform.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {platform.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 max-w-xl line-clamp-2">
                        {platform.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-700">
                          Network: {platform.partnerNetworkSummary || 'Partner Banks & NBFCs'}
                        </span>
                        {platform.verifiedPartnerCount && (
                          <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {platform.verifiedPartnerCount}
                          </span>
                        )}
                        <span>Order: <strong>{platform.displayOrder}</strong></span>
                        <span>Verified: <strong>{platform.lastVerifiedDate}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => setExpandedPlatformId(isExpanded ? null : platform.platformId)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>{lenders.length} Verified Lenders</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(platform)}
                      className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                      title={platform.isActive ? 'Deactivate Platform' : 'Activate Platform'}
                    >
                      {platform.isActive ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(platform)}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-colors cursor-pointer"
                      title="Edit Platform & Lenders"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlatformToDelete(platform)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                      title="Delete Platform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Referral Links Strip */}
                <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-blue-700 shrink-0">PL Link:</span>
                    {platform.personalLoanUrl ? (
                      <span className="font-mono text-[11px] text-slate-600 truncate" title={platform.personalLoanUrl}>
                        {platform.personalLoanUrl}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not configured</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-indigo-700 shrink-0">BL Link:</span>
                    {platform.businessLoanUrl ? (
                      <span className="font-mono text-[11px] text-slate-600 truncate" title={platform.businessLoanUrl}>
                        {platform.businessLoanUrl}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not configured (Uses PL fallback)</span>
                    )}
                  </div>
                </div>

                {/* Expanded Lenders List */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 font-['Outfit',sans-serif]">
                        Verified Institutional Lenders for {platform.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => openEditModal(platform)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        + Manage / Add Lenders
                      </button>
                    </div>

                    {lenders.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-3 bg-white rounded-xl border border-slate-200">
                        No specific institutional lenders listed yet. The general network disclaimer is shown to customers.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {lenders.map((lender) => (
                          <div
                            key={lender.lenderId}
                            className="p-3 bg-white rounded-xl border border-slate-200 space-y-1"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-slate-900 text-xs">{lender.lenderName}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                  lender.lenderType === 'Bank'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : lender.lenderType === 'NBFC'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }`}
                              >
                                {lender.lenderType}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>{lender.productType || 'Credit Facility'}</span>
                              <span>Source: {lender.sourceVerification || platform.sourceReference}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PARTNER PLATFORM CREATE / EDIT MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-3xl my-6 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                    {editingPlatform ? `Edit Partner: ${editingPlatform.name}` : 'Add New Partner Platform'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saves directly to Firebase Cloud Firestore permanent database
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSavePlatform} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              
              {/* Basic Platform Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Partner Platform Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WeRize, Ruloans, Choice Connect, True Balance"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Display Order & Visibility
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={form.displayOrder}
                      onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                      className="w-24 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>Active on Website</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Supported Categories */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Supported Loan Categories
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={form.supportedCategories.includes('Personal Loan')}
                      onChange={() => handleCategoryToggle('Personal Loan')}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">Personal Loan</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={form.supportedCategories.includes('Business Loan')}
                      onChange={() => handleCategoryToggle('Business Loan')}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">Business Loan</span>
                  </label>
                </div>
              </div>

              {/* Referral URLs - Cleanly Separated */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <LinkIcon className="w-4 h-4 text-blue-600" />
                  <span>Configured Referral & Application URLs</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Personal Loan Application URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required={form.supportedCategories.includes('Personal Loan')}
                    placeholder="https://partner.com/apply/personal-loan?ref=..."
                    value={form.personalLoanUrl}
                    onChange={(e) => setForm({ ...form, personalLoanUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Business Loan Application URL (Required for Business Loan Category)
                  </label>
                  <input
                    type="url"
                    placeholder="https://partner.com/apply/business-loan?ref=..."
                    value={form.businessLoanUrl}
                    onChange={(e) => setForm({ ...form, businessLoanUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Ensures Business Loan applicants are routed to the specific Business Loan partner portal.
                  </p>
                </div>
              </div>

              {/* Partner Network & Disclaimer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Partner Network Summary (e.g. 275+ Partner Banks & NBFCs*)
                  </label>
                  <input
                    type="text"
                    value={form.partnerNetworkSummary}
                    onChange={(e) => setForm({ ...form, partnerNetworkSummary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Verified Partner Count Badge (e.g. 6 Verified NBFCs)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6 Verified NBFCs"
                    value={form.verifiedPartnerCount}
                    onChange={(e) => setForm({ ...form, verifiedPartnerCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Platform overview for customers..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lender Network Disclaimer
                </label>
                <textarea
                  rows={2}
                  value={form.lenderNetworkDisclaimer}
                  onChange={(e) => setForm({ ...form, lenderNetworkDisclaimer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Product Type & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Type</label>
                  <input
                    type="text"
                    value={form.productType}
                    onChange={(e) => setForm({ ...form, productType: e.target.value })}
                    placeholder="e.g. Unsecured Personal Loan / Business Working Capital"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority (Display Order)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: Number(e.target.value) || 1 })}
                    placeholder="1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Eligibility & Important Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Basic Eligibility Criteria</label>
                  <textarea
                    rows={2}
                    value={form.eligibility}
                    onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                    placeholder="e.g. Min age 21, valid PAN, Aadhaar & regular verifiable income"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Important Conditions</label>
                  <textarea
                    rows={2}
                    value={form.importantConditions}
                    onChange={(e) => setForm({ ...form, importantConditions: e.target.value })}
                    placeholder="e.g. Subject to lender credit approval and bureau score check"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Indicative Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Indicative Amount</label>
                  <input
                    type="text"
                    value={form.loanAmountRange}
                    onChange={(e) => setForm({ ...form, loanAmountRange: e.target.value })}
                    placeholder="₹50,000 – ₹50,00,000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Indicative Tenure</label>
                  <input
                    type="text"
                    value={form.tenureRange}
                    onChange={(e) => setForm({ ...form, tenureRange: e.target.value })}
                    placeholder="12 to 60 Months"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interest / Pricing</label>
                  <input
                    type="text"
                    value={form.interestRate}
                    onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
                    placeholder="From 10.49% p.a."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Source & Verification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source / Verification Reference</label>
                  <input
                    type="text"
                    value={form.sourceReference}
                    onChange={(e) => setForm({ ...form, sourceReference: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Verified Date</label>
                  <input
                    type="date"
                    value={form.lastVerifiedDate}
                    onChange={(e) => setForm({ ...form, lastVerifiedDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* ========================================================================= */}
              {/* VERIFIED LENDERS LIST SECTION (Banks & NBFCs) */}
              {/* ========================================================================= */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black uppercase tracking-wider text-slate-800 font-['Outfit',sans-serif]">
                      Verified Partner Banks & NBFCs List ({form.lenders.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Accurately identify institution as Bank or NBFC. No fabricated names.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddLenderRow(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 border border-blue-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Lender</span>
                  </button>
                </div>

                {/* Add Lender Form Row */}
                {showAddLenderRow && (
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-0.5">Lender Name</label>
                        <input
                          type="text"
                          placeholder="e.g. HDFC Bank Limited / True Credits Pvt Ltd"
                          value={newLender.lenderName || ''}
                          onChange={(e) => setNewLender({ ...newLender, lenderName: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Lender Type</label>
                        <select
                          value={newLender.lenderType || 'NBFC'}
                          onChange={(e) => setNewLender({ ...newLender, lenderType: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                        >
                          <option value="NBFC">NBFC</option>
                          <option value="Bank">Bank</option>
                          <option value="Financial Institution">Financial Institution</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">Product Type</label>
                        <input
                          type="text"
                          placeholder="e.g. Instant Cash Loan / Express PL"
                          value={newLender.productType || ''}
                          onChange={(e) => setNewLender({ ...newLender, productType: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">Source</label>
                        <input
                          type="text"
                          value={newLender.sourceVerification || ''}
                          onChange={(e) => setNewLender({ ...newLender, sourceVerification: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <div className="flex items-end gap-2">
                        <button
                          type="button"
                          onClick={handleAddLender}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Save Lender
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddLenderRow(false)}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-200 text-slate-700 text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing Lenders Table */}
                {form.lenders.length === 0 ? (
                  <p className="text-slate-400 italic text-center p-3 border border-dashed border-slate-300 rounded-xl">
                    No individual lenders listed. Click &apos;Add Lender&apos; to specify verified partners.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {form.lenders.map((lender, idx) => (
                      <div
                        key={lender.lenderId || idx}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                              lender.lenderType === 'Bank'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : lender.lenderType === 'NBFC'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}
                          >
                            {lender.lenderType}
                          </span>
                          <span className="font-bold text-slate-900 truncate">{lender.lenderName}</span>
                          {lender.productType && (
                            <span className="text-slate-400 text-[10px] hidden sm:inline">
                              ({lender.productType})
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveLender(lender.lenderId)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Remove Lender"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingPlatform ? 'Save Changes' : 'Create Platform'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {platformToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                  Delete Partner Platform
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  This will remove the platform from customer loan options
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>{platformToDelete.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPlatformToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Platform</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
