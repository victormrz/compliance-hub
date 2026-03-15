import { useState, useMemo } from 'react';
import { Users, Plus, Pencil, Trash2, Shield, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { roleAssignments, allRoles, rolePermissions, getUserRole, credentialingAuthorizedEmails } from '../lib/roles';
import { logAuditEvent } from '../lib/auditService';

const STORAGE_KEY = 'compliancehub_role_overrides';

function getStoredOverrides() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveOverrides(overrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

const permissionLabels = [
  { key: 'canCreate', label: 'Create Records' },
  { key: 'canEdit', label: 'Edit Records' },
  { key: 'canDelete', label: 'Delete Records' },
  { key: 'canExport', label: 'Export Data' },
  { key: 'canManageUsers', label: 'Manage Users' },
  { key: 'canManageSettings', label: 'Manage Settings' },
  { key: 'canViewAllDepartments', label: 'View All Depts' },
];

export default function UserManagement() {
  const { user, isAdmin } = useAuth();
  const [overrides, setOverrides] = useState(getStoredOverrides);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmail, setEditEmail] = useState(null);
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('end_user');

  // Merge hardcoded assignments with localStorage overrides
  const allUsers = useMemo(() => {
    const merged = { ...roleAssignments, ...overrides };
    const entries = Object.entries(merged)
      .filter(([, role]) => role !== '__deleted__')
      .map(([email, role]) => ({
        email,
        role,
        source: overrides[email] ? 'local' : 'system',
        hasCredentialingAccess: credentialingAuthorizedEmails.includes(email.toLowerCase()),
      }));
    entries.sort((a, b) => {
      const roleOrder = { admin: 0, manager: 1, end_user: 2, viewer: 3 };
      return (roleOrder[a.role] ?? 4) - (roleOrder[b.role] ?? 4) || a.email.localeCompare(b.email);
    });
    return entries;
  }, [overrides]);

  const q = search.toLowerCase();
  const filtered = q ? allUsers.filter(u => u.email.includes(q) || u.role.includes(q)) : allUsers;

  const roleCounts = useMemo(() => {
    const counts = { admin: 0, manager: 0, end_user: 0, viewer: 0 };
    allUsers.forEach(u => { counts[u.role] = (counts[u.role] || 0) + 1; });
    return counts;
  }, [allUsers]);

  const handleSave = () => {
    const email = formEmail.toLowerCase().trim();
    if (!email || !email.includes('@')) return;
    const newOverrides = { ...overrides, [email]: formRole };
    setOverrides(newOverrides);
    saveOverrides(newOverrides);
    logAuditEvent({
      action: editEmail ? 'Update' : 'Create',
      entity: 'UserRoles',
      recordId: email,
      recordName: email,
      user,
      changes: editEmail
        ? { role: { old: getUserRole(editEmail), new: formRole } }
        : { email, role: formRole },
      isLive: false,
    });
    setModalOpen(false);
    setEditEmail(null);
    setFormEmail('');
    setFormRole('end_user');
  };

  const handleDelete = (email) => {
    if (!confirm(`Remove role assignment for ${email}? They will default to end_user.`)) return;
    const newOverrides = { ...overrides };
    if (roleAssignments[email]) {
      newOverrides[email] = '__deleted__';
    } else {
      delete newOverrides[email];
    }
    setOverrides(newOverrides);
    saveOverrides(newOverrides);
    logAuditEvent({
      action: 'Delete',
      entity: 'UserRoles',
      recordId: email,
      recordName: email,
      user,
      changes: { removed: true },
      isLive: false,
    });
  };

  const openAdd = () => {
    setEditEmail(null);
    setFormEmail('');
    setFormRole('end_user');
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditEmail(u.email);
    setFormEmail(u.email);
    setFormRole(u.role);
    setModalOpen(true);
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Shield size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
        <p className="text-sm text-slate-500 text-center max-w-md">
          User management is restricted to administrators. Contact your system admin if you need access.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage role assignments for ComplianceHub users</p>
        </div>
        <button onClick={openAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {allRoles.map(r => (
          <div key={r.value} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <Shield size={20} className={r.value === 'admin' ? 'text-red-500' : r.value === 'manager' ? 'text-amber-500' : r.value === 'end_user' ? 'text-indigo-500' : 'text-slate-400'} />
              <div>
                <p className="text-2xl font-bold">{roleCounts[r.value] || 0}</p>
                <p className="text-xs text-slate-500">{r.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center justify-end mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Permissions</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Source</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Credentialing</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const perms = rolePermissions[u.role] || rolePermissions.end_user;
              const isSelf = u.email === user?.email?.toLowerCase();
              return (
                <tr key={u.email} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {u.email.split('@')[0].slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{u.email}</p>
                        {isSelf && <span className="text-[10px] text-indigo-600">(you)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-red-100 text-red-700' :
                      u.role === 'manager' ? 'bg-amber-100 text-amber-700' :
                      u.role === 'viewer' ? 'bg-slate-100 text-slate-600' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {(rolePermissions[u.role]?.label) || u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {permissionLabels.filter(p => perms[p.key]).map(p => (
                        <span key={p.key} className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px]">{p.label}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs ${u.source === 'system' ? 'text-slate-400' : 'text-indigo-600 font-medium'}`}>
                      {u.source === 'system' ? 'System' : 'Custom'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {u.hasCredentialingAccess ? (
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">Yes</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded text-xs">No</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} className="text-slate-400 hover:text-indigo-600"><Pencil size={14} /></button>
                      {!isSelf && (
                        <button onClick={() => handleDelete(u.email)} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">How User Roles Work</h3>
        <ul className="text-xs text-blue-700 space-y-1.5">
          <li><strong>Admin:</strong> Full access to all features, including user management and data deletion</li>
          <li><strong>Manager:</strong> Can create, edit, and view all records, run reports, manage staff</li>
          <li><strong>End User:</strong> Can view records and submit incidents, staffing logs, and training</li>
          <li><strong>Viewer:</strong> Read-only access to dashboards and reports</li>
          <li className="pt-2 border-t border-blue-200"><strong>Default:</strong> Any authenticated user not listed here gets the End User role</li>
          <li><strong>Credentialing:</strong> Access to the Credentialing page (contains PII) requires being on the authorized list in system config</li>
        </ul>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editEmail ? 'Edit User Role' : 'Add User'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  disabled={!!editEmail}
                  placeholder="user@roaringbrookrecovery.com"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {allRoles.map(r => (
                    <option key={r.value} value={r.value}>{r.label} — {r.description}</option>
                  ))}
                </select>
              </div>
              {/* Permission preview */}
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Permissions Preview</p>
                <div className="flex flex-wrap gap-1">
                  {permissionLabels.map(p => {
                    const has = rolePermissions[formRole]?.[p.key];
                    return (
                      <span key={p.key} className={`px-2 py-0.5 rounded text-[10px] ${has ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400 line-through'}`}>
                        {p.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
              <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                {editEmail ? 'Update Role' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
