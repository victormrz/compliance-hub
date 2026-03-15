import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Library, Users, Shield, GraduationCap, AlertCircle, FileKey } from 'lucide-react';

const searchTargets = [
  { label: 'Standards Library', icon: Library, path: '/standards', color: 'text-indigo-500', description: 'TJC, CARF, State, and Federal standards' },
  { label: 'Policies & Procedures', icon: FileText, path: '/policies', color: 'text-blue-500', description: 'Version-controlled policy documents' },
  { label: 'Personnel & HR', icon: Users, path: '/personnel', color: 'text-emerald-500', description: 'Staff credentials and training status' },
  { label: 'Credentialing', icon: Shield, path: '/credentialing', color: 'text-purple-500', description: 'CAQH, NPI, DEA, license verification' },
  { label: 'Training & LMS', icon: GraduationCap, path: '/training', color: 'text-cyan-500', description: 'Mandatory training courses and records' },
  { label: 'Incident Reporting', icon: AlertCircle, path: '/incidents', color: 'text-red-500', description: 'Unusual occurrence reports and investigations' },
  { label: 'Licenses & Permits', icon: FileKey, path: '/licenses', color: 'text-amber-500', description: 'AODE, Fire Marshal, business permits' },
  { label: 'Compliance Crosswalk', icon: Library, path: '/crosswalk', color: 'text-indigo-500', description: 'CARF/TJC/State/Federal requirement mapping' },
  { label: 'Evidence Tracker', icon: FileText, path: '/evidence', color: 'text-blue-500', description: 'Survey-ready evidence documents' },
  { label: 'Regulatory Changes', icon: AlertCircle, path: '/regulatory-changes', color: 'text-red-500', description: 'Regulatory change log and impact tracking' },
];

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

  // Search navigates to the matching page — each page has its own search bar for filtering live SharePoint data
  const results = q.length < 2 ? [] : searchTargets.filter(t =>
    t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  );

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
              <p className="text-sm text-slate-500">No matching pages for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Use the search bar on each page to search live data</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="text-xs text-slate-400 font-medium">{results.length} matching page{results.length !== 1 ? 's' : ''} — click to open and search</span>
              </div>
              {results.map(target => (
                <button
                  key={target.path}
                  onClick={() => {
                    navigate(target.path);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center gap-3 border-b border-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 shrink-0">
                    <target.icon size={14} className={target.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{target.label}</p>
                    <p className="text-xs text-slate-500 truncate">{target.description}</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
