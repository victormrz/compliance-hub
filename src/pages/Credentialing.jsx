import { useState } from 'react';
import { Shield, Plus, Pencil, Lock } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import DataSourceBadge from '../components/DataSourceBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';

import { useSharePointData } from '../hooks/useSharePointData';
import { useAuth } from '../hooks/useAuth';
import { canAccessCredentialing } from '../lib/roles';
import { formatDate, daysUntil } from '../lib/formatDate';

const credentialFields = [
  { key: 'employee', label: 'Employee', type: 'text', required: true, placeholder: 'e.g., Dr. Michael Chen' },
  { key: 'type', label: 'Credential Type', type: 'select', required: true, options: ['LPCC', 'LCSW', 'LCADC', 'LPCA', 'APRN', 'CSW', 'CADC', 'TCM', 'RN', 'LPN', 'MD/DO', 'DEA', 'NPI', 'Board Cert', 'Peer Support', 'CPR/BLS', 'CAQH', 'Medicare', 'Medicaid', 'COI', 'CLIA', 'EIN'] },
  { key: 'issuingBody', label: 'Issuing Body', type: 'text', required: true, placeholder: 'e.g., KY Board of Medical Licensure' },
  { key: 'number', label: 'Credential Number', type: 'text', required: true, placeholder: 'e.g., KY-12345' },
  { key: 'expirationDate', label: 'Expiration Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', required: true, options: ['Active', 'Pending', 'Expired', 'Revoked'] },
];

export default function Credentialing() {
  const { user } = useAuth();
  const authorized = canAccessCredentialing(user?.email);
  const { data: rawCredentials, loading, dataSource, lastRefreshed, refresh, create, update } = useSharePointData('Credentials', []);

  // Compute daysLeft and dynamic status
  const credentialsList = rawCredentials.map(c => {
    const exp = c.expirationDate || null;
    const left = daysUntil(exp);
    let status = c.status || 'Active';
    if (left !== null) {
      if (left < 0) status = 'Expired';
      else if (left <= 90) status = 'Critical';
    }
    return { ...c, expirationDate: exp, daysLeft: left, status };
  });

  const [filter, setFilter] = useState('All Credentials');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const tabs = ['All Credentials', 'Expiring Soon', 'Expired'];

  const tabFiltered = filter === 'All Credentials' ? credentialsList
    : filter === 'Expired' ? credentialsList.filter(c => c.status === 'Expired')
    : credentialsList.filter(c => c.daysLeft !== null && c.daysLeft > 0 && c.daysLeft <= 180);
  const q = search.toLowerCase();
  const filtered = q ? tabFiltered.filter(c =>
    (c.employee || '').toLowerCase().includes(q) || (c.type || '').toLowerCase().includes(q) ||
    (c.issuingBody || '').toLowerCase().includes(q) || (c.number || '').toLowerCase().includes(q)
  ) : tabFiltered;

  const totalProviders = new Set(credentialsList.map(c => c.employee)).size;
  const expiredCount = credentialsList.filter(c => c.status === 'Expired').length;
  const expiringSoon = credentialsList.filter(c => c.daysLeft !== null && c.daysLeft > 0 && c.daysLeft <= 180).length;

  const handleSubmit = async (formData) => {
    if (editItem?.id) await update(editItem.id, formData);
    else await create(formData);
    setModalOpen(false);
    setEditItem(null);
  };

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Lock size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-500 text-center max-w-md">
          The Credentialing page contains protected personal information and is restricted to authorized personnel only. Contact your administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Provider Credentialing</h1>
          <p className="text-sm text-slate-500 mt-1">CAQH, NPI, Medicare/Medicaid enrollment tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge dataSource={dataSource} lastRefreshed={lastRefreshed} onRefresh={refresh} loading={loading} />
          <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700">
            <Plus size={16} /> Add Credential
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><Shield size={20} className="text-indigo-500" /><div><p className="text-2xl font-bold">{totalProviders}</p><p className="text-xs text-slate-500">Total Providers</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><Shield size={20} className="text-amber-500" /><div><p className="text-2xl font-bold">{expiringSoon}</p><p className="text-xs text-slate-500">Expiring (6mo)</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><Shield size={20} className="text-red-500" /><div><p className="text-2xl font-bold">{expiredCount}</p><p className="text-xs text-slate-500">Expired</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><Shield size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{credentialsList.filter(c => c.status === 'Active').length}</p><p className="text-xs text-slate-500">Active</p></div></div></div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === t ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>{t}</button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search credentials..." />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Shield size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No credentials found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Employee</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Credential Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Issuing Body</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Number</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Expiration</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {filtered.map((cred, i) => (
                <tr key={cred.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-medium text-slate-900">{cred.employee}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{cred.type}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{cred.issuingBody}</td>
                  <td className="px-5 py-4 text-sm text-slate-600 font-mono">{cred.number}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatDate(cred.expirationDate)}
                    {cred.daysLeft !== null && cred.daysLeft !== undefined && <span className="text-xs text-slate-400 ml-1">({cred.daysLeft}d)</span>}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={cred.status} /></td>
                  <td className="px-5 py-4"><button onClick={() => { setEditItem(cred); setModalOpen(true); }} className="text-slate-400 hover:text-indigo-600"><Pencil size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} onSubmit={handleSubmit} title={editItem ? 'Edit Credential' : 'Add Credential'} fields={credentialFields} initialData={editItem || {}} loading={loading} />
    </div>
  );
}
