import { Building2, Plus } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { facilities } from '../data/mockData';

export default function Facilities() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Facilities</h1><p className="text-sm text-slate-500 mt-1">Multi-site management for SUD, Mental Health, and Eating Disorder centers</p></div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"><Plus size={16} /> Add Facility</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map(f => (
          <div key={f.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center"><Building2 size={24} className="text-indigo-500" /></div>
              <StatusBadge status={f.status} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{f.name}</h3>
            <p className="text-sm text-slate-500 mb-3">{f.type}</p>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between gap-4"><span className="text-slate-500 shrink-0">Address</span><span className="text-slate-900 text-right">{f.address}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500 shrink-0">Beds</span><span className="text-slate-900">{f.beds || 'N/A (Outpatient)'}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500 shrink-0">License</span><span className="text-slate-900 font-mono text-xs">{f.license}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
