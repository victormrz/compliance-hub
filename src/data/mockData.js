// Mock data matching SharePoint lists — will be replaced with Graph API calls

export const facilities = [
  { id: 1, name: "Roaring Brook Recovery", type: "SUD Residential", address: "123 Recovery Ln, Lexington, KY", status: "Active", beds: 48, license: "AODE-2024-0412" },
  { id: 2, name: "Roaring Brook Outpatient", type: "IOP/PHP", address: "456 Wellness Dr, Lexington, KY", status: "Active", beds: 0, license: "AODE-2024-0413" },
  { id: 3, name: "Roaring Brook Sober Living", type: "Sober Living", address: "789 Hope Ave, Lexington, KY", status: "Active", beds: 24, license: "AODE-2024-0414" },
];

export const licenses = [
  { id: 1, name: "AODE License", facility: "Roaring Brook Recovery", type: "State License", issueDate: "2024-06-01", expirationDate: "2026-06-01", status: "Active", daysLeft: 445 },
  { id: 2, name: "CARF Accreditation", facility: "Roaring Brook Recovery", type: "Accreditation", issueDate: "2024-01-15", expirationDate: "2027-01-15", status: "Active", daysLeft: 673 },
  { id: 3, name: "Fire Marshal Permit", facility: "Roaring Brook Recovery", type: "Safety Permit", issueDate: "2025-03-01", expirationDate: "2026-03-31", status: "Critical", daysLeft: 18 },
  { id: 4, name: "Food Service Permit", facility: "Roaring Brook Recovery", type: "Health Permit", issueDate: "2024-01-10", expirationDate: "2026-01-10", status: "Expired", daysLeft: -62 },
  { id: 5, name: "DEA Registration", facility: "Roaring Brook Recovery", type: "Federal License", issueDate: "2024-07-01", expirationDate: "2027-07-01", status: "Active", daysLeft: 840 },
  { id: 6, name: "Business License", facility: "Roaring Brook Outpatient", type: "Business License", issueDate: "2025-01-01", expirationDate: "2026-12-31", status: "Active", daysLeft: 293 },
];

export const standards = [
  { id: 1, code: "HR.01.06.01", name: "Staff Competency Assessment", body: "The Joint Commission (TJC)", category: "Human Resources", evidenceRequired: ["Competency Checklists", "License Verifications", "Performance Evaluations"], status: "Active" },
  { id: 2, code: "EC.02.06.01", name: "Emergency Management Planning", body: "The Joint Commission (TJC)", category: "Environment of Care", evidenceRequired: ["Emergency Plan", "HVA Documentation", "Drill Records"], status: "Active" },
  { id: 3, code: "PC.01.02.01", name: "Patient Assessment & Reassessment", body: "The Joint Commission (TJC)", category: "Patient Care", evidenceRequired: ["Assessment Forms", "Clinical Notes", "Screening Tools"], status: "Active" },
  { id: 4, code: "RI.01.01.01", name: "Patient Rights & Responsibilities", body: "The Joint Commission (TJC)", category: "Rights & Ethics", evidenceRequired: ["Rights Handbook", "Signed Acknowledgments", "Grievance Logs"], status: "Active" },
  { id: 5, code: "1.K.1", name: "Personnel Qualifications", body: "CARF International", category: "Workforce Development", evidenceRequired: ["Job Descriptions", "License Copies", "Background Checks"], status: "Active" },
  { id: 6, code: "2.A.1", name: "Leadership and Governance", body: "CARF International", category: "Governance", evidenceRequired: ["Org Chart", "Bylaws", "Board Minutes", "Strategic Plan"], status: "Active" },
  { id: 7, code: "1.A.4", name: "Quality Improvement", body: "CARF International", category: "Quality", evidenceRequired: ["QI Plan", "Outcome Data", "Satisfaction Surveys"], status: "Active" },
  { id: 8, code: "42 CFR 2.31", name: "Patient Consent for Disclosure", body: "State Regulations", category: "Confidentiality", evidenceRequired: ["Consent Forms", "Disclosure Log", "Training Records"], status: "Active" },
  { id: 9, code: "902 KAR 20:036", name: "Residential Treatment Facility Standards", body: "State Regulations", category: "Operations", evidenceRequired: ["Policy Manual", "Staffing Records", "Inspection Reports"], status: "Active" },
  { id: 10, code: "45 CFR 164", name: "HIPAA Security Rule", body: "Federal (HIPAA)", category: "Information Security", evidenceRequired: ["Risk Assessment", "Security Policies", "BAA Agreements", "Training Logs"], status: "Active" },
];

