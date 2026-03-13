/**
 * Data Backup & Export Service for ComplianceHub
 *
 * Provides export capabilities for:
 *   - Individual list data (CSV/JSON)
 *   - Full system backup (JSON bundle)
 *   - Board-ready summary reports (CSV)
 *   - Audit trail exports
 *
 * Required for CARF & State board surveys — data must be exportable
 * for offsite review, disaster recovery, and evidence packages.
 */

/**
 * Export data as CSV and trigger download
 */
export function exportToCSV(data, filename, columns) {
  if (!data || data.length === 0) return;

  // Use provided columns or derive from first record
  const cols = columns || Object.keys(data[0]).filter(k => k !== 'id');

  const header = cols.map(c => c.label || c.key || c).join(',');
  const rows = data.map(item =>
    cols.map(c => {
      const key = c.key || c;
      let val = item[key];
      // Handle arrays
      if (Array.isArray(val)) val = val.join('; ');
      // Handle objects
      if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
      // Escape commas and quotes in CSV
      val = String(val ?? '');
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );

  const csv = [header, ...rows].join('\n');
  downloadFile(csv, `${filename}.csv`, 'text/csv');
}

/**
 * Export data as JSON and trigger download
 */
export function exportToJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, 'application/json');
}

/**
 * Full system backup — exports all lists as a single JSON bundle
 */
export function exportFullBackup(allData) {
  const backup = {
    exportDate: new Date().toISOString(),
    exportedBy: allData.exportedBy || 'ComplianceHub',
    version: '1.0',
    data: {
      standards: allData.standards || [],
      policies: allData.policies || [],
      incidents: allData.incidents || [],
      training: allData.training || [],
      personnel: allData.personnel || [],
      credentials: allData.credentials || [],
      licenses: allData.licenses || [],
      eocInspections: allData.eocInspections || [],
      ligatureRisk: allData.ligatureRisk || [],
      dailyStaffing: allData.dailyStaffing || [],
      regulatoryChanges: allData.regulatoryChanges || [],
      auditLog: allData.auditLog || [],
    },
    metadata: {
      totalRecords: Object.values(allData).reduce(
        (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0
      ),
      listCount: Object.keys(allData).filter(k => Array.isArray(allData[k])).length,
    },
  };
  downloadFile(
    JSON.stringify(backup, null, 2),
    `ComplianceHub_Backup_${formatDateForFile(new Date())}.json`,
    'application/json'
  );
}

/**
 * Export board-ready compliance summary report
 */
export function exportBoardReport(data) {
  const now = new Date();
  const lines = [
    'ROARING BROOK RECOVERY — COMPLIANCE STATUS REPORT',
    `Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
    `Report Period: Current as of ${now.toLocaleDateString()}`,
    '',
    '═══════════════════════════════════════════════════',
    'SECTION 1: LICENSE & ACCREDITATION STATUS',
    '═══════════════════════════════════════════════════',
    '',
    'License/Permit,Facility,Type,Expiration,Status,Days Left',
    ...(data.licenses || []).map(l =>
      `${l.name},${l.facility},${l.type},${l.expirationDate},${l.status},${l.daysLeft}`
    ),
    '',
    '═══════════════════════════════════════════════════',
    'SECTION 2: STANDARDS COMPLIANCE',
    '═══════════════════════════════════════════════════',
    '',
    'Code,Standard Name,Body,Category,Status',
    ...(data.standards || []).map(s =>
      `${s.code},"${s.name}",${s.body},${s.category},${s.status || 'Active'}`
    ),
    '',
    '═══════════════════════════════════════════════════',
    'SECTION 3: INCIDENT SUMMARY',
    '═══════════════════════════════════════════════════',
    '',
    'Date,Type,Facility,Severity,Investigation Status,Standard Ref',
    ...(data.incidents || []).map(i =>
      `${i.date},${i.type},${i.facility},${i.severity},${i.investigationStatus},${i.standardRef}`
    ),
    '',
    '═══════════════════════════════════════════════════',
    'SECTION 4: PERSONNEL & CREDENTIALING',
    '═══════════════════════════════════════════════════',
    '',
    'Employee,Title,Department,Credentials OK,Training OK',
    ...(data.personnel || []).map(p =>
      `"${p.name}","${p.title}",${p.department},${p.credentialsComplete ? 'Yes' : 'No'},${p.trainingComplete ? 'Yes' : 'No'}`
    ),
    '',
    '═══════════════════════════════════════════════════',
    'SECTION 5: POLICY STATUS',
    '═══════════════════════════════════════════════════',
    '',
    'Policy,Category,Version,Owner,Next Review,Status',
    ...(data.policies || []).map(p =>
      `"${p.title}",${p.category},v${p.version},"${p.owner}",${p.nextReview},${p.status}`
    ),
    '',
    '═══════════════════════════════════════════════════',
    'SECTION 6: RECENT CHANGES (AUDIT TRAIL)',
    '═══════════════════════════════════════════════════',
    '',
    'Timestamp,User,Action,Entity,Record,Summary',
    ...(data.auditLog || []).slice(0, 100).map(a =>
      `${a.timestamp},"${a.userName}",${a.action},${a.entity},"${a.recordName}","${a.summary}"`
    ),
  ];

  downloadFile(
    lines.join('\n'),
    `ComplianceHub_Board_Report_${formatDateForFile(now)}.csv`,
    'text/csv'
  );
}

/**
 * Export regulatory change log for specific body (CARF/TJC/State)
 */
export function exportRegulatoryChangeLog(changes, body) {
  const filtered = body && body !== 'all'
    ? changes.filter(c => c.body?.toLowerCase().includes(body.toLowerCase()))
    : changes;

  exportToCSV(filtered, `Regulatory_Changes_${body || 'All'}_${formatDateForFile(new Date())}`, [
    { key: 'date', label: 'Effective Date' },
    { key: 'body', label: 'Regulatory Body' },
    { key: 'changeType', label: 'Change Type' },
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'impactedStandards', label: 'Impacted Standards' },
    { key: 'actionRequired', label: 'Action Required' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'status', label: 'Status' },
  ]);
}

// ── Helpers ──

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDateForFile(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}
