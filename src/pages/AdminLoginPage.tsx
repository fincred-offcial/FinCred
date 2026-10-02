import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { adminLogin } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAdminSession, isAdminLoggedIn } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn) {
      navigate('/admin-dashboard');
    }
  }, [isAdminLoggedIn, navigate]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please provide both administrator username and access key.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await adminLogin(username.trim(), password.trim());
      setAdminSession(res.token);
      navigate('/admin-dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Access denied: Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050814] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-[#0b1026] to-[#060a19] border border-blue-900/40 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Hidden System Portal Notice */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-950">
            <KeyRound className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">
            FinCred Management Portal
          </h1>
          <p className="text-xs text-slate-400">
            Central Administrator & Partner Operations Terminal
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAdminSubmit} className="space-y-4" id="admin-login-form">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Administrator Username
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              placeholder="Enter admin ID"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Security Access Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            id="admin-submit-login-btn"
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 shadow-lg shadow-amber-950/50 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Authenticating with Central Core...</span>
              </>
            ) : (
              <>
                <span>Authorize & Enter Admin Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Protected endpoint. Unauthorized intrusion attempts are monitored.
          </p>
        </div>
      </div>
    </div>
  );
};
