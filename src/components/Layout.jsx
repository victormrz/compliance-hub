import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, FileKey, ClipboardCheck, AlertTriangle,
  Users, GraduationCap, FileText, AlertCircle, Library,
  Calendar, ChevronLeft, ChevronRight, Filter, LogOut,
  Scale, ScrollText, Database
} from 'lucide-react';
import { useState } from 'react';
import { useAccreditation } from '../hooks/useAccreditation';
import { useAuth } from '../hooks/useAuth';
import GlobalSearch from './GlobalSearch';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/facilities', label: 'Facilities', icon: Building2 },
  { path: '/licenses', label: 'Licenses & Permits', icon: FileKey },
  { path: '/eoc', label: 'EOC Inspections', icon: ClipboardCheck },
  { path: '/ligature-risk', label: 'Ligature Risk', icon: AlertTriangle },
  { path: '/staffing', label: 'Daily Staffing', icon: Calendar },
  { path: '/personnel', label: 'Personnel & HR', icon: Users },
  { path: '/credentialing', label: 'Credentialing', icon: FileKey },
  { path: '/training', label: 'Training & LMS', icon: GraduationCap },
  { path: '/policies', label: 'Policies & Procedures', icon: FileText },
  { path: '/incidents', label: 'Incident Reporting', icon: AlertCircle },
  { path: '/standards', label: 'Standards Library', icon: Library },
  { path: '/regulatory-changes', label: 'Regulatory Changes', icon: Scale },
  { path: '/audit-log', label: 'Audit Trail', icon: ScrollText },
  { path: '/data-backup', label: 'Data Backup', icon: Database },
];

const roleColors = {
  admin: 'bg-red-500/20 text-red-300',
  manager: 'bg-amber-500/20 text-amber-300',
  end_user: 'bg-indigo-500/20 text-indigo-300',
  viewer: 'bg-slate-500/20 text-slate-300',
};

const roleLabels = {
  admin: 'Admin',
  manager: 'Manager',
  end_user: 'Staff',
  viewer: 'Viewer',
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { body, setBody, bodyLabels } = useAccreditation();
  const { user, logout, canAccess } = useAuth();

  // Filter nav items by role
  const visibleNavItems = navItems.filter(item => canAccess(item.path));

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-[#1e1b4b] text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'} shrink-0`}>
        {/* Brand */}
        <div className="p-4 border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <img src="/logo-light.jpg" alt="Roaring Brook" className="w-9 h-9 shrink-0 rounded" />
            {!collapsed && (
              <div>
                <h1 className="text-sm font-bold leading-tight">ComplianceHub</h1>
                <p className="text-[10px] text-indigo-300">Roaring Brook Recovery</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {visibleNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white'
                }`
              }
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-3 border-t border-indigo-800 text-indigo-300 hover:text-white flex items-center justify-center"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* User */}
        <div className="p-3 border-t border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium truncate">{user?.name || 'User'}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${roleColors[user?.role] || roleColors.end_user}`}>
                    {roleLabels[user?.role] || 'Staff'}
                  </span>
                </div>
                <p className="text-[10px] text-indigo-300 truncate">{user?.title || user?.email}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={logout} className="text-indigo-400 hover:text-white shrink-0" title="Sign out">
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Object.entries(bodyLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <GlobalSearch />
          <span className="text-xs text-indigo-600 font-medium">Behavioral Health Compliance</span>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
