import { useState, useMemo } from 'react';
import { Scale, Plus, Pencil, Download, AlertTriangle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';
import { regulatoryChanges as mockChanges } from '../data/mockData';
import { useSharePointData } from '../hooks/useSharePointData';
import { exportRegulatoryChangeLog } from '../lib/exportService';
import { useAuth } from '../hooks/useAuth';

const bodyTabs = ['All Changes', 'TJC', 'CARF', 'State', 'Federal'];

const changeFields = [
  { key: 'date', label: 'Effective Date', type: 'date', required: true },
  { key: 'body', label: 'Regulatory Body', type: 'select', required: true, options: ['The Joint Commission (TJC)', 'CARF International', 'State Regulations', 'Federal (HIPAA)'] },
  { key: 'changeType', label: 'Change Type', type: 'select', required: true, options: ['New Requirement', 'Standard Revision', 'Regulation Amendment', 'Clarification', 'Rule Change', 'Guidance Update'] },
  { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Brief title of the change' },
  { key: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the regulatory change and its implications' },
  { key: 'impactedStandards', label: 'Impacted Standards', type: 'tags', placeholder: 'e.g., EC.02.06.01, 1.A.4' },
  { key: 'actionRequired', label: 'Action Required', type: 'textarea', required: true, placeholder: 'Steps needed to comply with this change' },
  { key: 'dueDate', label: 'Compliance Due Date', type: 'date', required: true },
  { key: 'assignedTo', label: 'Assigned To', type: 'text', required: true, placeholder: 'Person responsible' },
  { key: 'priority', label: 'Priority', type: 'select', required: true, options: ['Critical', 'High', 'Medium', 'Low'] },
  { key: 'status', label: 'Status', type: 'select', required: true, options: ['Not Started', 'In Progress', 'Complete', 'Deferred'] },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional context or documentation references' },
];

const priorityColors = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-amber-100 text-amber-700',
  Medium: 'bg-blue-100 text-blue-700',
  Low: 'bg-slate-100 text-slate-600',
};

export default function RegulatoryChanges() {
  const { canCreate, canEdit } = useAuth();
  const { data: changes, loading, isLive, create, update } = useSharePointData('RegulatoryChanges', mockChanges);
  const [tab, setTab] = useState('All Changes');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Filter by body tab
  const bodyMap = {
    'TJC': 'Joint Commission',
    'CARF': 'CARF',
    'State': 'State',
    'Federal': 'Federal',
  };
  const tabFiltered = tab === 'All Changes' ? changes : changes.filter(c => (c.body || '').includes(bodyMap[tab]));

  // Search
  const q = search.toLowerCase();
  const filtered = q ? tabFiltered.filter(c =>
    (c.title || '').toLowerCase().includes(q) ||
    (c.description || '').toLowerCase().includes(q) ||
    (c.body || '').toLowerCase().includes(q) ||
    (c.assignedTo || '').toLowerCase().includes(q) ||
    (c.actionRequired || '').toLowerCase().includes(q) ||
    (c.impactedStandards || []).some(s => s.toLowerCase().includes(q))
  ) : tabFiltered;

  // Stats
  const stats = useMemo(() => ({
    total: changes.length,
    critical: changes.filter(c => c.priority === 'Critical').length,
    inProgress: changes.filter(c => c.status === 'In Progress').length,
    complete: changes.filter(c => c.status === 'Complete').length,
    overdue: changes.filter(c => {
      if (c.status === 'Complete') return false;
      return c.dueDate && new Date(c.dueDate) < new Date();
    }).length,
  }), [changes]);

  const bodyCounts = useMemo(() => ({
    'TJC': changes.filter(c => (c.body || '').includes('Joint Commission')).length,
    'CARF': changes.filter(c => (c.body || '').includes('CARF')).length,
    'State': changes.filter(c => (c.body || '').includes('State')).length,
    'Federal': changes.filter(c => (c.body || '').includes('Federal') || (c.body || '').includes('HIPAA')).length,
  }), [changes]);

  const handleSubmit = async (formData) => {
    if (editItem?.id) {
      await update(editItem.id, formData);
    } else {
      await create(formData);
    }
    setModalOpen(false);
    setEditItem(null);
  };

  const handleExport = () => {
    const bodyFilter = tab === 'All Changes' ? 'all' : tab;
    exportRegulatoryChangeLog(changes, bodyFilter);
  };

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Regulatory Change Log</h1>
            {isLive ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium"><Wifi size={10} /> SharePoint</span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium"><WifiOff size={10} /> Offline</span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">Track CARF, Joint Commission, and State regulatory changes — board-ready audit trail</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-200 hover:bg-slate-50">
            <Download size={16} /> Export
          </button>
          {canCreate('/regulatory-changes') && (
            <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700">
              <Plus size={16} /> Log Change
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3"><Scale size={20} className="text-indigo-500" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-slate-500">Total Changes</p></div></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3"><AlertTriangle size={20} className="text-red-500" /><div><p className="text-2xl font-bold">{stats.critical}</p><p className="text-xs text-slate-500">Critical Priority</p></div></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3"><Clock size={20} className="text-blue-500" /><div><p className="text-2xl font-bold">{stats.inProgress}</p><p className="text-xs text-slate-500">In Progress</p></div></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3"><CheckCircle size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{stats.complete}</p><p className="text-xs text-slate-500">Complete</p></div></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3"><AlertTriangle size={20} className="text-amber-500" /><div><p className="text-2xl font-bold text-amber-600">{stats.overdue}</p><p className="text-xs text-slate-500">Overdue</p></div></div>
        </div>
      </div>

      {/* Body Tabs + Search */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {bodyTabs.map(b => (
            <button key={b} onClick={() => setTab(b)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === b ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              {b} {b !== 'All Changes' && `(${bodyCounts[b] || 0})`}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search changes..." />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Scale size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No regulatory changes found</p>
          <p className="text-xs text-slate-400 mt-1">{q ? 'Try adjusting your search' : 'Log your first regulatory change'}</p>
        </div>
      )}

      {/* Change Cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map(change => {
            const daysUntil = getDaysUntil(change.dueDate);
            const isOverdue = change.status !== 'Complete' && daysUntil !== null && daysUntil < 0;
            return (
              <div key={change.id} className={`bg-white rounded-xl border ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-slate-200'} p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[change.priority] || 'bg-slate-100 text-slate-600'}`}>
                        {change.priority}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{change.changeType}</span>
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">
                        {(change.body || '').includes('Joint') ? 'TJC' : (change.body || '').includes('CARF') ? 'CARF' : (change.body || '').includes('State') ? 'State' : 'Federal'}
                      </span>
                      <StatusBadge status={change.status} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{change.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{change.description}</p>
                  </div>
                  {canEdit && (
                    <button onClick={() => { setEditItem(change); setModalOpen(true); }} className="text-slate-400 hover:text-indigo-600 ml-4 shrink-0">
                      <Pencil size={14} />
                    </button>
                  )}
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Impacted Standards</p>
                    <div className="flex flex-wrap gap-1">
                      {(change.impactedStandards || []).map(s => (
                        <span key={s} className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-mono">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Action Required</p>
                    <p className="text-xs text-slate-600 line-clamp-3">{change.actionRequired}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Assigned To</p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">
                        {(change.assignedTo || '').split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs text-slate-600">{change.assignedTo}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Compliance Deadline</p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : daysUntil !== null && daysUntil <= 30 ? 'text-amber-600' : 'text-slate-700'}`}>
                      {change.dueDate}
                      {daysUntil !== null && (
                        <span className="text-xs ml-1">
                          ({isOverdue ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d left`})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {change.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Notes</p>
                    <p className="text-xs text-slate-500 italic">{change.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSubmit={handleSubmit}
        title={editItem ? `Edit: ${editItem.title}` : 'Log Regulatory Change'}
        fields={changeFields}
        initialData={editItem || {}}
        loading={loading}
      />
    </div>
  );
}
