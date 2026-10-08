import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinCredLogo } from '../components/FinCredLogo.js';
import {
  Users,
  FileText,
  Link as LinkIcon,
  BarChart3,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Save,
  Loader2,
  X,
  Smartphone,
  Mail,
  ChevronRight,
  ChevronDown,
  Clock,
  Bell,
  TrendingUp,
  MessageCircle,
  Copy,
  Check,
  Zap,
  Award,
  DollarSign,
  Gift,
  SlidersHorizontal,
  Share2,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import {
  fetchAdminStats,
  fetchAdminCustomers,
  createCustomerAdmin,
  updateCustomerAdmin,
  fetchAdminApplications,
  updateAdminApplicationStatus,
  deleteCustomerAdmin,
  deleteApplicationAdmin,
  updateSettingsAdmin,
  fetchAdminCibilOrders,
  confirmAdminCibilOrder,
  rejectAdminCibilOrder,
  sendAdminNotification,
  fetchAdminNotifications,
  deleteAdminNotification
} from '../services/api.js';
import {
  Customer,
  LoanApplication,
  AdminSettings,
  AdminStats,
  ApplicationStatus,
  CustomerNotification,
  CibilOrder
} from '../types.js';
import { AdminAppRewardsTab } from '../components/admin/AdminAppRewardsTab.js';
import { AdminLoanReferralsTab } from '../components/admin/AdminLoanReferralsTab.js';
import { AdminEarnSettingsModal } from '../components/admin/AdminEarnSettingsModal.js';

type AdminTab =
  | 'overview'
  | 'app_rewards'
  | 'loan_referrals'
  | 'cibil'
  | 'applications'
  | 'customers'
  | 'links'
  | 'notifications';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminToken, isAdminLoggedIn, adminLogout, settings, refreshSettings } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isEarnSettingsOpen, setIsEarnSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Core Data States
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [customers, setCustomers] = useState<(Customer & { applicationCount: number })[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [cibilOrders, setCibilOrders] = useState<CibilOrder[]>([]);
  const [currentLinks, setCurrentLinks] = useState<AdminSettings>(settings);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [revealedPans, setRevealedPans] = useState<Record<string, boolean>>({});
  const [activeLeadModal, setActiveLeadModal] = useState<LoanApplication | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // Search & Filters
  const [customerSearch, setCustomerSearch] = useState('');
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('ALL');
  const [appSourceFilter, setAppSourceFilter] = useState<'ALL' | 'mobile_app' | 'web'>('ALL');
  const [cibilSearch, setCibilSearch] = useState('');
  const [cibilStatusFilter, setCibilStatusFilter] = useState<'ALL' | 'pending_verification' | 'confirmed' | 'rejected'>('ALL');

  // Modals
  const [customerToDelete, setCustomerToDelete] = useState<(Customer & { applicationCount: number }) | null>(null);
  const [appToDelete, setAppToDelete] = useState<LoanApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<(Customer & { applicationCount: number }) | null>(null);
  const [customerForm, setCustomerForm] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    loanCategory: 'Personal Loan',
    amountRequested: '',
    status: 'Verified'
  });
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // CIBIL Confirmation / Reject Processing
  const [processingCibilId, setProcessingCibilId] = useState<string | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<CibilOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Notification Broadcast Form
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    target: 'ALL',
    link: 'https://branch.co/download/shubh12360',
    type: 'success' as const
  });
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  const BRANCH_LINK = 'https://branch.co/download/shubh12360';
  const WHATSAPP_SUPPORT = '+919219787153';

  // Protect Admin Route
  useEffect(() => {
    if (!isAdminLoggedIn || !adminToken) {
      navigate('/Admin-login');
    }
  }, [isAdminLoggedIn, adminToken, navigate]);

  // Load All Admin Data
  const loadAllData = async () => {
    if (!adminToken) return;
    setIsLoading(true);
    try {
      const [statsData, custData, appData, cibilData, notifData] = await Promise.all([
        fetchAdminStats(adminToken).catch(() => null),
        fetchAdminCustomers(adminToken).catch(() => []),
        fetchAdminApplications(adminToken).catch(() => []),
        fetchAdminCibilOrders(adminToken).catch(() => []),
        fetchAdminNotifications(adminToken).catch(() => [])
      ]);

      if (statsData) setStats(statsData);
      setCustomers(custData || []);
      setApplications(appData || []);
      setCibilOrders(cibilData || []);
      setNotifications(notifData || []);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch admin data.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadAllData();
      setCurrentLinks(settings);
    }
  }, [adminToken, settings]);

  const handleLogout = () => {
    adminLogout();
    navigate('/Admin-login');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(id);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  // ==========================================
  // CIBIL ORDER ACTIONS
  // ==========================================
  const handleConfirmCibilOrder = async (order: CibilOrder) => {
    if (!adminToken) return;
    setProcessingCibilId(order.orderId);
    try {
      const res = await confirmAdminCibilOrder(
        adminToken,
        order.orderId,
        'Payment verified. Branch Instant Loan access link dispatched.'
      );
      if (res.success && res.order) {
        setCibilOrders(prev => prev.map(o => (o.orderId === order.orderId ? res.order : o)));
        setFeedback({
          type: 'success',
          message: `Payment confirmed for ${order.fullName}! Branch link sent and notification dispatched.`
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to confirm CIBIL order.' });
    } finally {
      setProcessingCibilId(null);
    }
  };

  const handleOpenRejectModal = (order: CibilOrder) => {
    setRejectModalOrder(order);
    setRejectReason('Invalid UTR Number / Payment not received in bank account.');
  };

  const handleConfirmRejectCibil = async () => {
    if (!adminToken || !rejectModalOrder) return;
    setProcessingCibilId(rejectModalOrder.orderId);
    try {
      const res = await rejectAdminCibilOrder(adminToken, rejectModalOrder.orderId, rejectReason.trim());
      if (res.success && res.order) {
        setCibilOrders(prev => prev.map(o => (o.orderId === rejectModalOrder.orderId ? res.order : o)));
        setFeedback({
          type: 'success',
          message: `Order for ${rejectModalOrder.fullName} marked as rejected.`
        });
      }
      setRejectModalOrder(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reject CIBIL order.' });
    } finally {
      setProcessingCibilId(null);
    }
  };

  // ==========================================
  // APPLICATION ACTIONS
  // ==========================================
  const handleUpdateAppStatus = async (appId: string, newStatus: ApplicationStatus) => {
    if (!adminToken) return;
    try {
      const updated = await updateAdminApplicationStatus(adminToken, appId, newStatus);
      setApplications(prev => prev.map(a => (a.applicationId === appId ? updated : a)));
      if (activeLeadModal?.applicationId === appId) {
        setActiveLeadModal(updated);
      }
      setFeedback({ type: 'success', message: `Application ${appId} updated to ${newStatus}.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update application status.' });
    }
  };

  const handleDeleteApplication = async () => {
    if (!adminToken || !appToDelete) return;
    setIsDeleting(true);
    try {
      await deleteApplicationAdmin(adminToken, appToDelete.applicationId);
      setApplications(prev => prev.filter(a => a.applicationId !== appToDelete.applicationId));
      if (activeLeadModal?.applicationId === appToDelete.applicationId) {
        setActiveLeadModal(null);
      }
      setAppToDelete(null);
      setFeedback({ type: 'success', message: 'Application deleted successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete application.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // ==========================================
  // CUSTOMER LEAD ACTIONS
  // ==========================================
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setIsSavingCustomer(true);
    try {
      if (editingCustomer) {
        const updated = await updateCustomerAdmin(adminToken, editingCustomer.customerId, {
          fullName: customerForm.fullName.trim(),
          mobileNumber: customerForm.mobileNumber.trim(),
          email: customerForm.email.trim() || undefined,
          status: customerForm.status
        });
        setCustomers(prev =>
          prev.map(c =>
            c.customerId === editingCustomer.customerId
              ? { ...c, ...updated, applicationCount: c.applicationCount }
              : c
          )
        );
        setFeedback({ type: 'success', message: `Customer ${customerForm.fullName} updated successfully.` });
      } else {
        const created = await createCustomerAdmin(adminToken, {
          fullName: customerForm.fullName.trim(),
          mobileNumber: customerForm.mobileNumber.trim(),
          email: customerForm.email.trim() || undefined,
          loanCategory: customerForm.loanCategory,
          amountRequested: customerForm.amountRequested ? Number(customerForm.amountRequested) : undefined,
          status: customerForm.status
        });
        setCustomers(prev => [{ ...created, applicationCount: 0 }, ...prev]);
        setFeedback({ type: 'success', message: `Customer ${customerForm.fullName} added successfully.` });
      }
      setIsCustomerModalOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save customer.' });
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!adminToken || !customerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCustomerAdmin(adminToken, customerToDelete.customerId);
      setCustomers(prev => prev.filter(c => c.customerId !== customerToDelete.customerId));
      setCustomerToDelete(null);
      setFeedback({ type: 'success', message: 'Customer record deleted.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete customer.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // ==========================================
  // PARTNER LINKS ACTIONS
  // ==========================================
  const handleSaveLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    try {
      const updated = await updateSettingsAdmin(adminToken, currentLinks);
      setCurrentLinks(updated);
      await refreshSettings();
      setFeedback({ type: 'success', message: 'Partner referral links updated and saved to central database!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save destination links.' });
    }
  };

  // ==========================================
  // NOTIFICATIONS BROADCAST ACTIONS
  // ==========================================
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      setFeedback({ type: 'error', message: 'Notification title and message are required.' });
      return;
    }
    setIsSendingNotif(true);
    try {
      const res = await sendAdminNotification(adminToken, notifForm);
      if (res.success && res.notification) {
        setNotifications(prev => [res.notification, ...prev]);
        setFeedback({ type: 'success', message: 'Notification dispatched to customer portal & mobile app!' });
        setNotifForm({
          title: '',
          message: '',
          target: 'ALL',
          link: BRANCH_LINK,
          type: 'success'
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to send notification.' });
    } finally {
      setIsSendingNotif(false);
    }
  };

  const handleDeleteNotif = async (id: string) => {
    if (!adminToken) return;
    try {
      await deleteAdminNotification(adminToken, id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setFeedback({ type: 'success', message: 'Notification removed.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete notification.' });
    }
  };

  // ==========================================
  // FILTERED DATA
  // ==========================================
  const filteredCibilOrders = cibilOrders.filter(o => {
    if (cibilStatusFilter !== 'ALL' && o.status !== cibilStatusFilter) return false;
    if (!cibilSearch.trim()) return true;
    const q = cibilSearch.toLowerCase();
    return (
      o.fullName.toLowerCase().includes(q) ||
      o.mobileNumber.includes(q) ||
      o.utrNumber.toLowerCase().includes(q) ||
      o.referenceNumber.toLowerCase().includes(q) ||
      (o.email && o.email.toLowerCase().includes(q))
    );
  });

  const filteredApplications = applications.filter(a => {
    if (appStatusFilter !== 'ALL' && a.status !== appStatusFilter) return false;
    if (appSourceFilter === 'mobile_app' && a.source !== 'mobile_app') return false;
    if (appSourceFilter === 'web' && a.source === 'mobile_app') return false;
    if (!appSearch.trim()) return true;
    const q = appSearch.toLowerCase();
    return (
      a.fullName.toLowerCase().includes(q) ||
      a.mobileNumber.includes(q) ||
      a.applicationId.toLowerCase().includes(q) ||
      (a.loanCategory && a.loanCategory.toLowerCase().includes(q))
    );
  });

  const filteredCustomers = customers.filter(c => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.mobileNumber.includes(q) ||
      c.customerId.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const pendingCibilCount = cibilOrders.filter(o => o.status === 'pending_verification').length;
  const confirmedCibilCount = cibilOrders.filter(o => o.status === 'confirmed').length;
  const totalCibilRevenue = confirmedCibilCount * 299;

  const navItems = [
    {
      id: 'overview' as AdminTab,
      label: 'Overview',
      icon: BarChart3
    },
    {
      id: 'cibil' as AdminTab,
      label: 'CIBIL Score Orders',
      icon: TrendingUp,
      count: cibilOrders.length,
      badge: pendingCibilCount > 0 ? `${pendingCibilCount} New` : null
    },
    {
      id: 'app_rewards' as AdminTab,
      label: 'App Rewards (₹100)',
      icon: Gift
    },
    {
      id: 'loan_referrals' as AdminTab,
      label: 'Loan Referrals & Payouts',
      icon: Share2
    },
    {
      id: 'applications' as AdminTab,
      label: 'Loan Applications',
      icon: FileText,
      count: applications.length
    },
    {
      id: 'customers' as AdminTab,
      label: 'Customer Leads',
      icon: Users,
      count: customers.length
    },
    {
      id: 'links' as AdminTab,
      label: 'Partner Links',
      icon: LinkIcon
    },
    {
      id: 'notifications' as AdminTab,
      label: 'Notifications',
      icon: Bell,
      count: notifications.length
    }
  ];

  const renderNavList = (onSelect?: () => void) => (
    <div className="flex flex-col h-full select-none">
      <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
        <span>Admin Options</span>
        <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">Fixed Menu</span>
      </div>

      <nav className="flex-1 space-y-1.5 py-3 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                if (onSelect) onSelect();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {item.count}
                </span>
              )}
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-amber-400 text-slate-950 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Earn Settings */}
        <button
          type="button"
          onClick={() => {
            setIsEarnSettingsOpen(true);
            if (onSelect) onSelect();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-colors text-left cursor-pointer mt-2"
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="flex-1">Earn Settings</span>
          <span className="text-[9px] font-black text-amber-800 bg-amber-200/70 px-1.5 py-0.2 rounded-full">Config</span>
        </button>
      </nav>

      {/* Log Out Option INSIDE the side options list */}
      <div className="pt-3 border-t border-slate-200 mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out / Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 select-none">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <FinCredLogo size="sm" showSubtitle={false} />
          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-black text-slate-900 font-['Outfit',sans-serif]">
              Admin Central Console
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">RBI NBFC Partner Operations & CIBIL Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`https://wa.me/${WHATSAPP_SUPPORT.replace('+', '')}?text=${encodeURIComponent('Hello Admin Support')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp: +91 9219787153</span>
          </a>

          <button
            onClick={loadAllData}
            title="Refresh Data"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Admin Account Button with dropdown (Sign Out is inside it!) */}
          <div className="relative" ref={adminMenuRef}>
            <button
              type="button"
              onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
              id="admin-header-account-btn"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              title="Admin Menu"
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs">
                A
              </div>
              <span className="hidden sm:inline">Admin</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isAdminMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-900">Administrator</p>
                  <p className="text-[10px] text-slate-500">RBI NBFC Operations Hub</p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminMenuOpen(false);
                      loadAllData();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Refresh Data</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminMenuOpen(false);
                      setIsEarnSettingsOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                    <span>Earn Settings</span>
                  </button>
                  <a
                    href={`https://wa.me/${WHATSAPP_SUPPORT.replace('+', '')}?text=${encodeURIComponent('Hello Admin Support')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsAdminMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 text-left cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Support</span>
                  </a>
                </div>
                <div className="border-t border-slate-100 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminMenuOpen(false);
                      handleLogout();
                    }}
                    id="admin-dropdown-logout-btn"
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out / Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container: Fixed Left Side Rail + Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col lg:flex-row items-start gap-6">

          {/* FIXED LEFT SIDEBAR: All Admin Portal Options Fixed to One Side */}
          <aside className="w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-20 z-20">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sm:p-4">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">Admin Options</span>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  Fixed Menu
                </span>
              </div>

              {/* Vertical Navigation Items: No horizontal scrolling needed! */}
              <nav className="space-y-1.5 max-h-[calc(100vh-13rem)] overflow-y-auto pr-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                          {item.count}
                        </span>
                      )}
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-amber-400 text-slate-950 animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Earn Settings in Fixed Menu */}
                <button
                  type="button"
                  onClick={() => setIsEarnSettingsOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors text-left cursor-pointer mt-2"
                >
                  <SlidersHorizontal className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="flex-1">Earn Settings</span>
                  <span className="text-[9px] font-black text-amber-800 bg-amber-200 px-1.5 py-0.2 rounded-full">Config</span>
                </button>
              </nav>

              {/* Logout Option also inside Fixed Menu bottom */}
              <div className="pt-3 border-t border-slate-100 mt-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>Sign Out / Log Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 min-w-0 w-full space-y-5">
            {/* Feedback Alert */}
            {feedback && (
              <div className="p-3.5 rounded-2xl text-xs flex items-center justify-between gap-2 shadow-xs bg-emerald-50 border border-emerald-200 text-emerald-900 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{feedback.message}</span>
                </div>
                <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-semibold">Loading data from Firebase...</p>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 1: OVERVIEW & STATS                                    */}
        {/* ========================================================== */}
        {!isLoading && activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Applications */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Loan Leads
                </span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {applications.length}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                    📱 {applications.filter(a => a.source === 'mobile_app').length} App
                  </span>
                  <span className="text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    🌐 {applications.filter(a => a.source !== 'mobile_app').length} Web
                  </span>
                </div>
              </div>

              {/* CIBIL Improvement Orders */}
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                    CIBIL Orders (₹299)
                  </span>
                  {pendingCibilCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                      {pendingCibilCount} Pending
                    </span>
                  )}
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                  {cibilOrders.length}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                  <span>₹{totalCibilRevenue.toLocaleString('en-IN')} Collected</span>
                </div>
              </div>

              {/* Total Customers */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Registered Customers
                </span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {customers.length}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <span>100% OTP Verified</span>
                </div>
              </div>

              {/* Approved / Active */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Disbursed / Approved
                </span>
                <p className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
                  {applications.filter(a => a.status === 'APPROVED').length}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                  <span>High Approval Rate</span>
                </div>
              </div>
            </div>

            {/* Pending CIBIL UTR Verifications Alert */}
            {pendingCibilCount > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-400/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      {pendingCibilCount} CIBIL Score Orders Waiting For Payment Verification!
                    </h4>
                    <p className="text-xs text-slate-600">
                      Customers have submitted 12-digit UTR numbers for ₹299. Verify payment and dispatch their Branch loan link.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('cibil')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shrink-0 cursor-pointer shadow-xs"
                >
                  Review & Confirm Now →
                </button>
              </div>
            )}

            {/* Recent CIBIL Orders & Recent Loan Applications Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Box 1: Recent CIBIL Orders */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-black text-slate-900 font-['Outfit',sans-serif]">
                      Recent CIBIL Orders (₹299)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('cibil')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View All ({cibilOrders.length})
                  </button>
                </div>

                {cibilOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No CIBIL orders submitted yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {(cibilOrders || []).slice(0, 5).map(o => (
                      <div key={o.orderId} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{o.fullName}</span>
                            <span className="font-mono text-[10px] text-slate-500">{o.mobileNumber}</span>
                          </div>
                          <p className="text-[10px] font-mono text-amber-700 font-bold mt-0.5">
                            UTR: {o.utrNumber}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {o.status === 'confirmed' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Confirmed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConfirmCibilOrder(o)}
                              disabled={processingCibilId === o.orderId}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Confirm ₹299
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Box 2: Recent Loan Leads */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-black text-slate-900 font-['Outfit',sans-serif]">
                      Recent Loan Applications
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('applications')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View All ({applications.length})
                  </button>
                </div>

                {applications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No loan applications yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {(applications || []).slice(0, 5).map(a => (
                      <div key={a.applicationId} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{a.fullName}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-blue-800 font-bold">
                              {a.loanCategory || 'Personal'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {a.mobileNumber} • ₹{Number(a.amountRequested || 0).toLocaleString('en-IN')}
                          </p>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: CIBIL SCORE ORDERS (₹299 & Branch Link Delivery)    */}
        {/* ========================================================== */}
        {!isLoading && activeTab === 'cibil' && (
          <div className="space-y-5">
            
            {/* Header info */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    Payment Gateway & Link Delivery
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">UPI ID: fincredlo@nyes</span>
                </div>
                <h2 className="text-lg font-black text-white font-['Outfit',sans-serif]">
                  CIBIL Score Improvement Orders (₹599 - ₹199 = ₹299 Only)
                </h2>
                <p className="text-xs text-slate-300">
                  Verify customer UTR payments. Confirming automatically dispatches Branch pre-approved loan link <strong className="text-cyan-300">https://branch.co/download/shubh12360</strong> and triggers in-app notification.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-300 block">Pending Check</span>
                  <span className="text-xl font-black text-amber-300 font-mono">{pendingCibilCount}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-300 block">Confirmed</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">{confirmedCibilCount}</span>
                </div>
              </div>
            </div>

            {/* Controls: Search & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cibilSearch}
                  onChange={e => setCibilSearch(e.target.value)}
                  placeholder="Search by Applicant, Mobile, UTR, or Ref ID..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 outline-none shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['ALL', 'pending_verification', 'confirmed', 'rejected'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setCibilStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      cibilStatusFilter === st
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st === 'ALL'
                      ? 'All Orders'
                      : st === 'pending_verification'
                      ? 'Pending Verification'
                      : st === 'confirmed'
                      ? 'Confirmed & Sent'
                      : 'Rejected'}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Reference ID</th>
                      <th className="p-3.5">Customer / Contact</th>
                      <th className="p-3.5">UPI UTR Number</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Current Status</th>
                      <th className="p-3.5">Branch Loan Link</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredCibilOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No CIBIL improvement orders found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCibilOrders.map(order => (
                        <tr key={order.orderId} className="hover:bg-slate-50/80 transition-colors">
                          {/* Reference ID */}
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-slate-900 block">
                              {order.referenceNumber}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(order.submittedAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{order.fullName}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-slate-600">{order.mobileNumber}</span>
                              <a
                                href={`https://wa.me/91${order.mobileNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Hello ${order.fullName}, regarding your FinCred CIBIL Improvement Order (Ref: ${order.referenceNumber}).`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>
                            {order.panNumber && (
                              <span className="text-[10px] text-slate-400 font-mono">PAN: {order.panNumber}</span>
                            )}
                          </td>

                          {/* UTR Number */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 font-mono font-black text-amber-900 text-xs">
                                {order.utrNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(order.utrNumber, order.orderId)}
                                className="text-slate-400 hover:text-slate-700"
                                title="Copy UTR"
                              >
                                {copiedUtr === order.orderId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="p-3.5">
                            <span className="font-black font-mono text-emerald-700">₹{order.amount || 299}</span>
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            {order.status === 'confirmed' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified & Sent
                              </span>
                            ) : order.status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-800">
                                <AlertCircle className="w-3 h-3" />
                                Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                                <Clock className="w-3 h-3 animate-spin" />
                                Pending Check
                              </span>
                            )}
                          </td>

                          {/* Branch Loan Link */}
                          <td className="p-3.5 max-w-[200px] truncate">
                            {order.status === 'confirmed' ? (
                              <a
                                href={order.loanLink || BRANCH_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] font-bold"
                              >
                                <span>Branch Pre-Approved Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400">Locked until confirmed</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {order.status !== 'confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => handleConfirmCibilOrder(order)}
                                  disabled={processingCibilId === order.orderId}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                >
                                  {processingCibilId === order.orderId ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  )}
                                  <span>Confirm & Send Link</span>
                                </button>
                              )}

                              {order.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenRejectModal(order)}
                                  className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 cursor-pointer"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: LOAN APPLICATIONS MANAGER                           */}
        {/* ========================================================== */}
        {!isLoading && activeTab === 'applications' && (
          <div className="space-y-4">
            
            {/* Search & Status & Origin Filters */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={appSearch}
                    onChange={e => setAppSearch(e.target.value)}
                    placeholder="Search applicants, mobile, application ID..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {(['ALL', 'NEW', 'UNDER REVIEW', 'APPROVED', 'REJECTED'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAppStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        appStatusFilter === st
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {st === 'ALL' ? 'All Statuses' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Filter (Mobile App vs Website) */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Filter by Origin:
                </span>
                <button
                  type="button"
                  onClick={() => setAppSourceFilter('ALL')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    appSourceFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  All Sources ({applications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAppSourceFilter('mobile_app')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    appSourceFilter === 'mobile_app'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200'
                  }`}
                >
                  <span>📱 Mobile App</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-700 text-white font-mono font-bold">
                    {applications.filter(a => a.source === 'mobile_app').length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAppSourceFilter('web')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    appSourceFilter === 'web'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  <span>🌐 Website Portal</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-700 text-white font-mono font-bold">
                    {applications.filter(a => a.source !== 'mobile_app').length}
                  </span>
                </button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Lead ID</th>
                      <th className="p-3.5">Origin</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Category & Amount</th>
                      <th className="p-3.5">Partner</th>
                      <th className="p-3.5">Current Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No loan applications found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map(app => (
                        <tr key={app.applicationId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-slate-900 block">{app.applicationId}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(app.submittedAt).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="p-3.5">
                            {app.source === 'mobile_app' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-100 text-cyan-900 border border-cyan-300 shadow-2xs">
                                <span>📱</span>
                                <span>Mobile App</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
                                <span>🌐</span>
                                <span>Website</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{app.fullName}</span>
                            <span className="font-mono text-slate-600">{app.mobileNumber}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-blue-700 block">{app.loanCategory || 'Personal Loan'}</span>
                            <span className="font-mono text-slate-600 font-bold">
                              ₹{Number(app.amountRequested || 0).toLocaleString('en-IN')}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-semibold text-slate-700">{app.partnerName || 'FINCRED Direct'}</span>
                          </td>

                          <td className="p-3.5">
                            <select
                              value={app.status}
                              onChange={e => handleUpdateAppStatus(app.applicationId, e.target.value as ApplicationStatus)}
                              className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none cursor-pointer"
                            >
                              <option value="NEW">NEW</option>
                              <option value="APPLICATION STARTED">APPLICATION STARTED</option>
                              <option value="UNDER REVIEW">UNDER REVIEW</option>
                              <option value="APPROVED">APPROVED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setActiveLeadModal(app)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                              >
                                Details
                              </button>
                              <button
                                type="button"
                                onClick={() => setAppToDelete(app)}
                                className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: CUSTOMER LEADS DATABASE                             */}
        {/* ========================================================== */}
        {!isLoading && activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  placeholder="Search customer leads by name, mobile..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingCustomer(null);
                  setCustomerForm({
                    fullName: '',
                    mobileNumber: '',
                    email: '',
                    loanCategory: 'Personal Loan',
                    amountRequested: '',
                    status: 'Verified'
                  });
                  setIsCustomerModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Customer Lead</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Customer Name</th>
                      <th className="p-3.5">Mobile Number</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Registered On</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No customer leads found.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map(cust => (
                        <tr key={cust.customerId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">{cust.fullName}</td>
                          <td className="p-3.5 font-mono text-slate-600">{cust.mobileNumber}</td>
                          <td className="p-3.5 text-slate-500">{cust.email || '—'}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {cust.status || 'Verified'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500 text-[11px]">
                            {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`https://wa.me/91${cust.mobileNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Hello ${cust.fullName}, contacting from FinCred Support.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 cursor-pointer"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCustomer(cust);
                                  setCustomerForm({
                                    fullName: cust.fullName,
                                    mobileNumber: cust.mobileNumber,
                                    email: cust.email || '',
                                    loanCategory: cust.loanCategory || 'Personal Loan',
                                    amountRequested: cust.amountRequested ? String(cust.amountRequested) : '',
                                    status: cust.status || 'Verified'
                                  });
                                  setIsCustomerModalOpen(true);
                                }}
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setCustomerToDelete(cust)}
                                className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 5: PARTNER REFERRAL DESTINATION LINKS                  */}
        {/* ========================================================== */}
        {!isLoading && activeTab === 'links' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5 max-w-3xl">
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                Global Partner Referral Links
              </h3>
              <p className="text-xs text-slate-500">
                Update landing URLs for RBI-registered NBFC & fintech lending networks.
              </p>
            </div>

            <form onSubmit={handleSaveLinks} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Branch Personal Loan Link (Dispatched on CIBIL Verification)
                </label>
                <input
                  type="url"
                  value={BRANCH_LINK}
                  readOnly
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-100 border border-slate-300 text-slate-800"
                />
                <span className="text-[10px] text-emerald-600 font-bold block">
                  Official Branch verification link: https://branch.co/download/shubh12360
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">TrueBalance Instant Cash URL</label>
                <input
                  type="url"
                  value={currentLinks.instantLoanUrl || ''}
                  onChange={e => setCurrentLinks({ ...currentLinks, instantLoanUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Choice Connect Referral URL</label>
                <input
                  type="url"
                  value={currentLinks.choiceConnectPersonalLoanUrl || ''}
                  onChange={e => setCurrentLinks({ ...currentLinks, choiceConnectPersonalLoanUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">WeRize Personal / Business Loan URL</label>
                <input
                  type="url"
                  value={currentLinks.personalBusinessLoanUrl || ''}
                  onChange={e => setCurrentLinks({ ...currentLinks, personalBusinessLoanUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Ruloans Multi-Lender Aggregator URL</label>
                <input
                  type="url"
                  value={currentLinks.allTypeLoanUrl || ''}
                  onChange={e => setCurrentLinks({ ...currentLinks, allTypeLoanUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Links to Database</span>
              </button>
            </form>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 6: BROADCAST NOTIFICATIONS                             */}
        {/* ========================================================== */}
        {!isLoading && activeTab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Sender Form */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 font-['Outfit',sans-serif]">
                  Broadcast Notification
                </h3>
                <p className="text-xs text-slate-500">
                  Send real-time alerts to customer portal and mobile app users.
                </p>
              </div>

              <form onSubmit={handleSendNotification} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Notification Title *</label>
                  <input
                    type="text"
                    value={notifForm.title}
                    onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                    placeholder="e.g. Loan Pre-Approved or CIBIL Offer"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Alert Message *</label>
                  <textarea
                    rows={3}
                    value={notifForm.message}
                    onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                    placeholder="Enter message details for customers..."
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Target Audience</label>
                    <input
                      type="text"
                      value={notifForm.target}
                      onChange={e => setNotifForm({ ...notifForm, target: e.target.value })}
                      placeholder="ALL or 10-digit mobile"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Action Link (Optional)</label>
                    <input
                      type="url"
                      value={notifForm.link}
                      onChange={e => setNotifForm({ ...notifForm, link: e.target.value })}
                      placeholder="https://branch.co/download/shubh12360"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingNotif}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSendingNotif ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                  <span>Dispatch Notification Now</span>
                </button>
              </form>
            </div>

            {/* Notification History */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 font-['Outfit',sans-serif]">
                Active Dispatched Notifications ({notifications.length})
              </h3>

              <div className="space-y-2 max-h-[450px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No broadcast notifications yet.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-blue-800 font-bold uppercase">
                            {n.target || 'ALL'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {new Date(n.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteNotif(n.id)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 7: APP REWARD MANAGEMENT (Requirement 4)              */}
        {/* ========================================================== */}
        {!isLoading && activeTab === 'app_rewards' && (
          <AdminAppRewardsTab adminToken={adminToken} />
        )}

        {/* ========================================================== */}
        {/* TAB 8: LOAN REFERRALS & 24-HOUR PAYOUTS (Requirement 11-14)*/}
        {/* ========================================================== */}
        {!isLoading && activeTab === 'loan_referrals' && (
          <AdminLoanReferralsTab adminToken={adminToken} />
        )}

      </main>
        </div>
      </div>

      {/* Earn & Refer Settings Modal */}
      <AdminEarnSettingsModal
        adminToken={adminToken}
        isOpen={isEarnSettingsOpen}
        onClose={() => setIsEarnSettingsOpen(false)}
      />

      {/* Reject Reason Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Reject CIBIL Order for {rejectModalOrder.fullName}
            </h3>
            <p className="text-xs text-slate-500">
              Please enter the reason for rejection (e.g. invalid UTR number, payment not received).
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectCibil}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {activeLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600">Application Details</span>
                <h3 className="text-base font-black text-slate-900">{activeLeadModal.applicationId}</h3>
              </div>
              <button onClick={() => setActiveLeadModal(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Applicant:</span>
                <p className="font-bold text-slate-900">{activeLeadModal.fullName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Mobile:</span>
                <p className="font-mono text-slate-900 font-bold">{activeLeadModal.mobileNumber}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Amount:</span>
                <p className="font-mono font-bold text-blue-600">
                  ₹{Number(activeLeadModal.amountRequested || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Category:</span>
                <p className="font-bold text-slate-900">{activeLeadModal.loanCategory}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Monthly Income:</span>
                <p className="font-mono text-slate-700">₹{Number(activeLeadModal.monthlyIncome || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Employment:</span>
                <p className="text-slate-700">{activeLeadModal.employmentType || 'Salaried'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Application Origin:</span>
                <p className="font-bold flex items-center gap-1">
                  {activeLeadModal.source === 'mobile_app' ? (
                    <span className="text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-300">
                      📱 FinCred Mobile App (PWA)
                    </span>
                  ) : (
                    <span className="text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      🌐 FinCred Website Portal
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Partner Platform:</span>
                <p className="font-semibold text-slate-900">{activeLeadModal.partnerName || 'FinCred Direct'}</p>
              </div>
              {activeLeadModal.city && (
                <div>
                  <span className="text-[10px] text-slate-400">City / Location:</span>
                  <p className="text-slate-700">{activeLeadModal.city}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <a
                href={`https://wa.me/91${activeLeadModal.mobileNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hello ${activeLeadModal.fullName}, regarding your FinCred Loan Application ${activeLeadModal.applicationId}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setActiveLeadModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Application Modal */}
      {appToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Delete Application?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete application {appToDelete.applicationId} for {appToDelete.fullName}? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAppToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteApplication}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Delete Customer Lead?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete {customerToDelete.fullName} ({customerToDelete.mobileNumber})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCustomerToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {editingCustomer ? 'Edit Customer Lead' : 'Add New Customer Lead'}
            </h3>
            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerForm.fullName}
                  onChange={e => setCustomerForm({ ...customerForm, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={customerForm.mobileNumber}
                  onChange={e => setCustomerForm({ ...customerForm, mobileNumber: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email (Optional)</label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomer}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  {isSavingCustomer ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
