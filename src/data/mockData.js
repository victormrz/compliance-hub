// Data layer — seeds from JSON, mock records for manually-provisioned entities
import seedStandards from './seeds/standards.json';
import seedPolicies from './seeds/policies.json';
import seedTraining from './seeds/training.json';
import seedTasks from './seeds/tasks.json';
import seedCrosswalk from './seeds/crosswalk.json';

// ── Facilities (manually provisioned by Victor) ──
export const facilities = [
  { id: 1, name: "Roaring Brook Recovery", type: "SUD Outpatient", address: "600 Perimeter Dr, Lexington, KY 40517", status: "Active", beds: 0, license: "AODE-2024-0412" },
];

// ── Licenses (mock — Victor provisions manually) ──
export const licenses = [
  { id: 1, name: "AODE License", facility: "Roaring Brook Recovery", type: "State License", issueDate: "2024-06-01", expirationDate: "2026-06-01", status: "Active", daysLeft: 445 },
  { id: 2, name: "CARF Accreditation", facility: "Roaring Brook Recovery", type: "Accreditation", issueDate: "2024-01-15", expirationDate: "2027-01-15", status: "Active", daysLeft: 673 },
  { id: 3, name: "Fire Marshal Permit", facility: "Roaring Brook Recovery", type: "Safety Permit", issueDate: "2025-03-01", expirationDate: "2026-03-31", status: "Critical", daysLeft: 18 },
  { id: 4, name: "DEA Registration", facility: "Roaring Brook Recovery", type: "Federal License", issueDate: "2024-07-01", expirationDate: "2027-07-01", status: "Active", daysLeft: 840 },
  { id: 5, name: "Business License", facility: "Roaring Brook Recovery", type: "Business License", issueDate: "2025-01-01", expirationDate: "2026-12-31", status: "Active", daysLeft: 293 },
];

// ── Standards (from seed JSON) ──
export const standards = seedStandards.map((s, i) => ({
  id: i + 1,
  code: s.code,
  name: s.name,
  body: s.body,
  category: s.category,
  evidenceRequired: s.evidenceRequired || [],
  status: s.status,
}));

// ── Policies (from seed JSON — add page-expected fields) ──
export const policies = seedPolicies.map((p, i) => ({
  id: i + 1,
  policyNumber: p.policyNumber,
  title: p.title,
  series: p.series,
  category: p.category,
  version: "1.0",
  lastReviewed: "2025-11-01",
  nextReview: "2026-11-01",
  owner: p.ownerRole,
  status: p.status,
  standardRefs: p.standardRefs || [],
}));

// ── Training / Courses (from seed JSON — map title → course) ──
export const training = seedTraining.map((t, i) => ({
  id: i + 1,
  course: t.title,
  category: t.category,
  frequency: t.frequency,
  duration: "TBD",
  providedTo: t.providedTo,
  competencyBased: t.competencyBased,
  standardRefs: t.standardRef ? [t.standardRef] : [],
  status: t.status,
}));

// ── Helper: calculate a due date from frequency ──
function calcDueDate(frequency, lastCompleted) {
  const base = lastCompleted ? new Date(lastCompleted) : new Date('2026-01-01');
  switch ((frequency || '').toLowerCase()) {
    case 'weekly': base.setDate(base.getDate() + 7); break;
    case 'biweekly': base.setDate(base.getDate() + 14); break;
    case 'monthly': base.setMonth(base.getMonth() + 1); break;
    case 'quarterly': base.setMonth(base.getMonth() + 3); break;
    case 'semiannual': base.setMonth(base.getMonth() + 6); break;
    case 'annual': base.setFullYear(base.getFullYear() + 1); break;
    default: base.setFullYear(base.getFullYear() + 1); break;
  }
  return base.toISOString().slice(0, 10);
}

// ── Compliance Tasks (from seed JSON — map title → task) ──
export const complianceTasks = seedTasks.map((t, i) => ({
  id: i + 1,
  task: t.title,
  standardRef: t.standardRef,
  body: t.body,
  assignedTo: t.assignedToRole,
  dueDate: calcDueDate(t.frequency, t.lastCompleted),
  status: t.status,
  priority: "Medium",
  frequency: t.frequency,
  policyRef: t.policyRef,
  taskCategory: t.taskCategory,
}));

