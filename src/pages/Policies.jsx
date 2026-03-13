import { useState } from 'react';
import { Plus, FileText, Pencil, Cloud, ExternalLink, Check, Wifi, WifiOff } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';
import { policies as mockPolicies } from '../data/mockData';
import { useAccreditation } from '../hooks/useAccreditation';
import { useSharePointData } from '../hooks/useSharePointData';

const policyFields = [
  { key: 'policyNumber', label: 'Policy Number', type: 'text', required: true, placeholder: 'e.g., HR-20 or TS-13' },
  { key: 'title', label: 'Policy Title', type: 'text', required: true, placeholder: 'e.g., Admission and Discharge Policy' },
  { key: 'category', label: 'Category', type: 'select', required: true, options: ['Clinical', 'Compliance', 'Safety', 'HR', 'Administrative', 'Financial', 'Technology', 'Rights'] },
  { key: 'version', label: 'Version', type: 'text', required: true, placeholder: 'e.g., 3.1' },
  { key: 'ownerRole', label: 'Responsible Role', type: 'select', required: true, options: ['Executive Director', 'Clinical Director', 'Compliance Officer', 'Safety Officer', 'HR Director', 'Medical Director', 'Nursing Director', 'IT Director', 'QI Coordinator'] },
  { key: 'nextReview', label: 'Next Review Date', type: 'date', required: true },
  { key: 'standardRefs', label: 'Linked Standards', type: 'tags', placeholder: 'PC.01.02.01, RI.01.01.01' },
  { key: 'status', label: 'Status', type: 'select', required: true, options: ['Current', 'Review Due', 'Draft', 'Archived'] },
];

const mockOnedriveFiles = [
  { id: 'od1', name: 'Admission and Discharge Policy.pdf', path: '/Policies/Clinical/', size: '245 KB', modified: '2026-01-15', imported: true },
  { id: 'od2', name: 'Medication Management Policy.pdf', path: '/Policies/Clinical/', size: '189 KB', modified: '2025-12-20', imported: true },
  { id: 'od3', name: 'HIPAA Privacy Policy.pdf', path: '/Policies/Compliance/', size: '312 KB', modified: '2026-02-01', imported: true },
  { id: 'od4', name: 'Emergency Operations Plan.pdf', path: '/Policies/Safety/', size: '567 KB', modified: '2025-08-15', imported: true },
  { id: 'od5', name: 'Incident Reporting Policy.pdf', path: '/Policies/Compliance/', size: '156 KB', modified: '2025-10-01', imported: true },
  { id: 'od6', name: 'Employee Handbook.pdf', path: '/Policies/HR/', size: '1.2 MB', modified: '2025-03-01', imported: true },
  { id: 'od7', name: 'Patient Rights and Grievance Policy.pdf', path: '/Policies/Clinical/', size: '198 KB', modified: '2025-09-15', imported: true },
  { id: 'od8', name: 'Infection Control Policy.pdf', path: '/Policies/Safety/', size: '234 KB', modified: '2025-07-20', imported: true },
  { id: 'od9', name: 'Suicide Prevention Protocol.pdf', path: '/Policies/Clinical/', size: '178 KB', modified: '2026-01-10', imported: false },
  { id: 'od10', name: 'Abuse and Neglect Reporting.pdf', path: '/Policies/Compliance/', size: '145 KB', modified: '2025-11-05', imported: false },
  { id: 'od11', name: 'Telehealth Services Policy.pdf', path: '/Policies/Clinical/', size: '167 KB', modified: '2026-02-28', imported: false },
  { id: 'od12', name: 'MAT Protocol.pdf', path: '/Policies/Clinical/', size: '289 KB', modified: '2026-03-01', imported: false },
];

