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
  'matthew@roaringbrookrecovery.com': 'manager',
  'dave@roaringbrookrecovery.com': 'manager',
  'hacky@roaringbrookrecovery.com': 'manager',

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
      '/training', '/incidents', '/standards', '/crosswalk', '/evidence', '/regulatory-changes',
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
    visiblePages: ['/', '/facilities', '/standards', '/crosswalk', '/evidence', '/regulatory-changes'],
  },
};

/**
 * Get the role for a user email
 */
export function getUserRole(email) {
  if (!email) return 'end_user';
  const normalizedEmail = email.toLowerCase().trim();
  // Check localStorage overrides first (managed via User Management page)
  try {
    const overrides = JSON.parse(localStorage.getItem('compliancehub_role_overrides') || '{}');
    if (overrides[normalizedEmail] && overrides[normalizedEmail] !== '__deleted__') {
      return overrides[normalizedEmail];
    }
    if (overrides[normalizedEmail] === '__deleted__') return 'end_user';
  } catch { /* ignore parse errors */ }
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
/**
 * Emails authorized to view the Credentialing page (contains PII).
 * Admin/manager roles with these emails get access; everyone else is blocked.
 */
export const credentialingAuthorizedEmails = [
  'matthew@roaringbrookrecovery.com',
  'victor@roaringbrookrecovery.com',
  'victor.rivera@roaringbrookrecovery.com',
  'dave@roaringbrookrecovery.com',
  'hacky@roaringbrookrecovery.com',
];

/**
 * Check if user email is authorized for credentialing page
 */
export function canAccessCredentialing(email) {
  if (!email) return false;
  return credentialingAuthorizedEmails.includes(email.toLowerCase().trim());
}

export const allRoles = Object.entries(rolePermissions).map(([key, val]) => ({
  value: key,
  label: val.label,
  description: val.description,
}));
