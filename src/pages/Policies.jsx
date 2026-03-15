import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, FileText, Pencil, Cloud, ExternalLink, Check, Upload, History, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';

import { useAccreditation } from '../hooks/useAccreditation';
import { useSharePointData } from '../hooks/useSharePointData';
import DataSourceBadge from '../components/DataSourceBadge';
import { useAuth } from '../hooks/useAuth';
import * as graphService from '../lib/graphService';
import { logAuditEvent } from '../lib/auditService';
import { formatDate } from '../lib/formatDate';

const policyFields = [
  { key: 'policyNumber', label: 'Policy Number', type: 'text', required: true, placeholder: 'e.g., HR-20 or TS-13' },
  { key: 'title', label: 'Policy Title', type: 'text', required: true, placeholder: 'e.g., Admission and Discharge Policy' },
  { key: 'series', label: 'Policy Series', type: 'select', required: true, options: ['HR', 'TS'] },
  { key: 'category', label: 'Category', type: 'select', required: true, options: ['Clinical', 'Compliance', 'Safety', 'HR', 'Administrative', 'Financial', 'Technology', 'Rights'] },
  { key: 'version', label: 'Version', type: 'text', required: true, placeholder: 'e.g., 3.1' },
  { key: 'ownerRole', label: 'Responsible Role', type: 'select', required: true, options: ['Executive Director', 'Clinical Director', 'Compliance Officer', 'Safety Officer', 'HR Director', 'Medical Director', 'Nursing Director', 'IT Director', 'QI Coordinator'] },
  { key: 'nextReview', label: 'Next Review Date', type: 'date', required: true },
  { key: 'standardRefs', label: 'Linked Standards', type: 'tags', placeholder: 'PC.01.02.01, RI.01.01.01' },
  { key: 'status', label: 'Status', type: 'select', required: true, options: ['Current', 'Review Due', 'Draft', 'Archived'] },
];

// Extract policy number from filename (e.g., "HR-05 Infection Prevention.docx" → "HR-05")
function extractPolicyNumber(filename) {
  const match = filename.match(/^(HR-\d+|TS-\d+(?:\.\d+)?)/i);
  return match ? match[1].toUpperCase() : null;
}