export const complianceTasks = [
  { id: 1, task: "Annual Fire Drill Documentation", standardRef: "EC.02.06.01", body: "TJC", assignedTo: "Mike Johnson", dueDate: "2026-03-31", status: "In Progress", priority: "High", frequency: "Annual", year: "2026", category: "Inspection" },
  { id: 2, task: "Staff Competency Evaluations - Q1", standardRef: "HR.01.06.01", body: "TJC", assignedTo: "Sarah Williams", dueDate: "2026-03-15", status: "Overdue", priority: "Critical", frequency: "Quarterly", year: "2026", category: "Documentation" },
  { id: 3, task: "Update Patient Rights Handbook", standardRef: "RI.01.01.01", body: "TJC", assignedTo: "Jennifer Davis", dueDate: "2026-04-30", status: "Not Started", priority: "Medium", frequency: "Annual", year: "2026", category: "Policy Review" },
  { id: 4, task: "HIPAA Risk Assessment", standardRef: "45 CFR 164", body: "HIPAA", assignedTo: "Victor Rivera", dueDate: "2026-06-30", status: "Not Started", priority: "High", frequency: "Annual", year: "2026", category: "Audit" },
  { id: 5, task: "QI Committee Meeting Minutes", standardRef: "1.A.4", body: "CARF", assignedTo: "Jennifer Davis", dueDate: "2026-03-20", status: "Complete", priority: "Medium", frequency: "Monthly", year: "2026", category: "Documentation" },
  { id: 6, task: "Background Check Renewals", standardRef: "1.K.1", body: "CARF", assignedTo: "Sarah Williams", dueDate: "2026-04-15", status: "In Progress", priority: "High", frequency: "Annual", year: "2026", category: "Credentialing" },
  { id: 7, task: "Emergency Plan Review & Update", standardRef: "EC.02.06.01", body: "TJC", assignedTo: "Mike Johnson", dueDate: "2026-05-01", status: "Not Started", priority: "Medium", frequency: "Annual", year: "2026", category: "Policy Review" },
  { id: 8, task: "42 CFR Part 2 Training - All Staff", standardRef: "42 CFR 2.31", body: "State", assignedTo: "Sarah Williams", dueDate: "2026-03-30", status: "In Progress", priority: "High", frequency: "Annual", year: "2026", category: "Training" },
  { id: 9, task: "Patient Satisfaction Survey Analysis", standardRef: "1.A.4", body: "CARF", assignedTo: "Jennifer Davis", dueDate: "2026-04-30", status: "Not Started", priority: "Low", frequency: "Quarterly", year: "2026", category: "Quality Improvement" },
  { id: 10, task: "Renew Food Service Permit", standardRef: "902 KAR 20:036", body: "State", assignedTo: "Mike Johnson", dueDate: "2026-01-10", status: "Overdue", priority: "Critical", frequency: "Annual", year: "2026", category: "Inspection" },
];

