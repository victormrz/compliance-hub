/**
 * Audit Trail Service for ComplianceHub
 *
 * Logs every data change (create, update, delete) with:
 *   - who made the change (user email/name)
 *   - what changed (entity, record, field-level diffs)
 *   - when it happened (ISO timestamp)
 *
 * Required for CARF & State board compliance — audit trails must be
 * available for surveyor review during accreditation inspections.
 *
 * Storage: SharePoint list "AuditLog" (live) / localStorage (offline)
 */

import * as graphService from './graphService';

const AUDIT_LIST = 'AuditLog';
const LOCAL_KEY = 'compliancehub_audit_log';

// ── In-memory cache for the session ──
let auditCache = [];

/**
 * Log an audit event
 */
export async function logAuditEvent({
  action,       // 'Create' | 'Update' | 'Delete'
  entity,       // 'Standards' | 'Policies' | 'Incidents' | etc.
  recordId,
  recordName,
  user,         // { name, email, role }
  changes,      // { fieldName: { old, new } } for updates, or full record for create
  isLive = false,
}) {
  const event = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    action,
    entity,
    recordId: String(recordId),
    recordName: recordName || '',
    userName: user?.name || 'System',
    userEmail: user?.email || '',
    userRole: user?.role || '',
    changes: typeof changes === 'object' ? JSON.stringify(changes) : String(changes || ''),
    summary: buildSummary(action, entity, recordName, changes),
  };

  // Always add to in-memory cache
  auditCache.unshift(event);

  // Persist to localStorage (always, as backup)
  persistToLocal(event);

  // If live, also push to SharePoint
  if (isLive) {
    try {
      await graphService.createListItem(AUDIT_LIST, {
        Title: event.summary.slice(0, 255),
        Action: event.action,
        Entity: event.entity,
        RecordId: event.recordId,
        RecordName: event.recordName,
        UserName: event.userName,
        UserEmail: event.userEmail,
        UserRole: event.userRole,
        Changes: event.changes.slice(0, 4000), // SharePoint text field limit
        Timestamp: event.timestamp,
      });
    } catch (err) {
      console.error('Failed to write audit log to SharePoint:', err);
      // localStorage backup already saved above
    }
  }

  return event;
}

/**
 * Build a human-readable summary of the change
 */
function buildSummary(action, entity, recordName, changes) {
  const name = recordName || 'record';
  switch (action) {
    case 'Create':
      return `Created new ${entity.replace(/s$/, '')}: ${name}`;
    case 'Update': {
      if (typeof changes === 'object' && changes !== null) {
        const parsed = typeof changes === 'string' ? JSON.parse(changes) : changes;
        const fieldCount = Object.keys(parsed).length;
        return `Updated ${name} in ${entity} (${fieldCount} field${fieldCount !== 1 ? 's' : ''} changed)`;
      }
      return `Updated ${name} in ${entity}`;
    }
    case 'Delete':
      return `Deleted ${name} from ${entity}`;
    default:
      return `${action} on ${name} in ${entity}`;
  }
}

/**
 * Get diff between old and new record (field-level changes)
 */
export function getRecordDiff(oldRecord, newFields) {
  const diff = {};
  for (const [key, newVal] of Object.entries(newFields)) {
    const oldVal = oldRecord[key];
    // Compare stringified values to handle arrays/objects
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[key] = { old: oldVal ?? null, new: newVal };
    }
  }
  return diff;
}

/**
 * Persist audit event to localStorage
 */
function persistToLocal(event) {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    existing.unshift(event);
    // Keep last 5000 entries locally
    const trimmed = existing.slice(0, 5000);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to persist audit log locally:', err);
  }
}

/**
 * Get all audit events (from localStorage + memory)
 */
export function getLocalAuditLog() {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    // Merge with in-memory cache (deduplicate by id)
    const ids = new Set(stored.map(e => e.id));
    const merged = [...stored];
    for (const e of auditCache) {
      if (!ids.has(e.id)) merged.push(e);
    }
    return merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch {
    return auditCache;
  }
}

/**
 * Get audit events for a specific entity
 */
export function getEntityAuditLog(entity) {
  return getLocalAuditLog().filter(e => e.entity === entity);
}

/**
 * Get audit events for a specific record
 */
export function getRecordAuditLog(entity, recordId) {
  return getLocalAuditLog().filter(
    e => e.entity === entity && e.recordId === String(recordId)
  );
}

/**
 * Clear local audit log (admin only — for board presentation resets)
 */
export function clearLocalAuditLog() {
  localStorage.removeItem(LOCAL_KEY);
  auditCache = [];
}

/**
 * Export audit log as structured data (for board presentations)
 */
export function exportAuditLog(filters = {}) {
  let log = getLocalAuditLog();

  if (filters.entity) log = log.filter(e => e.entity === filters.entity);
  if (filters.action) log = log.filter(e => e.action === filters.action);
  if (filters.user) log = log.filter(e => e.userEmail === filters.user || e.userName === filters.user);
  if (filters.startDate) log = log.filter(e => e.timestamp >= filters.startDate);
  if (filters.endDate) log = log.filter(e => e.timestamp <= filters.endDate);

  return log;
}
