import { useState } from 'react';
import { GraduationCap, Plus, Pencil, Wifi, WifiOff } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import SearchInput from '../components/SearchInput';
import FormModal from '../components/FormModal';
import { training as mockTraining, trainingRecords } from '../data/mockData';
import { useAccreditation } from '../hooks/useAccreditation';
import { useSharePointData } from '../hooks/useSharePointData';

const trainingFields = [
  { key: 'course', label: 'Course Name', type: 'text', required: true, placeholder: 'e.g., HIPAA Privacy & Security' },
  { key: 'category', label: 'Category', type: 'select', required: true, options: ['Compliance', 'Clinical', 'Safety', 'HR', 'Leadership'] },
  { key: 'frequency', label: 'Frequency', type: 'select', required: true, options: ['Annual', 'Semi-Annual', 'Quarterly', 'One-Time', 'As Needed'] },
  { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 2 hours' },
  { key: 'standardRefs', label: 'Standard References', type: 'tags', placeholder: 'HR.01.04.01, EC.02.01.01' },
  { key: 'status', label: 'Status', type: 'select', required: true, options: ['Active', 'Draft', 'Archived'] },
];

export default function Training() {
  const { filterByBody } = useAccreditation();
  const { data: trainingCourses, loading, isLive, create, update } = useSharePointData('Training', mockTraining);
  const [tab, setTab] = useState('courses');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const bodyFilteredCourses = filterByBody(trainingCourses);
  const bodyFilteredNames = new Set(bodyFilteredCourses.map(c => c.course));
  const bodyFilteredRecords = trainingRecords.filter(r => bodyFilteredNames.has(r.course));

  const q = search.toLowerCase();
  const filteredCourses = q ? bodyFilteredCourses.filter(t =>
    (t.course || '').toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q) ||
    (t.standardRefs || []).some(r => r.toLowerCase().includes(q))
  ) : bodyFilteredCourses;
  const filteredRecords = q ? bodyFilteredRecords.filter(r =>
    (r.employee || '').toLowerCase().includes(q) || (r.course || '').toLowerCase().includes(q)
  ) : bodyFilteredRecords;

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
            <h1 className="text-2xl font-bold text-slate-900">Training & LMS</h1>
            {isLive ? <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium"><Wifi size={10} /> SharePoint</span> : <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium"><WifiOff size={10} /> Offline</span>}
          </div>
          <p className="text-sm text-slate-500 mt-1">Track mandatory trainings and certifications</p>
        </div>
        <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={16} /> Add Training Course
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><GraduationCap size={20} className="text-indigo-500" /><div><p className="text-2xl font-bold">{filteredCourses.length}</p><p className="text-xs text-slate-500">Training Courses</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><GraduationCap size={20} className="text-emerald-500" /><div><p className="text-2xl font-bold">{filteredRecords.filter(t => t.status === 'Completed').length}</p><p className="text-xs text-slate-500">Completed</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><GraduationCap size={20} className="text-red-500" /><div><p className="text-2xl font-bold">{filteredRecords.filter(t => t.status === 'Overdue').length}</p><p className="text-xs text-slate-500">Overdue/Expired</p></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><GraduationCap size={20} className="text-blue-500" /><div><p className="text-2xl font-bold">{filteredRecords.filter(t => t.status === 'In Progress').length}</p><p className="text-xs text-slate-500">In Progress</p></div></div></div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          <button onClick={() => setTab('courses')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'courses' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>Training Courses ({filteredCourses.length})</button>
          <button onClick={() => setTab('records')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'records' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>Training Records ({filteredRecords.length})</button>
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search training..." />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : tab === 'courses' ? (
        filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <GraduationCap size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No training courses found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Training Course</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Frequency</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Duration</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Standards</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-5 py-3"></th>
              </tr></thead>
              <tbody>
                {filteredCourses.map((t, i) => (
                  <tr key={t.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center"><GraduationCap size={14} className="text-indigo-500" /></div>
                        <div><p className="text-sm font-semibold text-slate-900">{t.course}</p><p className="text-xs text-slate-500">{t.category}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{t.frequency}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{t.duration}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(t.standardRefs || []).map(ref => <span key={ref} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-mono">{ref}</span>)}
                      </div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                    <td className="px-5 py-4"><button onClick={() => { setEditItem(t); setModalOpen(true); }} className="text-slate-400 hover:text-indigo-600"><Pencil size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        filteredRecords.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <GraduationCap size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No training records found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Course</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Due Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Completed</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr></thead>
              <tbody>
                {filteredRecords.map((r, i) => (
                  <tr key={r.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm font-medium text-slate-900">{r.employee}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{r.course}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{r.dueDate}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{r.completedDate || '—'}</td>
                    <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} onSubmit={handleSubmit} title={editItem ? 'Edit Training Course' : 'Add Training Course'} fields={trainingFields} initialData={editItem || {}} loading={loading} />
    </div>
  );
}