export const staff = [
  { id: 1, name: "Victor Rivera", title: "Executive Director", department: "Management", hireDate: "2023-01-15", status: "Active", supervisor: null, credentialsComplete: true, trainingComplete: true, phone: "(859) 555-0100" },
  { id: 2, name: "Sarah Williams", title: "Clinical Director", department: "Clinical", hireDate: "2023-03-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: true, phone: "(859) 555-0101" },
  { id: 3, name: "Mike Johnson", title: "Facilities Manager", department: "Operations", hireDate: "2023-06-15", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: false, phone: "(859) 555-0102" },
  { id: 4, name: "Jennifer Davis", title: "Compliance Officer", department: "Compliance", hireDate: "2023-09-01", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: true, phone: "(859) 555-0103" },
  { id: 5, name: "David Chen", title: "Licensed Counselor (LPCC)", department: "Clinical", hireDate: "2024-01-15", status: "Active", supervisor: "Sarah Williams", credentialsComplete: true, trainingComplete: true, phone: "(859) 555-0104" },
  { id: 6, name: "Maria Santos", title: "Registered Nurse (RN)", department: "Nursing", hireDate: "2024-03-01", status: "Active", supervisor: "Sarah Williams", credentialsComplete: false, trainingComplete: true, phone: "(859) 555-0105" },
  { id: 7, name: "James Wilson", title: "Peer Support Specialist", department: "Peer Support", hireDate: "2024-06-01", status: "Active", supervisor: "Sarah Williams", credentialsComplete: true, trainingComplete: false, phone: "(859) 555-0106" },
  { id: 8, name: "Ashley Thompson", title: "Administrative Coordinator", department: "Administrative", hireDate: "2024-08-15", status: "Active", supervisor: "Victor Rivera", credentialsComplete: true, trainingComplete: true, phone: "(859) 555-0107" },
];

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

export const training = [
  { id: 1, course: "CPR/BLS Certification", category: "Safety", frequency: "Biannual", duration: "4 hrs", standardRefs: ["HR.01.06.01", "1.K.1"], status: "Active" },
  { id: 2, course: "Suicide Prevention & Assessment", category: "Clinical", frequency: "Annual", duration: "2 hrs", standardRefs: ["HR.01.06.01"], status: "Active" },
  { id: 3, course: "42 CFR Part 2 Confidentiality", category: "Compliance", frequency: "Annual", duration: "1.5 hrs", standardRefs: ["42 CFR 2.31"], status: "Active" },
  { id: 4, course: "HIPAA Privacy & Security", category: "Compliance", frequency: "Annual", duration: "2 hrs", standardRefs: ["HR.01.06.01", "45 CFR 164"], status: "Active" },
  { id: 5, course: "De-Escalation & Crisis Intervention", category: "Clinical", frequency: "Annual", duration: "4 hrs", standardRefs: ["HR.01.06.01"], status: "Active" },
  { id: 6, course: "Fire Safety & Emergency Response", category: "Safety", frequency: "Annual", duration: "1 hr", standardRefs: ["EC.02.06.01"], status: "Active" },
  { id: 7, course: "Trauma-Informed Care", category: "Clinical", frequency: "Annual", duration: "3 hrs", standardRefs: ["PC.01.02.01"], status: "Active" },
  { id: 8, course: "Medication Administration", category: "Clinical", frequency: "Annual", duration: "2 hrs", standardRefs: ["PC.01.02.01"], status: "Active" },
];

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

export const incidents = [
  { id: 1, date: "2026-01-31", type: "Fall", facility: "Roaring Brook Recovery", severity: "Minor", reportedBy: "Maria Santos", description: "Client slipped in bathroom", investigationStatus: "Resolved", correctiveAction: "Non-slip mats installed", resolutionDate: "2026-02-05", rootCause: "Wet floor", standardRef: "EC.02.06.01" },
  { id: 2, date: "2026-02-09", type: "Medication Error", facility: "Roaring Brook Recovery", severity: "Moderate", reportedBy: "Maria Santos", description: "Wrong dosage administered", investigationStatus: "Under Review", correctiveAction: "Double-check protocol implemented", resolutionDate: null, rootCause: null, standardRef: "PC.01.02.01" },
  { id: 3, date: "2026-02-04", type: "Self Harm", facility: "Roaring Brook Recovery", severity: "Critical", reportedBy: "David Chen", description: "Client self-harm attempt", investigationStatus: "RCA In Progress", correctiveAction: "Increased monitoring, ligature risk reassessment", resolutionDate: null, rootCause: null, standardRef: "PC.01.02.01" },
  { id: 4, date: "2026-03-01", type: "AMA/Elopement", facility: "Roaring Brook Recovery", severity: "Moderate", reportedBy: "James Wilson", description: "Client left AMA", investigationStatus: "Closed", correctiveAction: "Discharge protocols reviewed", resolutionDate: "2026-03-03", rootCause: "Inadequate engagement", standardRef: "RI.01.01.01" },
];

export const policies = [
  { id: 1, title: "Admission & Discharge Policy", category: "Clinical", version: "3.1", lastReviewed: "2025-11-15", nextReview: "2026-11-15", owner: "Sarah Williams", status: "Current", standardRefs: ["PC.01.02.01", "1.K.1"] },
  { id: 2, title: "Medication Management Policy", category: "Clinical", version: "2.4", lastReviewed: "2025-09-01", nextReview: "2026-09-01", owner: "Sarah Williams", status: "Current", standardRefs: ["PC.01.02.01"] },
  { id: 3, title: "HIPAA Privacy Policy", category: "Compliance", version: "4.0", lastReviewed: "2025-12-01", nextReview: "2026-12-01", owner: "Jennifer Davis", status: "Current", standardRefs: ["45 CFR 164", "42 CFR 2.31"] },
  { id: 4, title: "Emergency Operations Plan", category: "Safety", version: "2.1", lastReviewed: "2025-06-01", nextReview: "2026-06-01", owner: "Mike Johnson", status: "Review Due", standardRefs: ["EC.02.06.01"] },
  { id: 5, title: "Incident Reporting Policy", category: "Compliance", version: "1.8", lastReviewed: "2025-10-01", nextReview: "2026-10-01", owner: "Jennifer Davis", status: "Current", standardRefs: ["1.A.4"] },
  { id: 6, title: "Employee Handbook", category: "HR", version: "5.2", lastReviewed: "2025-01-01", nextReview: "2026-01-01", owner: "Victor Rivera", status: "Review Due", standardRefs: ["HR.01.06.01", "1.K.1"] },
  { id: 7, title: "Patient Rights & Grievance Policy", category: "Clinical", version: "2.0", lastReviewed: "2025-08-01", nextReview: "2026-08-01", owner: "Jennifer Davis", status: "Current", standardRefs: ["RI.01.01.01"] },
  { id: 8, title: "Infection Control Policy", category: "Safety", version: "1.5", lastReviewed: "2025-07-01", nextReview: "2026-07-01", owner: "Maria Santos", status: "Current", standardRefs: ["EC.02.06.01"] },
];

export const contracts = [
  { id: 1, vendor: "KIPU Health", type: "Software/SaaS", startDate: "2026-03-01", endDate: "2029-03-01", autoRenew: true, annualValue: 36000, status: "Active", owner: "Victor Rivera" },
  { id: 2, vendor: "Quest Diagnostics", type: "BAA", startDate: "2024-06-01", endDate: "2027-06-01", autoRenew: true, annualValue: 12000, status: "Active", owner: "Sarah Williams" },
  { id: 3, vendor: "Lexington Fire Protection", type: "Service Agreement", startDate: "2025-01-01", endDate: "2026-12-31", autoRenew: false, annualValue: 4800, status: "Active", owner: "Mike Johnson" },
  { id: 4, vendor: "Sysco Food Service", type: "Vendor", startDate: "2024-01-01", endDate: "2026-12-31", autoRenew: true, annualValue: 96000, status: "Active", owner: "Mike Johnson" },
  { id: 5, vendor: "SecureShred", type: "BAA", startDate: "2024-03-01", endDate: "2026-03-01", autoRenew: true, annualValue: 2400, status: "Expiring Soon", owner: "Jennifer Davis" },
];

// ── Regulatory Changes — tracks CARF, TJC, and State standard updates ──
export const regulatoryChanges = [
  { id: 1, date: '2026-01-15', body: 'CARF International', changeType: 'Standard Revision', title: 'Updated Quality Improvement Standards (1.A.4)', description: 'CARF revised QI outcome measurement requirements to include patient-reported outcome measures (PROMs).', impactedStandards: ['1.A.4'], actionRequired: 'Update QI plan to include validated PROM tool. Add PROM tracking to intake and discharge.', dueDate: '2026-06-30', assignedTo: 'Jennifer Davis', status: 'In Progress', priority: 'High', notes: 'PHQ-9 selected as primary PROM.' },
  { id: 2, date: '2026-02-01', body: 'The Joint Commission (TJC)', changeType: 'New Requirement', title: 'Behavioral Health Ligature Risk Requirements (EC.02.06.05)', description: 'TJC issued updated environmental risk assessment requirements effective July 2026.', impactedStandards: ['EC.02.06.01'], actionRequired: 'Conduct facility-wide ligature risk reassessment using new TJC matrix. Update CAPs.', dueDate: '2026-07-01', assignedTo: 'Mike Johnson', status: 'Not Started', priority: 'Critical', notes: 'New risk matrix from TJC Perspectives, Feb 2026.' },
  { id: 3, date: '2025-12-15', body: 'State Regulations', changeType: 'Regulation Amendment', title: 'KAR 902:20:036 — Staffing Ratio Update', description: 'Kentucky amended residential SUD staffing: minimum clinical ratio reduced from 1:10 to 1:8.', impactedStandards: ['902 KAR 20:036'], actionRequired: 'Review current staffing levels. Adjust daily staffing targets and policy.', dueDate: '2026-03-01', assignedTo: 'Victor Rivera', status: 'Complete', priority: 'High', notes: 'Staffing ratios updated in DailyStaffing page.' },
  { id: 4, date: '2026-03-01', body: 'The Joint Commission (TJC)', changeType: 'Clarification', title: 'Suicide Risk Assessment Frequency (PC.01.02.01)', description: 'TJC clarified suicide risk screening must be repeated at every care transition.', impactedStandards: ['PC.01.02.01'], actionRequired: 'Update clinical assessment workflow. Train clinical staff on new protocol.', dueDate: '2026-05-01', assignedTo: 'Sarah Williams', status: 'In Progress', priority: 'High', notes: 'C-SSRS will be used at all transitions.' },
  { id: 5, date: '2026-01-01', body: 'Federal (HIPAA)', changeType: 'Rule Change', title: '42 CFR Part 2 Alignment with HIPAA (Final Rule)', description: 'HHS finalized rule aligning 42 CFR Part 2 with HIPAA. SUD records can now be disclosed under HIPAA TPO exceptions.', impactedStandards: ['42 CFR 2.31', '45 CFR 164'], actionRequired: 'Update consent forms. Revise training materials. Update Notice of Privacy Practices.', dueDate: '2026-04-01', assignedTo: 'Jennifer Davis', status: 'In Progress', priority: 'Critical', notes: 'New consent forms drafted, pending approval.' },
  { id: 6, date: '2025-11-01', body: 'CARF International', changeType: 'Standard Revision', title: 'Workforce Development — Trauma-Informed Training (1.K.1)', description: 'CARF now requires documented trauma-informed care training within 30 days of hire.', impactedStandards: ['1.K.1'], actionRequired: 'Add TIC training to onboarding. Document in personnel records.', dueDate: '2026-02-01', assignedTo: 'Sarah Williams', status: 'Complete', priority: 'Medium', notes: 'TIC module added to LMS.' },
  { id: 7, date: '2026-03-10', body: 'State Regulations', changeType: 'New Requirement', title: 'AODE Reporting — Critical Incident Notification (24hr)', description: 'Kentucky AODE now requires critical incident reports within 24 hours via online portal.', impactedStandards: ['902 KAR 20:036'], actionRequired: 'Update incident reporting policy. Register for AODE portal. Train staff.', dueDate: '2026-04-15', assignedTo: 'Jennifer Davis', status: 'Not Started', priority: 'Critical', notes: 'Portal access requires facility admin registration.' },
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
  { id: 'audit-011', timestamp: '2026-03-06T10:00:00Z', action: 'Create', entity: 'RegulatoryChanges', recordId: '7', recordName: 'AODE 24hr Reporting', userName: 'Jennifer Davis', userEmail: 'jennifer.davis@roaringbrookrecovery.com', userRole: 'manager', changes: '{"body":"State Regulations","priority":"Critical"}', summary: 'Created new RegulatoryChange: AODE 24hr Reporting' },
  { id: 'audit-012', timestamp: '2026-03-05T09:00:00Z', action: 'Delete', entity: 'Standards', recordId: '11', recordName: 'Duplicate Standard Entry', userName: 'Victor Rivera', userEmail: 'victor@roaringbrookrecovery.com', userRole: 'admin', changes: '{"code":"TEMP.01"}', summary: 'Deleted Duplicate Standard Entry from Standards' },
];

// Dashboard computed values
export function getDashboardStats() {
  const expiredLicenses = licenses.filter(l => l.status === "Expired").length;
  const expiringSoon = licenses.filter(l => l.daysLeft > 0 && l.daysLeft <= 90).length;
  const openIncidents = incidents.filter(i => i.investigationStatus !== "Resolved" && i.investigationStatus !== "Closed").length;
  const overdueTrainings = trainingRecords.filter(t => t.status === "Overdue").length;
  const overdueTasks = complianceTasks.filter(t => t.status === "Overdue").length;
  const completedTasks = complianceTasks.filter(t => t.status === "Complete").length;
  const totalTasks = complianceTasks.length;

  const healthScore = Math.round(((completedTasks / totalTasks) * 40) + ((1 - (overdueTasks / totalTasks)) * 30) + ((1 - (expiredLicenses / licenses.length)) * 30));

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
  };
}
