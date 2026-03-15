import { useState } from 'react';
import { ClipboardCheck, Plus, Pencil } from 'lucide-react';
import DataSourceBadge from '../components/DataSourceBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';
import { useSharePointData } from '../hooks/useSharePointData';
import { formatDate } from '../lib/formatDate';

const inspectionFields = [
  { key: 'name', label: 'Inspection Title', type: 'text', required: true, placeholder: 'e.g., Q1 Safety Walkthrough' },
  { key: 'inspectionType', label: 'Type', type: 'select', required: true, options: ['Safety Walkthrough'] },
  { key: 'area', label: 'Area', type: 'text', required: true, placeholder: 'e.g., East Wing, Kitchen' },
  { key: 'facility', label: 'Facility', type: 'text', required: true, placeholder: 'e.g., Main Campus' },
  { key: 'inspectionDate', label: 'Inspection Date', type: 'date', required: true },
  { key: 'inspector', label: 'Inspector', type: 'text', required: true, placeholder: 'e.g., John Smith' },
  { key: 'status', label: 'Status', type: 'select', required: true, options: ['Scheduled', 'Complete', 'Deficiencies Found', 'Corrective Action Needed'] },
  { key: 'findings', label: 'Findings', type: 'textarea', placeholder: 'Describe any findings or deficiencies' },
];

export default function EOCInspections() {
  const { data: inspections, loading, dataSource, lastRefreshed, refresh, create, update } = useSharePointData('EOCInspections', []);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const q = search.toLowerCase();
  const filtered = q ? inspections.filter(i => (i.name || '').toLowerCase().includes(q) || (i.inspectionType || '').toLowerCase().includes(q) || (i.area || '').toLowerCase().includes(q) || (i.facility || '').toLowerCase().includes(q) || (i.inspector || '').toLowerCase().includes(q) || (i.status || '').toLowerCase().includes(q)) : inspections;

  const handleSubmit = async (formData) => {
    if (editItem?.id) await update(editItem.id, formData);
    else await create(formData);
    setModalOpen(false);
    setEditItem(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">EOC Inspections</h1>
          <p className="text-sm text-slate-500 mt-1">Digital inspection logs for ligature risk, water temp, fire extinguishers (TJC/CARF compliant)</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge dataSource={dataSource} lastRefreshed={lastRefreshed} onRefresh={refresh} loading={loading} />
          <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"><Plus size={16} /> New Inspection</button>
        </div>
      </div>

      <div className="flex items-center justify-end mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search inspections..." />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><ClipboardCheck size={20} className="text-indigo-500" /><div><p className="text-2xl font-bold">{filtered.length}</p><p className="text-xs text-slate-500">Total Inspections</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><ClipboardCheck size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{filtered.filter(i => i.status === 'Complete').length}</p><p className="text-xs text-slate-500">Complete</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><ClipboardCheck size={20} className="text-amber-500" /><div><p className="text-2xl font-bold">{filtered.filter(i => i.status === 'Deficiencies Found').length}</p><p className="text-xs text-slate-500">Deficiencies Found</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><ClipboardCheck size={20} className="text-red-500" /><div><p className="text-2xl font-bold">{filtered.filter(i => i.status === 'Corrective Action Needed').length}</p><p className="text-xs text-slate-500">Corrective Action</p></div></div></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ClipboardCheck size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No inspections found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Inspection Title</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Area</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Facility</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Inspector</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {filtered.map((insp, i) => (
                <tr key={insp.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-medium text-slate-900">{insp.name || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{insp.inspectionType || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{insp.area || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{insp.facility || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDate(insp.inspectionDate)}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{insp.inspector || '—'}</td>
                  <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${insp.status === 'Complete' ? 'bg-emerald-100 text-emerald-700' : insp.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : insp.status === 'Deficiencies Found' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{insp.status}</span></td>
                  <td className="px-5 py-4"><button onClick={() => { setEditItem(insp); setModalOpen(true); }} className="text-slate-400 hover:text-indigo-600"><Pencil size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} onSubmit={handleSubmit} title={editItem ? 'Edit Inspection' : 'New Inspection'} fields={inspectionFields} initialData={editItem || {}} loading={loading} />
    </div>
  );
}