export default function Policies() {
  const { filterByBody } = useAccreditation();
  const { data: policiesList, loading, isLive, create, update } = useSharePointData('Policies', mockPolicies);
  const [tab, setTab] = useState('policies');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [onedriveFiles] = useState(mockOnedriveFiles);

  const bodyFiltered = filterByBody(policiesList);
  const q = search.toLowerCase();
  const filteredPolicies = q ? bodyFiltered.filter(p =>
    (p.title || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) ||
    (p.ownerRole || p.owner || '').toLowerCase().includes(q) || (p.standardRefs || []).some(r => r.toLowerCase().includes(q))
  ) : bodyFiltered;
  const filteredFiles = q ? onedriveFiles.filter(f =>
    f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)
  ) : onedriveFiles;
  const importedCount = onedriveFiles.filter(f => f.imported).length;
  const pendingCount = onedriveFiles.filter(f => !f.imported).length;

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
            <h1 className="text-2xl font-bold text-slate-900">Policies & Procedures</h1>
            {isLive ? <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium"><Wifi size={10} /> SharePoint</span> : <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium"><WifiOff size={10} /> Offline</span>}
          </div>
          <p className="text-sm text-slate-500 mt-1">Version-controlled policy repository linked to accreditation standards</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-200 hover:bg-slate-50">
            <Cloud size={16} /> Sync OneDrive
          </button>
          <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700">
            <Plus size={16} /> Add Policy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><FileText size={20} className="text-indigo-500" /><div><p className="text-2xl font-bold">{policiesList.length}</p><p className="text-xs text-slate-500">Total Policies</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><FileText size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{policiesList.filter(p => p.status === 'Current').length}</p><p className="text-xs text-slate-500">Current</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><FileText size={20} className="text-amber-500" /><div><p className="text-2xl font-bold">{policiesList.filter(p => p.status === 'Review Due').length}</p><p className="text-xs text-slate-500">Review Due</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><Cloud size={20} className="text-blue-500" /><div><p className="text-2xl font-bold">{importedCount}</p><p className="text-xs text-slate-500">Imported</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><Cloud size={20} className="text-amber-500" /><div><p className="text-2xl font-bold">{pendingCount}</p><p className="text-xs text-slate-500">Pending Import</p></div></div></div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          <button onClick={() => setTab('policies')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'policies' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            Policy Register ({filteredPolicies.length})
          </button>
          <button onClick={() => setTab('onedrive')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'onedrive' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            OneDrive Files ({filteredFiles.length})
          </button>
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search policies..." />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : tab === 'policies' ? (
        filteredPolicies.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No policies found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Policy #</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Policy</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Version</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Owner</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Next Review</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Standards</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-5 py-3"></th>
              </tr></thead>
              <tbody>
                {filteredPolicies.map((p, i) => (
                  <tr key={p.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm font-mono text-slate-600">{p.policyNumber || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center"><FileText size={14} className="text-indigo-500" /></div>
                        <p className="text-sm font-medium text-slate-900">{p.title}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{p.category}</span></td>
                    <td className="px-5 py-4 text-sm text-slate-600 font-mono">v{p.version}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">{(p.ownerRole || p.owner || '').split(' ').map(n=>n[0]).join('')}</div>
                        <span className="text-sm text-slate-600">{p.ownerRole || p.owner}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{p.nextReview}</td>
                    <td className="px-5 py-4"><div className="flex flex-wrap gap-1">{(p.standardRefs || []).map(ref => <span key={ref} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-mono">{ref}</span>)}</div></td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-4"><button onClick={() => { setEditItem(p); setModalOpen(true); }} className="text-slate-400 hover:text-indigo-600"><Pencil size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
            <Cloud size={16} className="text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">Connected to OneDrive: /Roaring Brook Recovery/Policies/</span>
          </div>
          <table className="w-full">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">File Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Folder</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Size</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Last Modified</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Import Status</th>
              <th className="px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {filteredFiles.map(file => (
                <tr key={file.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${file.imported ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                        <FileText size={14} className={file.imported ? 'text-emerald-500' : 'text-slate-400'} />
                      </div>
                      <p className="text-sm font-medium text-slate-900">{file.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500 font-mono">{file.path}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{file.size}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{file.modified}</td>
                  <td className="px-5 py-4">
                    {file.imported ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-medium"><Check size={12} /> Imported</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Pending Review</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {file.imported ? (
                      <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1"><ExternalLink size={12} /> Open</button>
                    ) : (
                      <button className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-indigo-700">Import</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} onSubmit={handleSubmit} title={editItem ? 'Edit Policy' : 'Add Policy'} fields={policyFields} initialData={editItem || {}} loading={loading} />
    </div>
  );
}
