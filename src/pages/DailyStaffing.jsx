import { useState } from 'react';
import { Calendar, Plus, AlertTriangle, CheckCircle2, Pencil } from 'lucide-react';
import DataSourceBadge from '../components/DataSourceBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';
import { useSharePointData } from '../hooks/useSharePointData';
import { formatDate } from '../lib/formatDate';

const staffingFields = [
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'shift', label: 'Shift', type: 'select', required: true, options: ['Day (7a-3p)', 'Evening (3p-11p)', 'Night (11p-7a)'] },
  { key: 'clients', label: 'Client Census', type: 'number', required: true },
  { key: 'clinical', label: 'Clinical Staff', type: 'number', required: true },
  { key: 'nursing', label: 'Nursing Staff', type: 'number', required: true },
  { key: 'peers', label: 'Peer Support Staff', type: 'number', required: true },
];

export default function DailyStaffing() {
  const { data: shifts, loading, dataSource, lastRefreshed, refresh, create, update } = useSharePointData('DailyStaffing', []);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const q = search.toLowerCase();
  const filtered = q ? shifts.filter(s => (s.shift || '').toLowerCase().includes(q) || (s.date || '').includes(q)) : shifts;

  const handleSubmit = async (formData) => {
    const clients = Number(formData.clients) || 0;
    const totalStaff = (Number(formData.clinical) || 0) + (Number(formData.nursing) || 0) + (Number(formData.peers) || 0);
    const ratioVal = totalStaff > 0 ? (clients / totalStaff).toFixed(1) : 0;
    const processed = {
      ...formData,
      clients,
      clinical: Number(formData.clinical) || 0,
      nursing: Number(formData.nursing) || 0,
      peers: Number(formData.peers) || 0,
      ratio: `1:${ratioVal}`,
      required: '1:8',
      compliant: totalStaff > 0 ? (clients / totalStaff) <= 8 : false,
    };
    if (editItem?.id) await update(editItem.id, processed);
    else await create(processed);
    setModalOpen(false);
    setEditItem(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily Staffing</h1>
          <p className="text-sm text-slate-500 mt-1">Clinician-to-patient ratios with automatic alerts when state-mandated limits are exceeded</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge dataSource={dataSource} lastRefreshed={lastRefreshed} onRefresh={refresh} loading={loading} />
          <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"><Plus size={16} /> Log Staffing</button>
        </div>
      </div>

      <div className="flex items-center justify-end mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search shifts..." />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><Calendar size={20} className="text-indigo-500" /><div><p className="text-2xl font-bold">{filtered.length}</p><p className="text-xs text-slate-500">Shifts Logged</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><CheckCircle2 size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{filtered.filter(s => s.compliant).length}</p><p className="text-xs text-slate-500">Compliant</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><AlertTriangle size={20} className="text-red-500" /><div><p className="text-2xl font-bold">{filtered.filter(s => !s.compliant).length}</p><p className="text-xs text-slate-500">Non-Compliant</p></div></div></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Calendar size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No shifts logged</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Shift</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Clients</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Clinical</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Nursing</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Peers</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Ratio</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Required</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id || i} className={`border-b border-slate-100 hover:bg-slate-50 ${!s.compliant ? 'bg-red-50/50' : ''}`}>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDate(s.date)}</td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-900">{s.shift}</td>
                  <td className="px-5 py-4 text-sm text-center text-slate-600">{s.clients}</td>
                  <td className="px-5 py-4 text-sm text-center text-slate-600">{s.clinical}</td>
                  <td className="px-5 py-4 text-sm text-center text-slate-600">{s.nursing}</td>
                  <td className="px-5 py-4 text-sm text-center text-slate-600">{s.peers}</td>
                  <td className="px-5 py-4 text-sm text-center font-mono font-bold">{s.ratio}</td>
                  <td className="px-5 py-4 text-sm text-center text-slate-500 font-mono">{s.required}</td>
                  <td className="px-5 py-4 text-center">{s.compliant ? <CheckCircle2 size={18} className="text-emerald-500 inline" /> : <AlertTriangle size={18} className="text-red-500 inline" />}</td>
                  <td className="px-5 py-4"><button onClick={() => { setEditItem(s); setModalOpen(true); }} className="text-slate-400 hover:text-indigo-600"><Pencil size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} onSubmit={handleSubmit} title={editItem ? 'Edit Staffing Log' : 'Log Staffing'} fields={staffingFields} initialData={editItem || {}} loading={loading} />
    </div>
  );
}
