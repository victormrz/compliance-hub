import { Download } from 'lucide-react';
import { exportToCSV } from '../lib/exportUtils';
import { useAuth } from '../hooks/useAuth';

/**
 * Reusable CSV export button — only visible to roles with canExport permission.
 * Drop this into any page header to add data export.
 */
export default function ExportButton({ data, filename, columns, label = 'Export CSV' }) {
  const { user } = useAuth();

  // Only admin and manager can export (check roles.js canExport)
  const canExport = user?.role === 'admin' || user?.role === 'manager';
  if (!canExport) return null;

  const handleExport = () => {
    if (!data || data.length === 0) return;
    exportToCSV(data, filename, columns);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data || data.length === 0}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      title={`Export ${data?.length || 0} records as CSV`}
    >
      <Download size={13} />
      {label}
    </button>
  );
}
