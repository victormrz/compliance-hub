import { useState } from 'react';
import { Users, Plus, Pencil, CheckCircle2, XCircle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import DataSourceBadge from '../components/DataSourceBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';

import { useSharePointData } from '../hooks/useSharePointData';
import { formatDate } from '../lib/formatDate';

const personnelFields = [
  { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g., Sarah Johnson' },
  { key: 'title', label: 'Job Title', type: 'text', required: true, placeholder: 'e.g., Clinical Director' },
  { key: 'department', label: 'Department', type: 'select', required: true, options: ['Management', 'Clinical', 'Nursing', 'Operations', 'Compliance', 'Peer Support', 'Administrative'] },
  { key: 'phone', label: 'Phone', type: 'text', placeholder: '(555) 123-4567' },
  { key: 'hireDate', label: 'Hire Date', type: 'date', required: true },
  { key: 'supervisor', label: 'Supervisor', type: 'text', placeholder: 'e.g., Dr. Michael Chen' },
  { key: 'status', label: 'Status', type: 'select', required: true, options: ['Active', 'On Leave', 'Terminated'] },
  { key: 'credentialsComplete', label: 'Credentials Complete', type: 'select', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
  { key: 'trainingComplete', label: 'Training Complete', type: 'select', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
];

export default function Personnel() {
  const { data: staffList, loading, dataSource, lastRefreshed, refresh, create, update } = useSharePointData('Personnel', []);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const q = search.toLowerCase();
  const filteredStaff = q ? staffList.filter(s =>
    (s.name || s.title || '').toLowerCase().includes(q) || (s.jobTitle || '').toLowerCase().includes(q) ||
    (s.department || '').toLowerCase().includes(q) || (s.supervisor || '').toLowerCase().includes(q)
  ) : staffList;

  const handleSubmit = async (formData) => {
    const processed = {
      ...formData,
      credentialsComplete: formData.credentialsComplete === 'true' || formData.credentialsComplete === true,
      trainingComplete: formData.trainingComplete === 'true' || formData.trainingComplete === true,
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
          <h1 className="text-2xl font-bold text-slate-900">Personnel & HR</h1>
          <p className="text-sm text-slate-500 mt-1">Staff credentials, OIG exclusion checks, background checks, TB test tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge dataSource={dataSource} lastRefreshed={lastRefreshed} onRefresh={refresh} loading={loading} />
          <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"><Plus size={16} /> Add Employee</button>
        </div>
      </div>

      <div className="flex items-center justify-end mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search staff..." />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><Users size={20} className="text-indigo-500" /><div><p className="text-2xl font-bold">{filteredStaff.length}</p><p className="text-xs text-slate-500">Total Staff</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><Users size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{filteredStaff.filter(s => s.status === 'Active').length}</p><p className="text-xs text-slate-500">Active</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><CheckCircle2 size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{filteredStaff.filter(s => s.credentialsComplete).length}</p><p className="text-xs text-slate-500">Credentials OK</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><CheckCircle2 size={20} className="text-blue-500" /><div><p className="text-2xl font-bold">{filteredStaff.filter(s => s.trainingComplete).length}</p><p className="text-xs text-slate-500">Training OK</p></div></div></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No staff found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Employee</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Department</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Hire Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Supervisor</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Credentials</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Training</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {filteredStaff.map((s, i) => (
                <tr key={s.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{(s.name || s.title || '').split(' ').map(n => n[0]).join('')}</div>
                      <div><p className="text-sm font-medium text-slate-900">{s.name || s.title}</p><p className="text-xs text-slate-500">{s.phone}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{s.jobTitle || '—'}</td>
                  <td className="px-5 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{s.department}</span></td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDate(s.hireDate)}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{s.supervisor || '—'}</td>
                  <td className="px-5 py-4 text-center">{s.credentialsComplete ? <CheckCircle2 size={18} className="text-emerald-500 inline" /> : <XCircle size={18} className="text-red-500 inline" />}</td>
                  <td className="px-5 py-4 text-center">{s.trainingComplete ? <CheckCircle2 size={18} className="text-emerald-500 inline" /> : <XCircle size={18} className="text-red-500 inline" />}</td>
                  <td className="px-5 py-4"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-4"><button onClick={() => { setEditItem(s); setModalOpen(true); }} className="text-slate-400 hover:text-indigo-600"><Pencil size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} onSubmit={handleSubmit} title={editItem ? 'Edit Employee' : 'Add Employee'} fields={personnelFields} initialData={editItem ? { ...editItem, name: editItem.name || editItem.title || '', title: editItem.jobTitle || '', credentialsComplete: String(editItem.credentialsComplete), trainingComplete: String(editItem.trainingComplete) } : {}} loading={loading} />
    </div>
  );
}