// Format file size for display
function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Format date for display (SharePoint file metadata — uses short month format)
function formatFileDate(isoDate) {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Policies() {
  const { filterByBody } = useAccreditation();
  const { isAuthenticated, user } = useAuth();
  const { data: policiesList, loading, isLive, dataSource, lastRefreshed, refresh, create, update } = useSharePointData('Policies', []);
  const [tab, setTab] = useState('policies');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Document library state
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState(null);
  const [expandedFileId, setExpandedFileId] = useState(null);
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const uploadInputRef = useRef(null);
  const versionUploadRef = useRef(null);
  const [versionUploadFileId, setVersionUploadFileId] = useState(null);

  // Fetch files from SharePoint document library
  const fetchFiles = useCallback(async () => {
    if (!isAuthenticated) return;
    setFilesLoading(true);
    setFilesError(null);
    try {
      const result = await graphService.getPolicyDocuments('Policies');
      setFiles(result.filter(f => f.file)); // Only files, not folders
    } catch (err) {
      console.error('Failed to fetch policy documents:', err);
      setFilesError(err.message);
    } finally {
      setFilesLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch files on mount (needed for policy-to-document linking on Policy Register tab)
  useEffect(() => {
    if (isAuthenticated && files.length === 0) {
      fetchFiles();
    }
  }, [isAuthenticated, files.length, fetchFiles]);

  // Fetch version history for a file
  const handleToggleVersions = async (fileId) => {
    if (expandedFileId === fileId) {
      setExpandedFileId(null);
      setVersions([]);
      return;
    }
    setExpandedFileId(fileId);
    setVersionsLoading(true);
    try {
      const result = await graphService.getFileVersions(fileId);
      setVersions(result);
    } catch (err) {
      console.error('Failed to fetch versions:', err);
      setVersions([]);
    } finally {
      setVersionsLoading(false);
    }
  };

  // Upload a new document
  const handleUploadNew = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      await graphService.uploadFile('Policies', file.name, buffer);
      logAuditEvent({
        action: 'Create',
        entity: 'PolicyDocuments',
        recordId: file.name,
        recordName: file.name,
        user,
        changes: { fileName: file.name, fileSize: formatFileSize(file.size) },
        isLive,
      });
      await fetchFiles();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed: ' + (err.message || err));
    }
    e.target.value = '';
  };

  // Upload a new version of an existing file
  const handleUploadVersion = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !versionUploadFileId) return;
    const targetFile = files.find(f => f.id === versionUploadFileId);
    try {
      const buffer = await file.arrayBuffer();
      await graphService.uploadNewVersion(versionUploadFileId, buffer);
      logAuditEvent({
        action: 'Update',
        entity: 'PolicyDocuments',
        recordId: versionUploadFileId,
        recordName: targetFile?.name || file.name,
        user,
        changes: { newVersion: file.name, fileSize: formatFileSize(file.size) },
        isLive,
      });
      await fetchFiles();
      if (expandedFileId === versionUploadFileId) {
        const result = await graphService.getFileVersions(versionUploadFileId);
        setVersions(result);
      }
    } catch (err) {
      console.error('Version upload failed:', err);
      alert('Upload failed: ' + (err.message || err));
    }
    e.target.value = '';
    setVersionUploadFileId(null);
  };

  // Build a map of policy number → file for linking Policy Register to documents
  const policyFileMap = {};
  files.forEach(f => {
    const num = extractPolicyNumber(f.name);
    if (num) policyFileMap[num] = f;
  });

  const bodyFiltered = filterByBody(policiesList);
  const q = search.toLowerCase();
  const filteredPolicies = q ? bodyFiltered.filter(p =>
    (p.title || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) ||
    (p.ownerRole || p.owner || '').toLowerCase().includes(q) || (p.standardRefs || []).some(r => r.toLowerCase().includes(q))
  ) : bodyFiltered;
  const filteredFiles = q ? files.filter(f =>
    f.name.toLowerCase().includes(q)
  ) : files;

  const handleSubmit = async (formData) => {
    if (editItem?.id) {
      // Auto-increment version on edit (e.g., "1.0" → "1.1", "2.3" → "2.4")
      const oldVersion = editItem.version || '1.0';
      const parts = oldVersion.split('.');
      const major = parseInt(parts[0]) || 1;
      const minor = (parseInt(parts[1]) || 0) + 1;
      formData.version = `${major}.${minor}`;
      await update(editItem.id, formData);
    } else {
      formData.version = formData.version || '1.0';
      await create(formData);
    }
    setModalOpen(false);
    setEditItem(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Policies & Procedures</h1>
          <p className="text-sm text-slate-500 mt-1">Version-controlled policy repository linked to accreditation standards</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge dataSource={dataSource} lastRefreshed={lastRefreshed} onRefresh={refresh} loading={loading} />
          <div className="flex gap-2">
            {tab === 'onedrive' && isAuthenticated && (
              <>
                <input ref={uploadInputRef} type="file" accept=".docx,.pdf,.pptx" className="hidden" onChange={handleUploadNew} />
                <button onClick={() => uploadInputRef.current?.click()} className="bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-200 hover:bg-slate-50">
                  <Upload size={16} /> Upload Document
                </button>
              </>
            )}
            <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700">
              <Plus size={16} /> Add Policy
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><FileText size={20} className="text-indigo-500" /><div><p className="text-2xl font-bold">{policiesList.length}</p><p className="text-xs text-slate-500">Total Policies</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><FileText size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{policiesList.filter(p => p.status === 'Current').length}</p><p className="text-xs text-slate-500">Current</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><FileText size={20} className="text-amber-500" /><div><p className="text-2xl font-bold">{policiesList.filter(p => p.status === 'Review Due').length}</p><p className="text-xs text-slate-500">Review Due</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><Cloud size={20} className="text-blue-500" /><div><p className="text-2xl font-bold">{files.length}</p><p className="text-xs text-slate-500">Documents in SharePoint</p></div></div></div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          <button onClick={() => setTab('policies')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'policies' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            Policy Register ({filteredPolicies.length})
          </button>
          <button onClick={() => setTab('onedrive')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'onedrive' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            Documents ({isAuthenticated ? filteredFiles.length : '—'})
          </button>
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search policies..." />
      </div>

      {/* Hidden file input for version uploads */}
      <input ref={versionUploadRef} type="file" accept=".docx,.pdf,.pptx" className="hidden" onChange={handleUploadVersion} />

      {loading && tab === 'policies' ? (
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
                {filteredPolicies.map((p, i) => {
                  const linkedFile = policyFileMap[p.policyNumber];
                  return (
                    <tr key={p.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-mono text-slate-600">{p.policyNumber || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {linkedFile ? (
                            <a href={linkedFile.webUrl} target="_blank" rel="noopener noreferrer" title="Open policy document in SharePoint" className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center hover:bg-indigo-200 transition-colors cursor-pointer">
                              <FileText size={14} className="text-indigo-600" />
                            </a>
                          ) : (
                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center" title="No document uploaded">
                              <FileText size={14} className="text-slate-300" />
                            </div>
                          )}
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
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(p.nextReview)}</td>
                      <td className="px-5 py-4"><div className="flex flex-wrap gap-1">{(p.standardRefs || []).map(ref => <span key={ref} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-mono">{ref}</span>)}</div></td>
                      <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-4">
                        <button onClick={() => { setEditItem(p); setModalOpen(true); }} className="text-slate-400 hover:text-indigo-600"><Pencil size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Documents Tab */
        !isAuthenticated ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Cloud size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Sign in to view policy documents from SharePoint</p>
          </div>
        ) : filesLoading ? (
          <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
        ) : filesError ? (
          <div className="bg-white rounded-xl border border-red-200 p-12 text-center">
            <AlertCircle size={40} className="text-red-300 mx-auto mb-3" />
            <p className="text-sm text-red-600">{filesError}</p>
            <button onClick={fetchFiles} className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium">Retry</button>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">{search ? 'No documents match your search' : 'No documents in SharePoint yet. Upload policy documents to get started.'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud size={16} className="text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">SharePoint Document Library — /Policies/</span>
              </div>
              <button onClick={fetchFiles} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Refresh</button>
            </div>
            <table className="w-full">
              <thead><tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-8 px-2 py-3"></th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Document</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Policy #</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Size</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Last Modified</th>
                <th className="px-5 py-3"></th>
              </tr></thead>
              <tbody>
                {filteredFiles.map(file => {
                  const policyNum = extractPolicyNumber(file.name);
                  const isExpanded = expandedFileId === file.id;
                  return (
                    <tr key={file.id} className="border-b border-slate-100">
                      <td colSpan={6} className="p-0">
                        {/* File row */}
                        <div className="flex items-center hover:bg-slate-50">
                          <div className="w-8 px-2 py-4 flex items-center justify-center">
                            <button onClick={() => handleToggleVersions(file.id)} className="text-slate-400 hover:text-slate-600">
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          </div>
                          <div className="flex-1 px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <FileText size={14} className="text-blue-500" />
                              </div>
                              <p className="text-sm font-medium text-slate-900">{file.name}</p>
                            </div>
                          </div>
                          <div className="px-5 py-4 w-24">
                            {policyNum ? (
                              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-mono">{policyNum}</span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </div>
                          <div className="px-5 py-4 w-24 text-sm text-slate-600">{formatFileSize(file.size)}</div>
                          <div className="px-5 py-4 w-36 text-sm text-slate-600">{formatFileDate(file.lastModifiedDateTime)}</div>
                          <div className="px-5 py-4 w-48">
                            <div className="flex items-center gap-2 justify-end">
                              <a href={file.webUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1">
                                <ExternalLink size={12} /> Open
                              </a>
                              <button
                                onClick={() => { setVersionUploadFileId(file.id); versionUploadRef.current?.click(); }}
                                className="text-slate-500 hover:text-slate-700 text-xs font-medium flex items-center gap-1"
                              >
                                <Upload size={12} /> Update
                              </button>
                              <button
                                onClick={() => handleToggleVersions(file.id)}
                                className="text-slate-500 hover:text-slate-700 text-xs font-medium flex items-center gap-1"
                              >
                                <History size={12} /> Versions
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Version history (expandable) */}
                        {isExpanded && (
                          <div className="bg-slate-50 border-t border-slate-100 px-12 py-3">
                            {versionsLoading ? (
                              <p className="text-xs text-slate-400 py-2">Loading version history...</p>
                            ) : versions.length === 0 ? (
                              <p className="text-xs text-slate-400 py-2">No version history available</p>
                            ) : (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Version History</p>
                                <div className="space-y-1">
                                  {versions.map((v, idx) => (
                                    <div key={v.id} className="flex items-center gap-4 text-xs py-1.5">
                                      <span className="font-mono text-slate-600 w-12">v{versions.length - idx}.0</span>
                                      <span className="text-slate-600 w-36">{formatFileDate(v.lastModifiedDateTime)}</span>
                                      <span className="text-slate-500 w-32">{v.lastModifiedBy?.user?.displayName || '—'}</span>
                                      <span className="text-slate-400">{formatFileSize(v.size)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} onSubmit={handleSubmit} title={editItem ? 'Edit Policy' : 'Add Policy'} fields={policyFields} initialData={editItem || {}} loading={loading} />
    </div>
  );
}
