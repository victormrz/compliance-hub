import { useState } from 'react';
import { FileKey, Plus, Pencil, Wifi, WifiOff } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';
import { licenses as mockLicenses } from '../data/mockData';
import { useSharePointData } from '../hooks/useSharePointData';
import { formatDate, daysUntil } from '../lib/formatDate';

const licenseFields = [
  { key: 'name', label: 'License Name', type: 'text', required: true, placeholder: 'e.g., AODE License' },
  { key: 'facility', label: 'Facility', type: 'text', required: true, placeholder: 'e.g., Main Campus' },
  { key: 'type', label: 'License Type', type: 'select', required: true, options: ['State License', 'AODE', 'BHSO', 'CLIA', 'DEA', 'COI', 'Fire Marshal', 'Food Service', 'Safety Permit', 'Health Permit', 'Business License', 'Accreditation'] },
  { key: 'issueDate', label: 'Issue Date', type: 'date', required: true },
  { key: 'expirationDate', label: 'Expiration Date', type: 'date', required: true },
  { key: 'status', label: 'Status', type: 'select', required: true, options: ['Active', 'Pending', 'Critical', 'Expired'] },
];

export default function Licenses() {
  const { data: rawLicenses, loading, isLive, create, update } = useSharePointData('Licenses', mockLicenses);

  // Normalize and compute daysLeft/status
  const licensesList = rawLicenses.map(l => {
    const name = l.name || l.title || '';
    const type = l.type || l.licenseType || '';
    const facility = l.facility || '';
    const issueDate = l.issueDate || null;
    const expirationDate = l.expirationDate || null;
    const left = daysUntil(expirationDate);
    let status = l.status || 'Active';
    if (left !== null) {
      if (left < 0) status = 'Expired';
      else if (left <= 90) status = 'Critical';
    }
    return { ...l, name, type, facility, issueDate, expirationDate, daysLeft: left, status };
  });

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const q = search.toLowerCase();
  const filtered = q ? licensesList.filter(l =>
    (l.name || '').toLowerCase().includes(q) || (l.facility || '').toLowerCase().includes(q) || (l.type || '').toLowerCase().includes(q)
  ) : licensesList;

  const handleSubmit = async (formData) => {
    // Calculate days left
    const exp = new Date(formData.expirationDate);
    const now = new Date();
    const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    const processed = { ...formData, daysLeft };
    if (editItem?.id) await update(editItem.id, processed);
    else await create(processed);
    setModalOpen(false);
    setEditItem(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Licenses & Permits</h1>
            {isLive ? <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium"><Wifi size={10} /> SharePoint</span> : <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium"><WifiOff size={10} /> Offline</span>}
          </div>
          <p className="text-sm text-slate-500 mt-1">Track AODE, Fire Marshal, Food Service permits with 90/60/30-day expiration alerts</p>
        </div>
        <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"><Plus size={16} /> Add License</button>
      </div>

      <div className="flex items-center justify-end mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search licenses..." />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><FileKey size={20} className="text-indigo-500" /><div><p className="text-2xl font-bold">{filtered.length}</p><p className="text-xs text-slate-500">Total Licenses</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><FileKey size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{filtered.filter(l => l.status === 'Active').length}</p><p className="text-xs text-slate-500">Active</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><FileKey size={20} className="text-red-500" /><div><p className="text-2xl font-bold">{filtered.filter(l => l.status === 'Expired').length}</p><p className="text-xs text-slate-500">Expired</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><FileKey size={20} className="text-amber-500" /><div><p className="text-2xl font-bold">{filtered.filter(l => l.status === 'Critical').length}</p><p className="text-xs text-slate-500">Critical</p></div></div></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileKey size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No licenses found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">License</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Facility</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Issued</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Expires</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Days Left</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {[...filtered].sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0)).map((l, i) => (
                <tr key={l.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-medium text-slate-900">{l.name}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{l.facility}</td>
                  <td className="px-5 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{l.type}</span></td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDate(l.issueDate)}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDate(l.expirationDate)}</td>
                  <td className="px-5 py-4 text-sm font-mono">{l.daysLeft < 0 ? <span className="text-red-600">{l.daysLeft}</span> : <span className={l.daysLeft <= 30 ? 'text-red-600' : l.daysLeft <= 90 ? 'text-amber-600' : 'text-slate-600'}>{l.daysLeft}</span>}</td>
                  <td className="px-5 py-4"><StatusBadge status={l.status} /></td>
                  <td className="px-5 py-4"><button onClick={() => { setEditItem(l); setModalOpen(true); }} className="text-slate-400 hover:text-indigo-600"><Pencil size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} onSubmit={handleSubmit} title={editItem ? 'Edit License' : 'Add License'} fields={licenseFields} initialData={editItem || {}} loading={loading} />
    </div>
  );
}
