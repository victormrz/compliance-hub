import { useState, useCallback } from 'react';
import { Database, Download, FileJson, FileSpreadsheet, Shield, Clock, HardDrive } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { exportToCSV, exportToJSON, exportFullBackup, exportBoardReport } from '../lib/exportService';
import { getLocalAuditLog } from '../lib/auditService';

// Import all mock data (used as fallback)
import {
  standards, policies, incidents, training, trainingRecords,
  staff, credentials, licenses, facilities, complianceTasks,
  regulatoryChanges, auditLog as mockAuditLog, contracts,
} from '../data/mockData';

const dataLists = [
  { key: 'standards', label: 'Accreditation Standards', icon: '📋', count: null },
  { key: 'policies', label: 'Policies & Procedures', icon: '📄', count: null },
  { key: 'incidents', label: 'Incident Reports', icon: '🚨', count: null },
  { key: 'training', label: 'Training Courses', icon: '🎓', count: null },
  { key: 'trainingRecords', label: 'Training Records', icon: '📝', count: null },
  { key: 'personnel', label: 'Personnel & HR', icon: '👥', count: null },
  { key: 'credentials', label: 'Credentialing', icon: '🔑', count: null },
  { key: 'licenses', label: 'Licenses & Permits', icon: '📜', count: null },
  { key: 'facilities', label: 'Facilities', icon: '🏥', count: null },
  { key: 'regulatoryChanges', label: 'Regulatory Changes', icon: '⚖️', count: null },
  { key: 'complianceTasks', label: 'Compliance Tasks', icon: '✅', count: null },
  { key: 'contracts', label: 'Contracts & BAAs', icon: '📑', count: null },
  { key: 'auditLog', label: 'Audit Trail', icon: '📊', count: null },
];

