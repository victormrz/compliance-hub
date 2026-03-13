import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Library, Users, Shield, GraduationCap, AlertCircle, FileKey, Building2 } from 'lucide-react';
import { standards, policies, staff, incidents, training, licenses, credentials, complianceTasks } from '../data/mockData';

const searchSources = [
  { key: 'standards', label: 'Standards', icon: Library, path: '/standards', color: 'text-indigo-500', items: standards, fields: ['code', 'name', 'body', 'category'] },
  { key: 'policies', label: 'Policies', icon: FileText, path: '/policies', color: 'text-blue-500', items: policies, fields: ['title', 'category', 'owner'] },
  { key: 'staff', label: 'Personnel', icon: Users, path: '/personnel', color: 'text-emerald-500', items: staff, fields: ['name', 'title', 'department'] },
  { key: 'credentials', label: 'Credentials', icon: Shield, path: '/credentialing', color: 'text-purple-500', items: credentials, fields: ['employee', 'type', 'issuingBody', 'number'] },
  { key: 'training', label: 'Training', icon: GraduationCap, path: '/training', color: 'text-cyan-500', items: training, fields: ['course', 'category'] },
  { key: 'incidents', label: 'Incidents', icon: AlertCircle, path: '/incidents', color: 'text-red-500', items: incidents, fields: ['type', 'facility', 'reportedBy', 'description'] },
  { key: 'licenses', label: 'Licenses', icon: FileKey, path: '/licenses', color: 'text-amber-500', items: licenses, fields: ['name', 'facility', 'type'] },
  { key: 'tasks', label: 'Tasks', icon: FileText, path: '/', color: 'text-slate-500', items: complianceTasks, fields: ['task', 'assignedTo', 'standardRef', 'category'] },
];

function getLabel(item, source) {
  switch (source.key) {
    case 'standards': return { primary: item.code, secondary: item.name };
    case 'policies': return { primary: item.title, secondary: item.owner };
    case 'staff': return { primary: item.name, secondary: item.title };
    case 'credentials': return { primary: `${item.employee} — ${item.type}`, secondary: item.issuingBody };
    case 'training': return { primary: item.course, secondary: item.category };
    case 'incidents': return { primary: item.type, secondary: `${item.facility} · ${item.date}` };
    case 'licenses': return { primary: item.name, secondary: item.facility };
    case 'tasks': return { primary: item.task, secondary: item.assignedTo };
    default: return { primary: '', secondary: '' };
  }
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const q = query.toLowerCase().trim();
  const results = q.length < 2 ? [] : searchSources.map(source => {
    const matches = source.items.filter(item =>
      source.fields.some(field => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(q);
      })
    ).slice(0, 3); // max 3 per category
    return { ...source, matches };
  }).filter(s => s.matches.length > 0);

  const totalResults = results.reduce((sum, s) => sum + s.matches.length, 0);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Search everything... (⌘K)"
          className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-56"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && q.length >= 2 && (
        <div className="absolute top-full left-0 mt-2 w-[420px] bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-[70vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-6 text-center">
              <Search size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No results for "{query}"</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="text-xs text-slate-400 font-medium">{totalResults} result{totalResults !== 1 ? 's' : ''} across {results.length} categories</span>
              </div>
              {results.map(source => (
                <div key={source.key}>
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                    <source.icon size={12} className={source.color} />
                    <span className="text-xs font-semibold text-slate-500 uppercase">{source.label}</span>
                  </div>
                  {source.matches.map((item, i) => {
                    const labels = getLabel(item, source);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          navigate(source.path);
                          setOpen(false);
                          setQuery('');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center gap-3 border-b border-slate-50 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 shrink-0`}>
                          <source.icon size={14} className={source.color} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">{labels.primary}</p>
                          <p className="text-xs text-slate-500 truncate">{labels.secondary}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
