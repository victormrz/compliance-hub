import { useState } from 'react';
import { AlertTriangle, Plus, Pencil } from 'lucide-react';
import DataSourceBadge from '../components/DataSourceBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';
import { useSharePointData } from '../hooks/useSharePointData';
import { formatDate } from '../lib/formatDate';

const ligatureFields = [
  { key: 'location', label: 'Location/Area', type: 'text', required: true, placeholder: 'e.g., Room 101 Bathroom' },
  { key: 'facility', label: 'Facility', type: 'text', required: true, placeholder: 'e.g., Main Campus' },
  { key: 'riskLevel', label: 'Risk Level', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Critical'] },
  { key: 'lastAssessed', label: 'Assessment Date', type: 'date', required: true },
  { key: 'assessedBy', label: 'Assessed By', type: 'text', required: true, placeholder: 'e.g., Safety Officer' },
  { key: 'findings', label: 'Findings', type: 'textarea', placeholder: 'Describe ligature risks found' },
  { key: 'mitigation', label: 'Mitigation', type: 'textarea', placeholder: 'Describe mitigation measures' },
  { key: 'capStatus', label: 'Status', type: 'select', required: true, options: ['Assessed', 'Mitigated', 'Needs Action'] },
];

export default function LigatureRisk() {
  const { data: areas, loading, dataSource, lastRefreshed, refresh, create, update } = useSharePointData('LigatureRisk', []);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const q = search.toLowerCase();
  const filtered = q ? areas.filter(a => (a.location || '').toLowerCase().includes(q) || (a.facility || '').toLowerCase().includes(q) || (a.riskLevel || '').toLowerCase().includes(q) || (a.assessedBy || '').toLowerCase().includes(q) || (a.capStatus || '').toLowerCase().includes(q)) : areas;
  const riskColors = { Critical: 'bg-red-100 text-red-700', High: 'bg-red-100 text-red-700', Medium: 'bg-amber-100 text-amber-700', Low: 'bg-emerald-100 text-emerald-700' };

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
          <h1 className="text-2xl font-bold text-slate-900">Ligature Risk Assessment</h1>
          <p className="text-sm text-slate-500 mt-1">Interactive assessment tool with CAP tracking and due dates</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge dataSource={dataSource} lastRefreshed={lastRefreshed} onRefresh={refresh} loading={loading} />
          <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"><Plus size={16} /> New Assessment</button>
        </div>
      </div>

      <div className="flex items-center justify-end mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search locations..." />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><AlertTriangle size={20} className="text-indigo-500" /><div><p className="text-2xl font-bold">{filtered.length}</p><p className="text-xs text-slate-500">Total Assessments</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><AlertTriangle size={20} className="text-red-500" /><div><p className="text-2xl font-bold">{filtered.filter(a => a.riskLevel === 'High' || a.riskLevel === 'Critical').length}</p><p className="text-xs text-slate-500">High/Critical Risk</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><AlertTriangle size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{filtered.filter(a => a.capStatus === 'Mitigated').length}</p><p className="text-xs text-slate-500">Mitigated</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><AlertTriangle size={20} className="text-amber-500" /><div><p className="text-2xl font-bold">{filtered.filter(a => a.capStatus === 'Needs Action').length}</p><p className="text-xs text-slate-500">Needs Action</p></div></div></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Location</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Facility</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Risk Level</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Assessment Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Assessed By</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {filtered.map((area, i) => (
                <tr key={area.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-medium text-slate-900">{area.location || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{area.facility || '—'}</td>
                  <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${riskColors[area.riskLevel] || ''}`}>{area.riskLevel}</span></td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDate(area.lastAssessed)}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{area.assessedBy || '—'}</td>
                  <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${area.capStatus === 'Mitigated' ? 'bg-emerald-100 text-emerald-700' : area.capStatus === 'Assessed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{area.capStatus}</span></td>
                  <td className="px-5 py-4"><button onClick={() => { setEditItem(area); setModalOpen(true); }} className="text-slate-400 hover:text-indigo-600"><Pencil size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} onSubmit={handleSubmit} title={editItem ? 'Edit Assessment' : 'New Assessment'} fields={ligatureFields} initialData={editItem || {}} loading={loading} />
    </div>
  );
}