export default function DataBackup() {
  const { isAdmin, user } = useAuth();
  const [lastBackup, setLastBackup] = useState(localStorage.getItem('lastBackupDate') || null);
  const [exporting, setExporting] = useState(null);

  // Get current data (mock fallback)
  const getCurrentData = useCallback(() => ({
    standards,
    policies,
    incidents,
    training,
    trainingRecords,
    personnel: staff,
    credentials,
    licenses,
    facilities,
    regulatoryChanges,
    complianceTasks,
    contracts,
    auditLog: getLocalAuditLog().length > 0 ? getLocalAuditLog() : mockAuditLog,
    exportedBy: user?.name || 'ComplianceHub',
  }), [user]);

  const listCounts = {
    standards: standards.length,
    policies: policies.length,
    incidents: incidents.length,
    training: training.length,
    trainingRecords: trainingRecords.length,
    personnel: staff.length,
    credentials: credentials.length,
    licenses: licenses.length,
    facilities: facilities.length,
    regulatoryChanges: regulatoryChanges.length,
    complianceTasks: complianceTasks.length,
    contracts: contracts.length,
    auditLog: getLocalAuditLog().length || mockAuditLog.length,
  };

  const totalRecords = Object.values(listCounts).reduce((s, n) => s + n, 0);

  const handleExportCSV = (key) => {
    setExporting(key);
    const data = getCurrentData();
    const d = data[key] || [];
    exportToCSV(d, `ComplianceHub_${key}_${new Date().toISOString().slice(0, 10)}`);
    setTimeout(() => setExporting(null), 500);
  };

  const handleExportJSON = (key) => {
    setExporting(key);
    const data = getCurrentData();
    const d = data[key] || [];
    exportToJSON(d, `ComplianceHub_${key}_${new Date().toISOString().slice(0, 10)}`);
    setTimeout(() => setExporting(null), 500);
  };

  const handleFullBackup = () => {
    setExporting('full');
    const data = getCurrentData();
    exportFullBackup(data);
    const now = new Date().toISOString();
    localStorage.setItem('lastBackupDate', now);
    setLastBackup(now);
    setTimeout(() => setExporting(null), 500);
  };

  const handleBoardReport = () => {
    setExporting('board');
    const data = getCurrentData();
    data.auditLog = getLocalAuditLog().length > 0 ? getLocalAuditLog() : mockAuditLog;
    exportBoardReport(data);
    setTimeout(() => setExporting(null), 500);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Data Backup & Export</h1>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              <Shield size={10} className="inline mr-1" />Compliance Required
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Export and backup all compliance data for disaster recovery and board presentations</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3"><Database size={20} className="text-indigo-500" /><div><p className="text-2xl font-bold">{totalRecords}</p><p className="text-xs text-slate-500">Total Records</p></div></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3"><HardDrive size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{Object.keys(listCounts).length}</p><p className="text-xs text-slate-500">Data Lists</p></div></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3"><Clock size={20} className="text-amber-500" /><div><p className="text-sm font-bold">{lastBackup ? new Date(lastBackup).toLocaleDateString() : 'Never'}</p><p className="text-xs text-slate-500">Last Full Backup</p></div></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3"><Shield size={20} className="text-red-500" /><div><p className="text-sm font-bold text-red-600">{!lastBackup ? 'Needed' : 'OK'}</p><p className="text-xs text-slate-500">Backup Status</p></div></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleFullBackup}
          disabled={exporting === 'full'}
          className="bg-indigo-600 text-white rounded-xl p-5 text-left hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileJson size={24} />
            <div>
              <p className="font-bold text-lg">Full System Backup</p>
              <p className="text-indigo-200 text-sm">Downloads all lists as a single JSON file</p>
            </div>
          </div>
          <p className="text-xs text-indigo-200 mt-2">
            Includes all {totalRecords} records across {Object.keys(listCounts).length} lists • Recommended: weekly
          </p>
        </button>
        <button
          onClick={handleBoardReport}
          disabled={exporting === 'board'}
          className="bg-emerald-600 text-white rounded-xl p-5 text-left hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileSpreadsheet size={24} />
            <div>
              <p className="font-bold text-lg">Board Report (CSV)</p>
              <p className="text-emerald-200 text-sm">Formatted compliance summary for CARF/State board review</p>
            </div>
          </div>
          <p className="text-xs text-emerald-200 mt-2">
            Includes licenses, standards, incidents, personnel, policies, and audit trail
          </p>
        </button>
      </div>

      {/* Individual List Exports */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">Individual List Exports</h2>
          <p className="text-xs text-slate-500">Export specific data lists as CSV or JSON</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Data List</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Records</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Export</th>
            </tr>
          </thead>
          <tbody>
            {dataLists.map(list => (
              <tr key={list.key} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{list.icon}</span>
                    <span className="text-sm font-medium text-slate-900">{list.label}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {listCounts[list.key] || 0} records
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleExportCSV(list.key)}
                      disabled={exporting === list.key}
                      className="bg-white text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Download size={12} /> CSV
                    </button>
                    <button
                      onClick={() => handleExportJSON(list.key)}
                      disabled={exporting === list.key}
                      className="bg-white text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Download size={12} /> JSON
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Backup Best Practices */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">📋 Backup Best Practices for CARF/State Compliance</h3>
        <ul className="text-xs text-amber-700 space-y-1.5">
          <li>• <strong>Weekly:</strong> Run Full System Backup and store on secure, offsite location (e.g., SharePoint, OneDrive)</li>
          <li>• <strong>Before Surveys:</strong> Generate Board Report CSV for evidence binders</li>
          <li>• <strong>After Major Changes:</strong> Export affected lists (Standards, Policies) after regulatory updates</li>
          <li>• <strong>Monthly:</strong> Export Audit Trail for compliance committee review</li>
          <li>• <strong>Annually:</strong> Archive full backup with date stamp for retention compliance</li>
        </ul>
      </div>
    </div>
  );
}
