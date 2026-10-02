import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 border border-slate-700 px-3.5 py-2 text-xs font-medium text-white shadow-2xl backdrop-blur-sm">
      <WifiOff className="w-4 h-4 text-amber-400" />
      <span>Offline Mode — Cached data is being used.</span>
    </div>
  );
};
