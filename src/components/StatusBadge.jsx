export default function StatusBadge({ status }) {
  const styles = {
    'Active': 'bg-emerald-100 text-emerald-700',
    'Compliant': 'bg-emerald-100 text-emerald-700',
    'Complete': 'bg-emerald-100 text-emerald-700',
    'Completed': 'bg-emerald-100 text-emerald-700',
    'Current': 'bg-emerald-100 text-emerald-700',
    'Resolved': 'bg-emerald-100 text-emerald-700',
    'Closed': 'bg-slate-100 text-slate-600',
    'In Progress': 'bg-blue-100 text-blue-700',
    'RCA In Progress': 'bg-blue-100 text-blue-700',
    'Under Review': 'bg-amber-100 text-amber-700',
    'Not Started': 'bg-slate-100 text-slate-600',
    'Pending': 'bg-slate-100 text-slate-600',
    'Review Due': 'bg-amber-100 text-amber-700',
    'Overdue': 'bg-red-100 text-red-700',
    'Expired': 'bg-red-100 text-red-700',
    'Critical': 'bg-red-100 text-red-700',
    'Expiring Soon': 'bg-amber-100 text-amber-700',
    'Warning': 'bg-amber-100 text-amber-700',
    'Minor': 'bg-emerald-100 text-emerald-700',
    'Moderate': 'bg-amber-100 text-amber-700',
  };

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}
