import { useState } from 'react';
import { Library, Plus, Pencil, Trash2, Wifi, WifiOff } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';
import { standards as mockStandards } from '../data/mockData';
import { useAccreditation } from '../hooks/useAccreditation';
import { useSharePointData } from '../hooks/useSharePointData';

const bodies = ['All Standards', 'TJC', 'CARF', 'State', 'Federal'];

const standardFields = [
  { key: 'code', label: 'Standard Code', type: 'text', required: true, placeholder: 'e.g., HR.01.01.01' },
  { key: 'name', label: 'Standard Name', type: 'text', required: true, placeholder: 'Enter standard name' },
  { key: 'body', label: 'Accreditation Body', type: 'select', required: true, options: ['The Joint Commission', 'CARF International', 'State Regulations', 'Federal (HIPAA)'] },
  { key: 'category', label: 'Category', type: 'text', required: true, placeholder: 'e.g., Human Resources' },
  { key: 'status', label: 'Status', type: 'select', required: true, options: ['Met', 'Partially Met', 'Not Met', 'N/A'] },
  { key: 'evidenceRequired', label: 'Evidence Required', type: 'tags', placeholder: 'Policy document, Training records, ...' },
];

export default function Standards() {
  const { filterByBody } = useAccreditation();
  const { data: standards, loading, isLive, create, update, remove } = useSharePointData('Standards', mockStandards);
  const [filter, setFilter] = useState('All Standards');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Apply global accreditation filter first, then local tab filter, then search
  const globalFiltered = filterByBody(standards);
  const bodyMap = { 'TJC': 'The Joint Commission', 'CARF': 'CARF International', 'State': 'State Regulations', 'Federal': 'Federal (HIPAA)' };
  const tabFiltered = filter === 'All Standards' ? globalFiltered : globalFiltered.filter(s => s.body === bodyMap[filter]);
  const q = search.toLowerCase();
  const filtered = q ? tabFiltered.filter(s =>
    (s.code || '').toLowerCase().includes(q) ||
    (s.name || '').toLowerCase().includes(q) ||
    (s.category || '').toLowerCase().includes(q) ||
    (s.body || '').toLowerCase().includes(q)
  ) : tabFiltered;

  const counts = {
    'TJC': globalFiltered.filter(s => (s.body || '').includes('Joint Commission')).length,
    'CARF': globalFiltered.filter(s => (s.body || '').includes('CARF')).length,
    'State': globalFiltered.filter(s => (s.body || '').includes('State')).length,
    'Federal': globalFiltered.filter(s => (s.body || '').includes('HIPAA') || (s.body || '').includes('Federal')).length,
  };

  const handleAdd = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const handleEdit = (std) => {
    setEditItem(std);
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

  const handleDelete = async (std) => {
    if (confirm(`Delete standard ${std.code}?`)) {
      await remove(std.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Accreditation Standards</h1>
            {isLive ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium"><Wifi size={10} /> SharePoint</span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium"><WifiOff size={10} /> Offline</span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">Reference library for TJC, CARF, and regulatory standards</p>
        </div>
        <button onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={16} /> Add Standard
        </button>
      </div>

      {/* Body counts */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(counts).map(([body, count]) => (
          <div key={body} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <Library size={20} className="text-indigo-500" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
                <p className="text-xs text-slate-500">{body === 'Federal' ? 'Federal/HIPAA' : body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
        {bodies.map(b => (
          <button
            key={b}
            onClick={() => setFilter(b)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === b ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            {b}
          </button>
        ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search standards..." />
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
          <Library size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No standards found</p>
          <p className="text-xs text-slate-400 mt-1">{q ? 'Try adjusting your search' : 'Add your first standard to get started'}</p>
        </div>
      )}

      {/* Standards Table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Standard</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Body</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Evidence Required</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(std => (
                <tr key={std.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <Library size={14} className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{std.code}</p>
                        <p className="text-xs text-slate-500">{std.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{std.body}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{std.category}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(std.evidenceRequired || []).slice(0, 2).map(ev => (
                        <span key={ev} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{ev}</span>
                      ))}
                      {(std.evidenceRequired || []).length > 2 && (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">+{std.evidenceRequired.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={std.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(std)} className="text-slate-400 hover:text-indigo-600"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(std)} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
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
        title={editItem ? `Edit Standard: ${editItem.code}` : 'Add Standard'}
        fields={standardFields}
        initialData={editItem || {}}
        loading={loading}
      />
    </div>
  );
}
