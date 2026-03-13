import { useState, useMemo } from 'react';
import { ScrollText, Download, Filter, Trash2, ArrowUpDown, Clock, User, FileText } from 'lucide-react';
import SearchInput from '../components/SearchInput';
import { auditLog as mockAuditLog } from '../data/mockData';
import { getLocalAuditLog, clearLocalAuditLog, exportAuditLog } from '../lib/auditService';
import { exportToCSV } from '../lib/exportService';
import { useAuth } from '../hooks/useAuth';

const actionColors = {
  Create: 'bg-emerald-100 text-emerald-700',
  Update: 'bg-blue-100 text-blue-700',
  Delete: 'bg-red-100 text-red-700',
};

const entityOptions = ['All', 'Standards', 'Policies', 'Incidents', 'Training', 'Personnel', 'Credentials', 'Licenses', 'EOCInspections', 'LigatureRisk', 'DailyStaffing', 'RegulatoryChanges'];
const actionOptions = ['All', 'Create', 'Update', 'Delete'];

export default function AuditLog() {
  const { isAdmin, user } = useAuth();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortDesc, setSortDesc] = useState(true);

  // Merge localStorage audit events with mock data
  const allEvents = useMemo(() => {
    const localEvents = getLocalAuditLog();
    const mockIds = new Set(mockAuditLog.map(e => e.id));
    const localOnly = localEvents.filter(e => !mockIds.has(e.id));
    const merged = [...localOnly, ...mockAuditLog];
    return merged.sort((a, b) =>
      sortDesc
        ? new Date(b.timestamp) - new Date(a.timestamp)
        : new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [sortDesc]);

  // Apply filters
  const filtered = useMemo(() => {
    let result = allEvents;
    if (entityFilter !== 'All') result = result.filter(e => e.entity === entityFilter);
    if (actionFilter !== 'All') result = result.filter(e => e.action === actionFilter);
    if (dateRange.start) result = result.filter(e => e.timestamp >= dateRange.start);
    if (dateRange.end) result = result.filter(e => e.timestamp <= dateRange.end + 'T23:59:59Z');
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        (e.summary || '').toLowerCase().includes(q) ||
        (e.userName || '').toLowerCase().includes(q) ||
        (e.entity || '').toLowerCase().includes(q) ||
        (e.recordName || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [allEvents, entityFilter, actionFilter, dateRange, search]);

  // Stats
  const stats = useMemo(() => ({
    total: allEvents.length,
    creates: allEvents.filter(e => e.action === 'Create').length,
    updates: allEvents.filter(e => e.action === 'Update').length,
    deletes: allEvents.filter(e => e.action === 'Delete').length,
    uniqueUsers: new Set(allEvents.map(e => e.userName)).size,
  }), [allEvents]);

  const handleExport = () => {
    exportToCSV(filtered, `AuditLog_Export_${new Date().toISOString().slice(0, 10)}`, [
      { key: 'timestamp', label: 'Timestamp' },
      { key: 'userName', label: 'User' },
      { key: 'userRole', label: 'Role' },
      { key: 'action', label: 'Action' },
      { key: 'entity', label: 'Entity' },
      { key: 'recordName', label: 'Record' },
      { key: 'summary', label: 'Summary' },
      { key: 'changes', label: 'Changes (JSON)' },
    ]);
  };

  const formatTimestamp = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const parseChanges = (changesStr) => {
    try {
      return JSON.parse(changesStr);
    } catch {
      return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Audit Trail</h1>
            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">CARF/TJC Required</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Complete change history for compliance surveys and board review</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-200 hover:bg-slate-50">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <ScrollText size={20} className="text-indigo-500" />
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-slate-500">Total Events</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-emerald-500" />
            <div><p className="text-2xl font-bold">{stats.creates}</p><p className="text-xs text-slate-500">Creates</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-blue-500" />
            <div><p className="text-2xl font-bold">{stats.updates}</p><p className="text-xs text-slate-500">Updates</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-red-500" />
            <div><p className="text-2xl font-bold">{stats.deletes}</p><p className="text-xs text-slate-500">Deletes</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <User size={20} className="text-amber-500" />
            <div><p className="text-2xl font-bold">{stats.uniqueUsers}</p><p className="text-xs text-slate-500">Active Users</p></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
              {entityOptions.map(o => <option key={o} value={o}>{o === 'All' ? 'All Entities' : o}</option>)}
            </select>
          </div>
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
            {actionOptions.map(o => <option key={o} value={o}>{o === 'All' ? 'All Actions' : o}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">From:</span>
            <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">To:</span>
            <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white" />
          </div>
          <button onClick={() => setSortDesc(!sortDesc)} className="text-sm text-slate-600 hover:text-indigo-600 flex items-center gap-1">
            <ArrowUpDown size={14} /> {sortDesc ? 'Newest First' : 'Oldest First'}
          </button>
          <div className="ml-auto">
            <SearchInput value={search} onChange={setSearch} placeholder="Search audit log..." />
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">Showing {filtered.length} of {allEvents.length} events</p>
      </div>

      {/* Audit Log Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ScrollText size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No audit events found</p>
          <p className="text-xs text-slate-400 mt-1">Adjust filters or search criteria</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Timestamp</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Entity</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Record</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Changes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(event => {
                const changes = parseChanges(event.changes);
                return (
                  <tr key={event.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-600 font-mono">{formatTimestamp(event.timestamp)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                          {(event.userName || '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-900">{event.userName}</p>
                          <p className="text-[10px] text-slate-400">{event.userRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${actionColors[event.action] || 'bg-slate-100 text-slate-600'}`}>
                        {event.action}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{event.entity}</span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-slate-900 font-medium">{event.recordName}</p>
                    </td>
                    <td className="px-5 py-3">
                      {changes && typeof changes === 'object' ? (
                        <div className="max-w-xs">
                          {Object.entries(changes).slice(0, 3).map(([field, val]) => (
                            <div key={field} className="text-[10px] text-slate-500 mb-0.5">
                              <span className="font-medium text-slate-700">{field}:</span>{' '}
                              {val && typeof val === 'object' && val.old !== undefined ? (
                                <span>
                                  <span className="text-red-500 line-through">{String(val.old).slice(0, 20)}</span>
                                  {' → '}
                                  <span className="text-emerald-600">{String(val.new).slice(0, 20)}</span>
                                </span>
                              ) : (
                                <span className="text-emerald-600">{String(val).slice(0, 30)}</span>
                              )}
                            </div>
                          ))}
                          {Object.keys(changes).length > 3 && (
                            <span className="text-[10px] text-slate-400">+{Object.keys(changes).length - 3} more</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">{event.summary}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
