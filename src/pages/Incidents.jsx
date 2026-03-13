import { useState } from 'react';
import { Plus, AlertCircle, Pencil, Wifi, WifiOff } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';
import { incidents as mockIncidents } from '../data/mockData';
import { useAccreditation } from '../hooks/useAccreditation';
import { useSharePointData } from '../hooks/useSharePointData';

const incidentFields = [
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'type', label: 'Incident Type', type: 'select', required: true, options: ['Fall', 'Medication Error', 'Behavioral', 'Elopement', 'Property Damage', 'AMA Discharge', 'Other'] },
  { key: 'facility', label: 'Facility', type: 'text', required: true, placeholder: 'Main Campus' },
  { key: 'severity', label: 'Severity', type: 'select', required: true, options: ['Critical', 'High', 'Medium', 'Low'] },
  { key: 'reportedBy', label: 'Reported By', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the incident...' },
  { key: 'investigationStatus', label: 'Investigation Status', type: 'select', options: ['Under Review', 'RCA In Progress', 'CAP Submitted', 'Resolved', 'Closed'] },
  { key: 'standardRef', label: 'Related Standard', type: 'text', placeholder: 'e.g., PC.01.02.01' },
];

export default function Incidents() {
  const { filterByBody } = useAccreditation();
  const { data: incidents, loading, isLive, create, update } = useSharePointData('Incidents', mockIncidents);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const bodyFiltered = filterByBody(incidents);
  const q = search.toLowerCase();
  const filteredIncidents = q ? bodyFiltered.filter(i =>
    (i.type || '').toLowerCase().includes(q) || (i.facility || '').toLowerCase().includes(q) ||
    (i.reportedBy || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q) ||
    (i.standardRef || '').toLowerCase().includes(q) || (i.severity || '').toLowerCase().includes(q)
  ) : bodyFiltered;

  const handleSubmit = async (formData) => {
    if (editItem?.id) {
      await update(editItem.id, formData);
    } else {
      await create(formData);
    }
    setModalOpen(false);
    setEditItem(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Incident Reporting</h1>
            {isLive ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium"><Wifi size={10} /> SharePoint</span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium"><WifiOff size={10} /> Offline</span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">Unusual occurrence workflow with automatic QA notification</p>
        </div>
        <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"><Plus size={16} /> Report Incident</button>
      </div>

      <div className="flex items-center justify-end mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search incidents..." />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><AlertCircle size={20} className="text-indigo-500" /><div><p className="text-2xl font-bold">{filteredIncidents.length}</p><p className="text-xs text-slate-500">Total Incidents</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><AlertCircle size={20} className="text-red-500" /><div><p className="text-2xl font-bold">{filteredIncidents.filter(i => i.severity === 'Critical').length}</p><p className="text-xs text-slate-500">Critical</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><AlertCircle size={20} className="text-blue-500" /><div><p className="text-2xl font-bold">{filteredIncidents.filter(i => ['Under Review', 'RCA In Progress'].includes(i.investigationStatus)).length}</p><p className="text-xs text-slate-500">Under Investigation</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><AlertCircle size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{filteredIncidents.filter(i => ['Resolved', 'Closed'].includes(i.investigationStatus)).length}</p><p className="text-xs text-slate-500">Resolved</p></div></div></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : filteredIncidents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No incidents found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Facility</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Severity</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Reported By</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Standard</th>
              <th className="px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {filteredIncidents.map(inc => (
                <tr key={inc.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm text-slate-600">{inc.date}</td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-900">{inc.type}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{inc.facility}</td>
                  <td className="px-5 py-4"><StatusBadge status={inc.severity} /></td>
                  <td className="px-5 py-4 text-sm text-slate-600">{inc.reportedBy}</td>
                  <td className="px-5 py-4"><StatusBadge status={inc.investigationStatus} /></td>
                  <td className="px-5 py-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-mono">{inc.standardRef}</span></td>
                  <td className="px-5 py-4">
                    <button onClick={() => { setEditItem(inc); setModalOpen(true); }} className="text-slate-400 hover:text-indigo-600"><Pencil size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSubmit={handleSubmit}
        title={editItem ? `Edit Incident` : 'Report Incident'}
        fields={incidentFields}
        initialData={editItem || {}}
        loading={loading}
      />
    </div>
  );
}
