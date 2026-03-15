import { RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Shows the data freshness status so users always know if they're looking at
 * real-time SharePoint data, cached data, or offline fallback.
 *
 * Props:
 *   dataSource — 'live' | 'cached' | 'offline' | 'loading'
 *   lastRefreshed — Date or null
 *   onRefresh — async callback to trigger manual refresh
 *   loading — boolean, true while fetching
 */
export default function DataSourceBadge({ dataSource, lastRefreshed, onRefresh, loading }) {
  const [ago, setAgo] = useState('');

  // Update "Xs ago" every 10s
  useEffect(() => {
    if (!lastRefreshed) return;
    const tick = () => {
      const seconds = Math.round((Date.now() - lastRefreshed.getTime()) / 1000);
      if (seconds < 10) setAgo('just now');
      else if (seconds < 60) setAgo(`${seconds}s ago`);
      else if (seconds < 3600) setAgo(`${Math.floor(seconds / 60)}m ago`);
      else setAgo(`${Math.floor(seconds / 3600)}h ago`);
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [lastRefreshed]);

  const config = {
    live: {
      icon: Wifi,
      label: 'Live',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    cached: {
      icon: Clock,
      label: 'Cached',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      dot: 'bg-amber-500',
    },
    offline: {
      icon: WifiOff,
      label: 'Offline',
      color: 'text-red-600 bg-red-50 border-red-200',
      dot: 'bg-red-500',
    },
    loading: {
      icon: RefreshCw,
      label: 'Loading',
      color: 'text-slate-500 bg-slate-50 border-slate-200',
      dot: 'bg-slate-400',
    },
  };

  const c = config[dataSource] || config.loading;
  const Icon = c.icon;

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${dataSource === 'live' ? 'animate-pulse' : ''}`} />
        <Icon size={12} />
        {c.label}
        {ago && dataSource !== 'loading' && (
          <span className="text-[10px] opacity-70 ml-0.5">· {ago}</span>
        )}
      </span>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-40"
          title="Refresh data"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      )}

      {dataSource === 'offline' && (
        <span className="text-[10px] text-red-500 font-medium">Demo data — not for audit use</span>
      )}
      {dataSource === 'cached' && (
        <span className="text-[10px] text-amber-500 font-medium">SharePoint unreachable — showing last fetched data</span>
      )}
    </div>
  );
}
