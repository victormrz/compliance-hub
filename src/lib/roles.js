/**
 * Role-Based Access Control (RBAC) for ComplianceHub
 *
 * Roles:
 *   - admin: Full access to all features, can manage users/roles, delete records
 *   - manager: Can create/edit/view all records, run reports, manage staff assignments
 *   - end_user: Can view records, create incidents, log staffing, complete training
 *   - viewer: Read-only access to dashboards and reports
 *
 * Role assignment:
 *   1. Check roleAssignments map (email-based) first
 *   2. Fall back to Azure AD group membership (future)
 *   3. Default to 'end_user' for any authenticated user
 */

// Map email addresses to roles
// Add new users here or manage via SharePoint list in future
export const roleAssignments = {
  // Admins — full system access
  'victor@roaringbrookrecovery.com': 'admin',
  'victor.rivera@roaringbrookrecovery.com': 'admin',

  // Managers — can manage records and staff
  // Add manager emails below:
  // 'sarah.mitchell@roaringbrookrecovery.com': 'manager',
  // 'michael.chen@roaringbrookrecovery.com': 'manager',

  // End Users get default role (no need to list them)
};

// Permission definitions per role
export const rolePermissions = {
  admin: {
    label: 'Administrator',
    description: 'Full system access with user management',
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canManageSettings: true,
    canExport: true,
    canViewAllDepartments: true,
    visiblePages: '*', // all pages
  },
  manager: {
    label: 'Manager',
    description: 'Can create, edit, and manage compliance records',
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canManageSettings: false,
    canExport: true,
    canViewAllDepartments: true,
    visiblePages: '*',
  },
  end_user: {
    label: 'End User',
    description: 'Can view records and submit incidents, staffing logs, and training',
    canCreate: true, // limited create (incidents, staffing)
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canManageSettings: false,
    canExport: false,
    canViewAllDepartments: false,
    visiblePages: [
      '/', '/facilities', '/eoc', '/ligature-risk', '/staffing',
      '/training', '/incidents', '/standards', '/regulatory-changes',
    ],
    createOnlyPages: ['/incidents', '/staffing'], // can only create on these pages
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to dashboards and reports',
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canManageSettings: false,
    canExport: false,
    canViewAllDepartments: false,
    visiblePages: ['/', '/facilities', '/standards', '/regulatory-changes'],
  },
};

/**
 * Get the role for a user email
 */
export function getUserRole(email) {
  if (!email) return 'end_user';
  const normalizedEmail = email.toLowerCase().trim();
  return roleAssignments[normalizedEmail] || 'end_user';
}

/**
 * Get permissions for a role
 */
export function getPermissions(role) {
  return rolePermissions[role] || rolePermissions.end_user;
}

/**
 * Check if a role can access a specific page
 */
export function canAccessPage(role, path) {
  const perms = getPermissions(role);
  if (perms.visiblePages === '*') return true;
  return perms.visiblePages.includes(path);
}

/**
 * Check if a role can create on a specific page
 */
export function canCreateOnPage(role, path) {
  const perms = getPermissions(role);
  if (!perms.canCreate) return false;
  if (perms.createOnlyPages) return perms.createOnlyPages.includes(path);
  return true; // admin/manager can create everywhere
}

/**
 * All available roles for user management UI
 */
export const allRoles = Object.entries(rolePermissions).map(([key, val]) => ({
  value: key,
  label: val.label,
  description: val.description,
}));
