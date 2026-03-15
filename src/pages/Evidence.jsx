import { useState } from 'react';
import { FileCheck2, Plus, Pencil, Trash2 } from 'lucide-react';
import DataSourceBadge from '../components/DataSourceBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';

import { useAccreditation } from '../hooks/useAccreditation';
import { useSharePointData } from '../hooks/useSharePointData';
import { formatDate } from '../lib/formatDate';

const statusFilters = ['All Statuses', 'Current', 'Missing', 'Outdated', 'Under Review'];

const statusColors = {
  'Current': 'bg-emerald-100 text-emerald-700',
  'Missing': 'bg-red-100 text-red-700',
  'Outdated': 'bg-amber-100 text-amber-700',
  'Under Review': 'bg-blue-100 text-blue-700',
};

const evidenceFields = [
  { key: 'documentName', label: 'Document Name', type: 'text', required: true, placeholder: 'e.g., Fire Drill Report Q1 2026' },
  { key: 'standardCode', label: 'Standard Reference', type: 'text', required: true, placeholder: 'e.g., CARF 1.K.1' },
  { key: 'documentType', label: 'Document Type', type: 'select', required: true, options: ['Policy', 'Training Record', 'Form', 'Report', 'Certificate', 'Photo', 'Meeting Minutes', 'Plan', 'Assessment'] },
  { key: 'policyRef', label: 'Policy Reference', type: 'text', placeholder: 'e.g., HR-001' },
  { key: 'location', label: 'File Location', type: 'text', placeholder: 'e.g., SharePoint > Evidence > Safety' },
  { key: 'lastUpdated', label: 'Upload Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', required: true, options: ['Current', 'Outdated', 'Missing', 'Under Review'] },
];

export default function Evidence() {
  const { filterByBody } = useAccreditation();
  const { data: evidenceData, loading, dataSource, lastRefreshed, refresh, create, update, remove } = useSharePointData('Evidence', []);
  const [filter, setFilter] = useState('All Statuses');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Apply global accreditation filter, then status filter, then search
  const globalFiltered = filterByBody(evidenceData);
  const statusFiltered = filter === 'All Statuses' ? globalFiltered : globalFiltered.filter(e => e.status === filter);
  const q = search.toLowerCase();
  const filtered = q ? statusFiltered.filter(e =>
    (e.documentName || '').toLowerCase().includes(q) ||
    (e.standardCode || '').toLowerCase().includes(q) ||
    (e.documentType || '').toLowerCase().includes(q) ||
    (e.policyRef || '').toLowerCase().includes(q) ||
    (e.location || '').toLowerCase().includes(q)
  ) : statusFiltered;

  // Status counts
  const counts = {
    'Current': globalFiltered.filter(e => e.status === 'Current').length,
    'Missing': globalFiltered.filter(e => e.status === 'Missing').length,
    'Outdated': globalFiltered.filter(e => e.status === 'Outdated').length,
    'Under Review': globalFiltered.filter(e => e.status === 'Under Review').length,
  };

  const countColors = {
    'Current': 'text-emerald-500',
    'Missing': 'text-red-500',
    'Outdated': 'text-amber-500',
    'Under Review': 'text-blue-500',
  };

  const handleAdd = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    if (editItem?.id) {
      await update(editItem.id, formData);
    } else {
      await create(formData);
    }
    setModalOpen(false);
    setEditItem(null);
  };

  const handleDelete = async (item) => {
    if (confirm(`Delete evidence document "${item.documentName}"?`)) {
      await remove(item.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Evidence Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">Evidence documents linked to accreditation standards with status tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge dataSource={dataSource} lastRefreshed={lastRefreshed} onRefresh={refresh} loading={loading} />
          <button onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700">
            <Plus size={16} /> Add Evidence
          </button>
        </div>
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <FileCheck2 size={20} className={countColors[status]} />
              <div>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
                <p className="text-xs text-slate-500">{status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Status Filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {statusFilters.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search evidence..." />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileCheck2 size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No evidence documents found</p>
          <p className="text-xs text-slate-400 mt-1">{q ? 'Try adjusting your search' : 'Add your first evidence document to get started'}</p>
        </div>
      )}

      {/* Evidence Table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Document Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Standard Ref</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Document Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Policy Ref</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Location</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Upload Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <FileCheck2 size={14} className="text-indigo-500" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{item.documentName}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-slate-600">{item.standardCode || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{item.documentType || '—'}</td>
                  <td className="px-5 py-4 text-sm font-mono text-slate-600">{item.policyRef || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status] || 'bg-slate-100 text-slate-600'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500 font-mono">{item.location || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDate(item.lastUpdated)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-indigo-600"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(item)} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSubmit={handleSubmit}
        title={editItem ? `Edit: ${editItem.documentName}` : 'Add Evidence Document'}
        fields={evidenceFields}
        initialData={editItem || {}}
        loading={loading}
      />
    </div>
  );
}
