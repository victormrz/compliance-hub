import { useState } from 'react';
import { ClipboardCheck, Plus, Pencil, Wifi, WifiOff } from 'lucide-react';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';
import { useSharePointData } from '../hooks/useSharePointData';
import { formatDate } from '../lib/formatDate';

const mockInspections = [
  { id: 1, name: "Fire Extinguisher Check", frequency: "Monthly", lastDone: "2026-03-01", nextDue: "2026-04-01", status: "Current" },
  { id: 2, name: "Water Temperature Log", frequency: "Weekly", lastDone: "2026-03-10", nextDue: "2026-03-17", status: "Current" },
  { id: 3, name: "Ligature Risk Walkthrough", frequency: "Quarterly", lastDone: "2026-01-15", nextDue: "2026-04-15", status: "Current" },
  { id: 4, name: "Emergency Exit Inspection", frequency: "Monthly", lastDone: "2026-02-15", nextDue: "2026-03-15", status: "Due" },
  { id: 5, name: "Generator Test", frequency: "Monthly", lastDone: "2026-02-01", nextDue: "2026-03-01", status: "Overdue" },
  { id: 6, name: "Smoke Detector Test", frequency: "Quarterly", lastDone: "2025-12-15", nextDue: "2026-03-15", status: "Due" },
];

const inspectionFields = [
  { key: 'name', label: 'Inspection Type', type: 'text', required: true, placeholder: 'e.g., Fire Extinguisher Check' },
  { key: 'frequency', label: 'Frequency', type: 'select', required: true, options: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annual'] },
  { key: 'lastDone', label: 'Last Completed', type: 'date', required: true },
  { key: 'nextDue', label: 'Next Due', type: 'date', required: true },
  { key: 'status', label: 'Status', type: 'select', required: true, options: ['Current', 'Due', 'Overdue'] },
];

export default function EOCInspections() {
  const { data: inspections, loading, isLive, create, update } = useSharePointData('EOCInspections', mockInspections);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const q = search.toLowerCase();
  const filtered = q ? inspections.filter(i => i.name.toLowerCase().includes(q) || i.frequency.toLowerCase().includes(q) || i.status.toLowerCase().includes(q)) : inspections;

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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">EOC Inspections</h1>
            {isLive ? <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium"><Wifi size={10} /> SharePoint</span> : <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium"><WifiOff size={10} /> Offline</span>}
          </div>
          <p className="text-sm text-slate-500 mt-1">Digital inspection logs for ligature risk, water temp, fire extinguishers (TJC/CARF compliant)</p>
        </div>
        <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"><Plus size={16} /> New Inspection</button>
      </div>

      <div className="flex items-center justify-end mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search inspections..." />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><ClipboardCheck size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{filtered.filter(i => i.status === 'Current').length}</p><p className="text-xs text-slate-500">Current</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><ClipboardCheck size={20} className="text-amber-500" /><div><p className="text-2xl font-bold">{filtered.filter(i => i.status === 'Due').length}</p><p className="text-xs text-slate-500">Due Soon</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><ClipboardCheck size={20} className="text-red-500" /><div><p className="text-2xl font-bold">{filtered.filter(i => i.status === 'Overdue').length}</p><p className="text-xs text-slate-500">Overdue</p></div></div></div>
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
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Inspection Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Frequency</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Last Completed</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Next Due</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {filtered.map((insp, i) => (
                <tr key={insp.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-medium text-slate-900">{insp.name}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{insp.frequency}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDate(insp.lastDone)}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDate(insp.nextDue)}</td>
                  <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${insp.status === 'Current' ? 'bg-emerald-100 text-emerald-700' : insp.status === 'Due' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{insp.status}</span></td>
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
