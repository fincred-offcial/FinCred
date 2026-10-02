import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Users,
  Radio,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  sendAdminNotification,
  fetchAdminNotifications,
  deleteAdminNotification
} from '../../services/api.js';
import {
  requestBrowserNotificationPermission,
  showBrowserNotification,
  getNotificationPermission
} from '../../services/notificationService.js';
import { CustomerNotification } from '../../types.js';

interface AdminNotificationsTabProps {
  token: string;
}

export const AdminNotificationsTab: React.FC<AdminNotificationsTabProps> = ({ token }) => {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'offer' | 'success' | 'warning' | 'alert'>('offer');
  const [target, setTarget] = useState<'ALL' | string>('ALL');
  const [customTarget, setCustomTarget] = useState('');
  const [actionUrl, setActionUrl] = useState('/dashboard?tab=options');

  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const list = await fetchAdminNotifications(token);
      setNotifications(list);
    } catch (e: any) {
      console.warn('Failed to load admin notifications:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [token]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({ type: 'error', message: 'Title and message are required.' });
      return;
    }

    setIsSending(true);
    setFeedback(null);

    const actualTarget = target === 'ALL' ? 'ALL' : customTarget.trim() || 'ALL';

    try {
      const res = await sendAdminNotification(token, {
        title: title.trim(),
        message: message.trim(),
        type,
        target: actualTarget,
        actionUrl
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Notification successfully broadcasted to Chrome browsers, mobile app, and user portals!'
        });
        setTitle('');
        setMessage('');
        setCustomTarget('');
        loadNotifications();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to send notification.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this broadcast notification?')) return;
    try {
      await deleteAdminNotification(token, id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setFeedback({ type: 'success', message: 'Notification removed successfully.' });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to delete notification.' });
    }
  };

  const handleTestOnThisDevice = async () => {
    const granted = await requestBrowserNotificationPermission();
    if (granted || getNotificationPermission() === 'granted') {
      showBrowserNotification(
        title.trim() || '🔔 FinCred Loan Alert Test',
        {
          body: message.trim() || 'This is a live preview test notification delivered to your Chrome browser!',
          actionUrl: actionUrl || '/dashboard'
        }
      );
      setTestFeedback('Test notification sent to your browser! Check your desktop/Android tray.');
      setTimeout(() => setTestFeedback(null), 4000);
    } else {
      setTestFeedback('Please allow notifications in your browser address bar permissions.');
      setTimeout(() => setTestFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
              Broadcast & Push Notifications
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
              <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
              Live Push
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Broadcast instant push alerts to Google Chrome, Android PWA, and logged-in Customer Portals
          </p>
        </div>

        <button
          type="button"
          onClick={loadNotifications}
          disabled={isLoading}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Compose & Broadcast Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Send New Broadcast Notification</h3>
              <p className="text-xs text-slate-500">Dispatches in real-time to active browsers and portals</p>
            </div>
          </div>

          {/* Test Button */}
          <button
            type="button"
            onClick={handleTestOnThisDevice}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Test On My Chrome</span>
          </button>
        </div>

        {testFeedback && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
            {testFeedback}
          </div>
        )}

        <form onSubmit={handleSendNotification} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Notification Title</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 🎉 Special Low-Interest Loan Offer: Apply Up to ₹5 Lakhs!"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Notification Message</span>
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="e.g. Verified digital approval in 10 minutes. Minimal documentation required with partner NBFCs. Tap to check options."
                rows={3}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
              />
            </div>

            {/* Notification Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Notification Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
              >
                <option value="offer">🎉 Loan Offer / Promotion</option>
                <option value="info">ℹ️ General Information</option>
                <option value="success">✅ Approval / Verification Update</option>
                <option value="warning">⚠️ Document Notice</option>
                <option value="alert">🔔 Important Alert</option>
              </select>
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Target Audience</label>
              <select
                value={target}
                onChange={e => setTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
              >
                <option value="ALL">🌐 Broadcast to ALL Users & Website Visitors</option>
                <option value="CUSTOM">👤 Specific Customer (by Mobile or Customer ID)</option>
              </select>
            </div>

            {target === 'CUSTOM' && (
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800">
                  Target Customer ID or Mobile Number
                </label>
                <input
                  type="text"
                  value={customTarget}
                  onChange={e => setCustomTarget(e.target.value)}
                  placeholder="e.g. 9876543210 or cust_123456"
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-medium"
                />
              </div>
            )}

            {/* Action / Destination Link */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-800">
                Action / Redirection Link
              </label>
              <select
                value={actionUrl}
                onChange={e => setActionUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
              >
                <option value="/dashboard?tab=options">Available Loan Options (/dashboard?tab=options)</option>
                <option value="/dashboard?tab=applications">My Applications (/dashboard?tab=applications)</option>
                <option value="/dashboard?tab=documents">Document Upload Section (/dashboard?tab=documents)</option>
                <option value="/dashboard">Customer Portal Home (/dashboard)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSending || !title.trim() || !message.trim()}
              className={`px-6 py-3 rounded-2xl text-xs font-black text-white shadow-md flex items-center gap-2 cursor-pointer transition-all ${
                !isSending && title.trim() && message.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-[0.99]'
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Broadcasting Live...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Broadcast Notification Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sent Broadcast History</h3>
            <p className="text-xs text-slate-500">Active alerts received by users</p>
          </div>
          <span className="text-xs font-bold text-slate-500">{notifications.length} alerts</span>
        </div>

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No broadcast notifications sent yet. Use the form above to dispatch your first alert.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{notif.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight ${
                        notif.type === 'offer'
                          ? 'bg-amber-100 text-amber-800'
                          : notif.type === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : notif.type === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : notif.type === 'alert'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {notif.type || 'info'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Target: <strong className="text-slate-700">{notif.target || 'ALL'}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>Sent: {new Date(notif.timestamp).toLocaleString()}</span>
                    {notif.actionUrl && (
                      <span className="text-blue-600">Action: {notif.actionUrl}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(notif.id)}
                  title="Delete Alert"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors self-end sm:self-center cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
