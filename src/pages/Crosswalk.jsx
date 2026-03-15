import { useState } from 'react';
import { GitCompareArrows, Plus, Pencil, Trash2 } from 'lucide-react';
import DataSourceBadge from '../components/DataSourceBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';

import { useAccreditation } from '../hooks/useAccreditation';
import { useSharePointData } from '../hooks/useSharePointData';

const categories = [
  'All Categories', 'Safety', 'Clinical', 'HR', 'Privacy',
  'Documentation', 'Quality', 'Rights', 'Access',
];

const crosswalkFields = [
  { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g., Fire Safety and Emergency Drills' },
  { key: 'carfStandard', label: 'CARF Standard', type: 'text', placeholder: 'e.g., 1.H.7' },
  { key: 'tjcStandard', label: 'TJC Standard', type: 'text', placeholder: 'e.g., TJC.EC.02.03.01' },
  { key: 'stateRegulation', label: 'State Regulation', type: 'text', placeholder: 'e.g., 908 KAR 1:370 §12' },
  { key: 'federalRegulation', label: 'Federal Regulation', type: 'text', placeholder: 'e.g., 42 CFR 2.31' },
  { key: 'policyRef', label: 'Policy Reference', type: 'text', placeholder: 'e.g., HR-20' },
  { key: 'trainingRef', label: 'Training Reference', type: 'text', placeholder: 'e.g., Health and Safety Training' },
  { key: 'category', label: 'Category', type: 'select', required: true, options: ['Safety', 'Clinical', 'HR', 'Privacy', 'Documentation', 'Quality', 'Rights', 'Access'] },
];

export default function Crosswalk() {
  const { filterByBody } = useAccreditation();
  const { data: crosswalkData, loading, dataSource, lastRefreshed, refresh, create, update, remove } = useSharePointData('Crosswalk', []);
  const [filter, setFilter] = useState('All Categories');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Apply global accreditation filter, then category filter, then search
  const globalFiltered = filterByBody(crosswalkData);
  const categoryFiltered = filter === 'All Categories' ? globalFiltered : globalFiltered.filter(c => c.category === filter);
  const q = search.toLowerCase();
  const filtered = q ? categoryFiltered.filter(c =>
    (c.title || '').toLowerCase().includes(q) ||
    (c.carfStandard || '').toLowerCase().includes(q) ||
    (c.tjcStandard || '').toLowerCase().includes(q) ||
    (c.stateRegulation || '').toLowerCase().includes(q) ||
    (c.federalRegulation || '').toLowerCase().includes(q) ||
    (c.policyRef || '').toLowerCase().includes(q) ||
    (c.trainingRef || '').toLowerCase().includes(q) ||
    (c.category || '').toLowerCase().includes(q)
  ) : categoryFiltered;

  // Category counts
  const catCounts = {};
  globalFiltered.forEach(c => {
    const cat = c.category || 'Uncategorized';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });
  const topCategories = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

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
    if (confirm(`Delete crosswalk entry "${item.title}"?`)) {
      await remove(item.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance Crosswalk</h1>
          <p className="text-sm text-slate-500 mt-1">Requirement mapping across CARF, TJC, State, and Federal bodies</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge dataSource={dataSource} lastRefreshed={lastRefreshed} onRefresh={refresh} loading={loading} />
          <button onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700">
            <Plus size={16} /> Add Entry
          </button>
        </div>
      </div>

      {/* Category counts */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {topCategories.map(([cat, count]) => (
          <div key={cat} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <GitCompareArrows size={20} className="text-indigo-500" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
                <p className="text-xs text-slate-500">{cat}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Category Filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filter === c ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search crosswalk..." />
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
          <GitCompareArrows size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No crosswalk entries found</p>
          <p className="text-xs text-slate-400 mt-1">{q ? 'Try adjusting your search' : 'Add your first crosswalk entry to get started'}</p>
        </div>
      )}

      {/* Crosswalk Table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">CARF</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">TJC</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">State</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Federal</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Policy</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Training</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <GitCompareArrows size={14} className="text-indigo-500" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-slate-600">{item.carfStandard || '—'}</td>
                  <td className="px-5 py-4 text-sm font-mono text-slate-600">{item.tjcStandard || '—'}</td>
                  <td className="px-5 py-4 text-sm font-mono text-slate-600">{item.stateRegulation || '—'}</td>
                  <td className="px-5 py-4 text-sm font-mono text-slate-600">{item.federalRegulation || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{item.policyRef || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{item.trainingRef || '—'}</td>
                  <td className="px-5 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{item.category}</span></td>
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
        title={editItem ? `Edit: ${editItem.title}` : 'Add Crosswalk Entry'}
        fields={crosswalkFields}
        initialData={editItem || {}}
        loading={loading}
      />
    </div>
  );
}