// ── Crosswalk (new export from seed JSON) ──
export const crosswalk = seedCrosswalk;

// ── Staff (real roster — Roaring Brook Recovery at 600 Perimeter Dr) ──
export const staff = [
  // Salaried
  { id: 1, name: "Victor Rivera", title: "Executive Director", department: "Management", hireDate: "2023-01-15", status: "Active", supervisor: null, credentialsComplete: true, trainingComplete: true, employmentType: "Salaried" },
  { id: 2, name: "Alison Grigsby", title: "Staff", department: "Operations", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  { id: 3, name: "Amber Ramsay", title: "Staff", department: "Clinical", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  { id: 4, name: "Dave Thomas", title: "Staff", department: "Operations", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  { id: 5, name: "Harold Kantar", title: "Staff", department: "Clinical", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  { id: 6, name: "Hillary Nolan", title: "Staff", department: "Clinical", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  { id: 7, name: "Jarrod Chase", title: "Staff", department: "Operations", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  { id: 8, name: "Kara Brown-Flod", title: "Staff", department: "Clinical", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  { id: 9, name: "Keith Rapp", title: "Staff", department: "Operations", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  { id: 10, name: "Kelsey Hess", title: "Staff", department: "Administrative", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  { id: 11, name: "Matthew Otto", title: "Staff", department: "Clinical", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  { id: 12, name: "Rebecca Milton", title: "Staff", department: "Administrative", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  { id: 13, name: "Tiffany Spradlin", title: "Staff", department: "Clinical", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  { id: 14, name: "Laurel Yoder", title: "Staff", department: "Clinical", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  { id: 15, name: "Mercedes Hensley", title: "Staff", department: "Operations", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, employmentType: "Salaried" },
  // Hourly
  { id: 16, name: "Carl Quick", title: "Staff", department: "Operations", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: false, trainingComplete: false, employmentType: "Hourly" },
  { id: 17, name: "Mary Henson", title: "Staff", department: "Operations", hireDate: "2024-01-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: false, trainingComplete: false, employmentType: "Hourly" },
];

// ── Credentials (mock — Victor provisions manually) ──
export const credentials = [
  { id: 1, employee: "Sarah Williams", type: "LPCC License", issuingBody: "KY BSLE", number: "LPCC-12345", issueDate: "2024-01-01", expirationDate: "2026-12-31", status: "Active", daysLeft: 293 },
  { id: 2, employee: "David Chen", type: "LPCC License", issuingBody: "KY BSLE", number: "LPCC-67890", issueDate: "2024-06-01", expirationDate: "2026-06-01", status: "Active", daysLeft: 445 },
  { id: 3, employee: "Maria Santos", type: "RN License", issuingBody: "KY Board of Nursing", number: "RN-2024-5678", issueDate: "2024-03-01", expirationDate: "2026-03-31", status: "Critical", daysLeft: 18 },
  { id: 4, employee: "Maria Santos", type: "CPR/BLS Certification", issuingBody: "AHA", number: "BLS-9012", issueDate: "2024-06-01", expirationDate: "2026-06-01", status: "Active", daysLeft: 445 },
  { id: 5, employee: "James Wilson", type: "Peer Support Certification", issuingBody: "KY DBHDID", number: "PSS-3456", issueDate: "2024-06-01", expirationDate: "2026-06-01", status: "Active", daysLeft: 445 },
  { id: 6, employee: "Sarah Williams", type: "NPI Number", issuingBody: "CMS", number: "1234567890", issueDate: "2023-01-01", expirationDate: null, status: "Active", daysLeft: null },
  { id: 7, employee: "David Chen", type: "CAQH Profile", issuingBody: "CAQH", number: "CAQH-11223", issueDate: "2024-01-15", expirationDate: "2026-07-15", status: "Active", daysLeft: 489 },
  { id: 8, employee: "Mike Johnson", type: "CPR/BLS Certification", issuingBody: "AHA", number: "BLS-4455", issueDate: "2024-01-01", expirationDate: "2026-01-01", status: "Expired", daysLeft: -71 },
];

// ── Training Records (mock — links employees to courses) ──
export const trainingRecords = [
  { id: 1, employee: "Sarah Williams", course: "HIPAA Privacy & Security", dueDate: "2026-04-15", completedDate: "2026-02-10", status: "Completed", year: "2026" },
  { id: 2, employee: "Sarah Williams", course: "42 CFR Part 2 Confidentiality", dueDate: "2026-04-15", completedDate: null, status: "In Progress", year: "2026" },
  { id: 3, employee: "Mike Johnson", course: "Fire Safety & Emergency Response", dueDate: "2026-03-31", completedDate: null, status: "Overdue", year: "2026" },
  { id: 4, employee: "David Chen", course: "Suicide Prevention & Assessment", dueDate: "2026-05-01", completedDate: "2026-01-20", status: "Completed", year: "2026" },
  { id: 5, employee: "Maria Santos", course: "CPR/BLS Certification", dueDate: "2026-06-01", completedDate: null, status: "Not Started", year: "2026" },
  { id: 6, employee: "James Wilson", course: "De-Escalation & Crisis Intervention", dueDate: "2026-04-30", completedDate: null, status: "In Progress", year: "2026" },
  { id: 7, employee: "Jennifer Davis", course: "HIPAA Privacy & Security", dueDate: "2026-04-15", completedDate: "2026-03-01", status: "Completed", year: "2026" },
  { id: 8, employee: "Ashley Thompson", course: "HIPAA Privacy & Security", dueDate: "2026-04-15", completedDate: null, status: "Not Started", year: "2026" },
];

// ── Incidents (mock) ──
export const incidents = [
  { id: 1, date: "2026-01-31", type: "Fall", facility: "Roaring Brook Recovery", severity: "Minor", reportedBy: "Maria Santos", description: "Client slipped in bathroom", investigationStatus: "Resolved", correctiveAction: "Non-slip mats installed", resolutionDate: "2026-02-05", rootCause: "Wet floor", standardRef: "EC.02.06.01" },
  { id: 2, date: "2026-02-09", type: "Medication Error", facility: "Roaring Brook Recovery", severity: "Moderate", reportedBy: "Maria Santos", description: "Wrong dosage administered", investigationStatus: "Under Review", correctiveAction: "Double-check protocol implemented", resolutionDate: null, rootCause: null, standardRef: "PC.01.02.01" },
  { id: 3, date: "2026-02-04", type: "Self Harm", facility: "Roaring Brook Recovery", severity: "Critical", reportedBy: "David Chen", description: "Client self-harm attempt", investigationStatus: "RCA In Progress", correctiveAction: "Increased monitoring, ligature risk reassessment", resolutionDate: null, rootCause: null, standardRef: "PC.01.02.01" },
  { id: 4, date: "2026-03-01", type: "AMA/Elopement", facility: "Roaring Brook Recovery", severity: "Moderate", reportedBy: "James Wilson", description: "Client left AMA", investigationStatus: "Closed", correctiveAction: "Discharge protocols reviewed", resolutionDate: "2026-03-03", rootCause: "Inadequate engagement", standardRef: "RI.01.01.01" },
];

// ── Contracts (mock) ──
export const contracts = [
  { id: 1, vendor: "KIPU Health", type: "Software/SaaS", startDate: "2026-03-01", endDate: "2029-03-01", autoRenew: true, annualValue: 36000, status: "Active", owner: "Victor Rivera" },
  { id: 2, vendor: "Quest Diagnostics", type: "BAA", startDate: "2024-06-01", endDate: "2027-06-01", autoRenew: true, annualValue: 12000, status: "Active", owner: "Sarah Williams" },
  { id: 3, vendor: "Lexington Fire Protection", type: "Service Agreement", startDate: "2025-01-01", endDate: "2026-12-31", autoRenew: false, annualValue: 4800, status: "Active", owner: "Mike Johnson" },
  { id: 4, vendor: "Sysco Food Service", type: "Vendor", startDate: "2024-01-01", endDate: "2026-12-31", autoRenew: true, annualValue: 96000, status: "Active", owner: "Mike Johnson" },
  { id: 5, vendor: "SecureShred", type: "BAA", startDate: "2024-03-01", endDate: "2026-03-01", autoRenew: true, annualValue: 2400, status: "Expiring Soon", owner: "Jennifer Davis" },
];

// ── Regulatory Changes — tracks CARF, TJC, KY-DBHDID, and Federal updates ──
export const regulatoryChanges = [
  { id: 1, date: '2026-01-15', body: 'CARF', changeType: 'Standard Revision', title: 'Updated Quality Improvement Standards (1.A.4)', description: 'CARF revised QI outcome measurement requirements to include patient-reported outcome measures (PROMs).', impactedStandards: ['1.A.4'], actionRequired: 'Update QI plan to include validated PROM tool. Add PROM tracking to intake and discharge.', dueDate: '2026-06-30', assignedTo: 'Jennifer Davis', status: 'In Progress', priority: 'High', notes: 'PHQ-9 selected as primary PROM.' },
  { id: 2, date: '2026-02-01', body: 'TJC', changeType: 'New Requirement', title: 'Behavioral Health Ligature Risk Requirements (EC.02.06.05)', description: 'TJC issued updated environmental risk assessment requirements effective July 2026.', impactedStandards: ['EC.02.06.01'], actionRequired: 'Conduct facility-wide ligature risk reassessment using new TJC matrix. Update CAPs.', dueDate: '2026-07-01', assignedTo: 'Mike Johnson', status: 'Not Started', priority: 'Critical', notes: 'New risk matrix from TJC Perspectives, Feb 2026.' },
  { id: 3, date: '2025-12-15', body: 'KY-DBHDID', changeType: 'Regulation Amendment', title: '908 KAR 1:370 — Staffing Ratio Update', description: 'Kentucky amended residential SUD staffing: minimum clinical ratio reduced from 1:10 to 1:8.', impactedStandards: ['908 KAR 1:370'], actionRequired: 'Review current staffing levels. Adjust daily staffing targets and policy.', dueDate: '2026-03-01', assignedTo: 'Victor Rivera', status: 'Complete', priority: 'High', notes: 'Staffing ratios updated in DailyStaffing page.' },
  { id: 4, date: '2026-03-01', body: 'TJC', changeType: 'Clarification', title: 'Suicide Risk Assessment Frequency (PC.01.02.01)', description: 'TJC clarified suicide risk screening must be repeated at every care transition.', impactedStandards: ['PC.01.02.01'], actionRequired: 'Update clinical assessment workflow. Train clinical staff on new protocol.', dueDate: '2026-05-01', assignedTo: 'Sarah Williams', status: 'In Progress', priority: 'High', notes: 'C-SSRS will be used at all transitions.' },
  { id: 5, date: '2026-01-01', body: 'Federal', changeType: 'Rule Change', title: '42 CFR Part 2 Alignment with HIPAA (Final Rule)', description: 'HHS finalized rule aligning 42 CFR Part 2 with HIPAA. SUD records can now be disclosed under HIPAA TPO exceptions.', impactedStandards: ['42 CFR 2.31', '45 CFR 164'], actionRequired: 'Update consent forms. Revise training materials. Update Notice of Privacy Practices.', dueDate: '2026-04-01', assignedTo: 'Jennifer Davis', status: 'In Progress', priority: 'Critical', notes: 'New consent forms drafted, pending approval.' },
  { id: 6, date: '2025-11-01', body: 'CARF', changeType: 'Standard Revision', title: 'Workforce Development — Trauma-Informed Training (1.K.1)', description: 'CARF now requires documented trauma-informed care training within 30 days of hire.', impactedStandards: ['1.K.1'], actionRequired: 'Add TIC training to onboarding. Document in personnel records.', dueDate: '2026-02-01', assignedTo: 'Sarah Williams', status: 'Complete', priority: 'Medium', notes: 'TIC module added to LMS.' },
  { id: 7, date: '2026-03-10', body: 'KY-DBHDID', changeType: 'New Requirement', title: 'AODE Reporting — Critical Incident Notification (24hr)', description: 'Kentucky AODE now requires critical incident reports within 24 hours via online portal.', impactedStandards: ['908 KAR 1:370'], actionRequired: 'Update incident reporting policy. Register for AODE portal. Train staff.', dueDate: '2026-04-15', assignedTo: 'Jennifer Davis', status: 'Not Started', priority: 'Critical', notes: 'Portal access requires facility admin registration.' },
];

// ── Evidence Documents ──
export const evidence = [
  { id: 1, documentName: "Cultural Competency Plan 2024", standardCode: "1.A.5.a", standardName: "Cultural competency and diversity plan", status: "Current", location: "CARF 2025/1A - Leadership", lastUpdated: "2024-06-01", uploadedBy: "Victor Rivera", notes: "" },
  { id: 2, documentName: "Emergency Operations Plan", standardCode: "EC.02.06.01", standardName: "Emergency management planning activities", status: "Current", location: "TJC/EC - Environment of Care", lastUpdated: "2025-08-15", uploadedBy: "Mike Johnson", notes: "Updated after annual review" },
  { id: 3, documentName: "HIPAA Privacy Training Records", standardCode: "45 CFR 164.530", standardName: "Administrative requirements - Training", status: "Current", location: "Federal/HIPAA Training", lastUpdated: "2026-02-10", uploadedBy: "Jennifer Davis", notes: "" },
  { id: 4, documentName: "Fire Drill Logs Q1 2026", standardCode: "1.H.7", standardName: "Fire safety and emergency drills", status: "Current", location: "CARF 2025/1H - Health & Safety", lastUpdated: "2026-03-01", uploadedBy: "Mike Johnson", notes: "Quarterly drill documentation" },
  { id: 5, documentName: "Suicide Risk Assessment Protocol", standardCode: "PC.01.02.01", standardName: "Suicide risk screening and assessment", status: "Under Review", location: "TJC/PC - Provision of Care", lastUpdated: "2025-12-15", uploadedBy: "Sarah Williams", notes: "Updating per new TJC clarification" },
  { id: 6, documentName: "Staffing Ratio Documentation", standardCode: "908 KAR 1:370", standardName: "Residential staffing requirements", status: "Current", location: "State/KY-DBHDID", lastUpdated: "2026-01-15", uploadedBy: "Victor Rivera", notes: "Updated for new 1:8 ratio" },
  { id: 7, documentName: "Medication Management Policy", standardCode: "PC.01.02.01", standardName: "Medication management protocols", status: "Outdated", location: "TJC/PC - Provision of Care", lastUpdated: "2024-09-01", uploadedBy: "Maria Santos", notes: "Needs revision per latest formulary changes" },
  { id: 8, documentName: "42 CFR Part 2 Consent Forms", standardCode: "42 CFR 2.31", standardName: "Consent for disclosure requirements", status: "Under Review", location: "Federal/42 CFR Part 2", lastUpdated: "2026-02-20", uploadedBy: "Jennifer Davis", notes: "New forms drafted for HIPAA alignment" },
  { id: 9, documentName: "Ligature Risk Assessment Report", standardCode: "EC.02.06.01", standardName: "Environmental risk assessment", status: "Missing", location: "", lastUpdated: "", uploadedBy: "", notes: "Needs completion per new TJC requirements" },
  { id: 10, documentName: "Trauma-Informed Care Training Certificates", standardCode: "1.K.1", standardName: "Workforce development - Trauma-informed training", status: "Current", location: "CARF 2025/1K - Workforce", lastUpdated: "2026-01-20", uploadedBy: "Sarah Williams", notes: "All staff completed TIC module" },
  { id: 11, documentName: "Infection Control Plan", standardCode: "1.H.12", standardName: "Infection prevention and control", status: "Current", location: "CARF 2025/1H - Health & Safety", lastUpdated: "2025-07-20", uploadedBy: "Maria Santos", notes: "" },
  { id: 12, documentName: "Patient Rights & Grievance Procedure", standardCode: "RI.01.01.01", standardName: "Patient rights information", status: "Outdated", location: "TJC/RI - Rights & Responsibilities", lastUpdated: "2024-05-10", uploadedBy: "Jennifer Davis", notes: "Annual revision overdue" },
  { id: 13, documentName: "AODE Critical Incident Reports", standardCode: "908 KAR 1:370", standardName: "Critical incident notification requirements", status: "Missing", location: "", lastUpdated: "", uploadedBy: "", notes: "New requirement — portal registration pending" },
  { id: 14, documentName: "Quality Improvement Plan 2026", standardCode: "1.A.4", standardName: "Quality improvement outcome measurement", status: "Under Review", location: "CARF 2025/1A - Leadership", lastUpdated: "2026-02-28", uploadedBy: "Jennifer Davis", notes: "Adding PROM tracking per CARF revision" },
  { id: 15, documentName: "DEA Registration Certificate", standardCode: "21 CFR 1301", standardName: "DEA registration for controlled substances", status: "Current", location: "Federal/DEA", lastUpdated: "2024-07-01", uploadedBy: "Victor Rivera", notes: "Valid through 2027" },
];

// ── Mock Audit Log ──
export const auditLog = [
  { id: 'audit-001', timestamp: '2026-03-13T08:15:00Z', action: 'Create', entity: 'Incidents', recordId: '4', recordName: 'AMA/Elopement', userName: 'James Wilson', userEmail: 'james.wilson@roaringbrookrecovery.com', userRole: 'end_user', changes: '{"type":"AMA/Elopement","severity":"Moderate"}', summary: 'Created new Incident: AMA/Elopement' },
  { id: 'audit-002', timestamp: '2026-03-12T14:30:00Z', action: 'Update', entity: 'Standards', recordId: '1', recordName: 'Staff Competency Assessment', userName: 'Jennifer Davis', userEmail: 'jennifer.davis@roaringbrookrecovery.com', userRole: 'manager', changes: '{"evidenceRequired":{"old":["Competency Checklists","License Verifications"],"new":["Competency Checklists","License Verifications","Performance Evaluations"]}}', summary: 'Updated Staff Competency Assessment in Standards (1 field changed)' },
  { id: 'audit-003', timestamp: '2026-03-12T10:00:00Z', action: 'Create', entity: 'DailyStaffing', recordId: 'local-1710230400', recordName: 'Day Shift - 2026-03-12', userName: 'Victor Rivera', userEmail: 'victor@roaringbrookrecovery.com', userRole: 'admin', changes: '{"shift":"Day","clients":30,"clinical":3}', summary: 'Created new DailyStaffing: Day Shift - 2026-03-12' },
  { id: 'audit-004', timestamp: '2026-03-11T16:45:00Z', action: 'Update', entity: 'Policies', recordId: '3', recordName: 'HIPAA Privacy Policy', userName: 'Jennifer Davis', userEmail: 'jennifer.davis@roaringbrookrecovery.com', userRole: 'manager', changes: '{"version":{"old":"3.9","new":"4.0"}}', summary: 'Updated HIPAA Privacy Policy in Policies (1 field changed)' },
  { id: 'audit-005', timestamp: '2026-03-11T09:20:00Z', action: 'Update', entity: 'Incidents', recordId: '2', recordName: 'Medication Error', userName: 'Sarah Williams', userEmail: 'sarah.williams@roaringbrookrecovery.com', userRole: 'manager', changes: '{"investigationStatus":{"old":"RCA In Progress","new":"Under Review"}}', summary: 'Updated Medication Error in Incidents (1 field changed)' },
  { id: 'audit-006', timestamp: '2026-03-10T13:00:00Z', action: 'Create', entity: 'Personnel', recordId: '8', recordName: 'Ashley Thompson', userName: 'Victor Rivera', userEmail: 'victor@roaringbrookrecovery.com', userRole: 'admin', changes: '{"name":"Ashley Thompson","title":"Administrative Coordinator"}', summary: 'Created new Personnel: Ashley Thompson' },
  { id: 'audit-007', timestamp: '2026-03-10T11:30:00Z', action: 'Update', entity: 'Credentials', recordId: '3', recordName: 'Maria Santos - RN License', userName: 'Sarah Williams', userEmail: 'sarah.williams@roaringbrookrecovery.com', userRole: 'manager', changes: '{"status":{"old":"Active","new":"Critical"}}', summary: 'Updated Maria Santos - RN License in Credentials (1 field changed)' },
  { id: 'audit-008', timestamp: '2026-03-09T15:10:00Z', action: 'Create', entity: 'EOCInspections', recordId: '3', recordName: 'Safety Walkthrough - March', userName: 'Mike Johnson', userEmail: 'mike.johnson@roaringbrookrecovery.com', userRole: 'end_user', changes: '{"type":"Safety Walkthrough","area":"All Areas"}', summary: 'Created new EOCInspection: Safety Walkthrough - March' },
  { id: 'audit-009', timestamp: '2026-03-08T08:45:00Z', action: 'Update', entity: 'RegulatoryChanges', recordId: '3', recordName: 'KAR Staffing Update', userName: 'Victor Rivera', userEmail: 'victor@roaringbrookrecovery.com', userRole: 'admin', changes: '{"status":{"old":"In Progress","new":"Complete"}}', summary: 'Updated KAR Staffing Update status to Complete' },
  { id: 'audit-010', timestamp: '2026-03-07T14:20:00Z', action: 'Update', entity: 'Training', recordId: '1', recordName: 'CPR/BLS Certification', userName: 'Sarah Williams', userEmail: 'sarah.williams@roaringbrookrecovery.com', userRole: 'manager', changes: '{"duration":{"old":"3 hrs","new":"4 hrs"}}', summary: 'Updated CPR/BLS Certification duration in Training' },
  { id: 'audit-011', timestamp: '2026-03-06T10:00:00Z', action: 'Create', entity: 'RegulatoryChanges', recordId: '7', recordName: 'AODE 24hr Reporting', userName: 'Jennifer Davis', userEmail: 'jennifer.davis@roaringbrookrecovery.com', userRole: 'manager', changes: '{"body":"KY-DBHDID","priority":"Critical"}', summary: 'Created new RegulatoryChange: AODE 24hr Reporting' },
  { id: 'audit-012', timestamp: '2026-03-05T09:00:00Z', action: 'Delete', entity: 'Standards', recordId: '11', recordName: 'Duplicate Standard Entry', userName: 'Victor Rivera', userEmail: 'victor@roaringbrookrecovery.com', userRole: 'admin', changes: '{"code":"TEMP.01"}', summary: 'Deleted Duplicate Standard Entry from Standards' },
];

// ── Dashboard computed values ──
export function getDashboardStats() {
  const expiredLicenses = licenses.filter(l => l.status === "Expired").length;
  const expiringSoon = licenses.filter(l => l.daysLeft > 0 && l.daysLeft <= 90).length;
  const openIncidents = incidents.filter(i => i.investigationStatus !== "Resolved" && i.investigationStatus !== "Closed").length;
  const overdueTrainings = trainingRecords.filter(t => t.status === "Overdue").length;
  const overdueTasks = complianceTasks.filter(t => t.status === "Overdue").length;
  const completedTasks = complianceTasks.filter(t => t.status === "Complete").length;
  const totalTasks = complianceTasks.length;

  const healthScore = totalTasks > 0
    ? Math.round(((completedTasks / totalTasks) * 40) + ((1 - (overdueTasks / totalTasks)) * 30) + ((1 - (expiredLicenses / licenses.length)) * 30))
    : 0;

  return {
    healthScore,
    expiredLicenses,
    expiringSoon,
    openIncidents,
    overdueTrainings,
    overdueTasks,
    completedTasks,
    totalTasks,
    activeFacilities: facilities.length,
    activeLicenses: licenses.filter(l => l.status === "Active").length,
    activeStaff: staff.filter(s => s.status === "Active").length,
    criticalIncidents: incidents.filter(i => i.severity === "Critical").length,
    totalStandards: standards.length,
    totalPolicies: policies.length,
    totalTraining: training.length,
  };
}
