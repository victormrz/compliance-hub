# ComplianceHub — SharePoint List Schema Map v2
> Revised 2026-03-13 after analyzing CARF 2025 production folder (514 files)
> Incorporates: Assignment Sheet, Appendix A (Required Docs), Appendix B (Timelines), Appendix C (Training)

---

## KEY CHANGES FROM v1
1. **Added Crosswalk list** — maps CARF standards ↔ policies ↔ training requirements
2. **Added ProgramApplicability list** — tags which LOC each standard applies to
3. **Enhanced Training** with Appendix C fields (ProvidedTo, CompetencyBased)
4. **Added PolicyNumber** field to Policies (HR-XX, TS-XX numbering)
5. **Added Evidence list** — tracks documents as proof of compliance per standard
6. **Fixed KAR references** — 908 KAR 1:370/372, NOT 902 KAR 20:036
7. **Standards split** into CARF sections (1.A-1.N, 2.A-2.H, 3.M/3.O/3.P) and TJC chapters

---

## RELATIONSHIP DIAGRAM

```
STANDARDS (master reference — CARF, TJC, State, Federal)
    ^              ^              ^              ^
    |              |              |              |
  CROSSWALK ------+-----> POLICIES     PROGRAM APPLICABILITY
    |              |         |              |
    |              |         | PolicyNumber  | program (RT, IOP, PHP, CH)
    |              v         v              |
    +--------> TRAINING COURSES            |
    |              |                        |
    | standardRef  | (course)              |
    v              v                        |
COMPLIANCE    TRAINING                     |
  TASKS       RECORDS -----> PERSONNEL <---+
    |                           |
    | assignedToRole            | credentials
    v                           v
  (Role-based)              CREDENTIALS

FACILITIES <---- facility ---- LICENSES
                                INCIDENTS
                                EOC INSPECTIONS
                                LIGATURE RISK
                                DAILY STAFFING

EVIDENCE ----> STANDARDS (proof documents per sub-standard)

REGULATORY CHANGES ---> STANDARDS
AUDIT LOG (auto-generated)
CONTRACTS (standalone)
```

---

## LIST 1: Standards
> Master reference — all CARF, TJC, State, Federal requirements
> NOTE: Standards are reference data, loaded once and updated ~annually when manuals change

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title (code) | Single line text | Yes | `1.H.4` | CARF: Section.Subsection.Standard. TJC: Chapter.Major.Minor.Sub |
| StandardName | Single line text | Yes | `Health and Safety Training` | |
| Body | Choice | Yes | `CARF` | Choices: CARF, TJC, KY-DBHDID, Federal-HIPAA, Federal-42CFR2 |
| Section | Single line text | Yes | `1.H` | CARF section or TJC chapter |
| Category | Single line text | Yes | `Health and Safety` | |
| RequirementType | Choice | No | `Training` | Choices: Documentation, Training, Inspection, Policy, Reporting, Assessment |
| EvidenceRequired | Multi-line text | No | `Training records; Competency checklists` | Semicolon-delimited |
| Status | Choice | Yes | `Active` | Choices: Active, Inactive, Under Review |

**Real data sources:**
- CARF: Appendix A (Required Docs), Appendix B (Timelines), Appendix C (Training) — ~150 distinct standards referenced
- TJC: EC, HR, PC, RI, LD, PI, IM chapters
- State: 908 KAR 1:370 (general AODE) + 908 KAR 1:372 (residential)
- Federal: 45 CFR 164 (HIPAA) + 42 CFR Part 2 (SUD confidentiality)

---

## LIST 2: Crosswalk
> Maps equivalent requirements across frameworks + links to policies and training
> This is the critical layer that prevents duplicating compliance work

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title | Single line text | Yes | `Fire Safety Training` | Human-readable requirement description |
| CARFStandard | Single line text | No | `1.H.4` | CARF standard code |
| TJCStandard | Single line text | No | `EC.02.06.01` | TJC standard code |
| StateRegulation | Single line text | No | `908 KAR 1:370 §3(2)` | KY regulation cite |
| FederalRegulation | Single line text | No | | Federal regulation cite |
| PolicyRef | Single line text | No | `HR-20` | Policy number that satisfies this |
| TrainingRef | Single line text | No | `Health and Safety Training` | Training course that satisfies this |
| TaskRef | Single line text | No | `Annual Fire Drill Documentation` | Recurring task that satisfies this |
| RequirementCategory | Choice | Yes | `Safety` | Choices: Safety, Clinical, HR, Privacy, Documentation, Quality, Rights, Access |

**Why this matters:** When CARF surveyor asks about 1.H.4 and TJC asks about EC.02.06.01, staff can see they're the same requirement satisfied by the same policy (HR-20) and same training. One action, multiple boxes checked.

---

## LIST 3: ProgramApplicability
> Tags which programs/LOC each standard applies to
> A standard can apply to multiple programs

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title | Single line text | Yes | `1.H.4 - RT` | Standard + Program combo |
| StandardRef | Single line text | Yes | `1.H.4` | Links to Standards.Title |
| Program | Choice | Yes | `Residential Treatment` | Choices: Residential Treatment (3.5), IOP (2.1), PHP (2.5), Collegiate Housing, All Programs |
| ASAMLevel | Single line text | No | `3.5` | ASAM level if applicable |
| CARFSection | Choice | No | `Section 3.P` | Choices: Section 1 (all), Section 2 (all), Section 3.M (IOP), Section 3.O (OT), Section 3.P (PH) |
| Notes | Multi-line text | No | | Program-specific implementation notes |

**Real data:** CARF Section 1 and 2 apply to ALL programs. Section 3 is program-specific:
- 3.M = IOP (6 evidence files in folder)
- 3.O = Outpatient (2 evidence files)
- 3.P = Partial Hospitalization/PHP (7 evidence files)

---

## LIST 4: Policies
> Policy register — 62 existing policies (28 HR + 31 TS + 3 misc)

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title | Single line text | Yes | `Fire Drill Emergency Evacuation Plan` | Full policy name |
| PolicyNumber | Single line text | Yes | `HR-20` | HR-XX or TS-XX numbering from existing system |
| PolicySeries | Choice | Yes | `HR` | Choices: HR (Human Resources/Admin), TS (Treatment Services/Clinical) |
| Category | Choice | Yes | `Safety` | Choices: Clinical, Compliance, Safety, HR, Administrative, Financial, Technology, Rights |
| Version | Single line text | No | `3.1` | |
| LastReviewed | Date | No | `2025-11-15` | |
| NextReview | Date | Yes | `2026-11-15` | |
| OwnerRole | Choice | Yes | `Safety Officer` | Role-based, not person names. Choices: Executive Director, Clinical Director, Compliance Officer, Safety Officer, HR Director, Medical Director, Nursing Director, IT Director, QI Coordinator |
| Status | Choice | Yes | `Current` | Choices: Current, Review Due, Draft, Archived |
| StandardRefs | Single line text | No | `1.H.5; EC.02.06.01` | Semicolon-delimited standard codes this policy satisfies |

**Real data (from Policies & Procedures folder):**
- HR-00 through HR-28: Mission, Dress Code, Attendance, Tobacco, Orientation, Infection Prevention, Code of Conduct, Social Media, Employment of Family/Felons, Workflow, Release of Info, Drug Testing, Outreach, Emergency Response, Volunteers, Corporate Compliance, Strategic Plan, Internal Controls, Risk Management, Technology, Fire Drill, H&S Inspection, Hazardous Waste, Supervision, Workforce Planning, Grievance, Secure Building, Evaluations, Legal Requirements
- TS-01 through TS-31: Rights/Grievance, Duty to Warn, Admission/Consent, Drug Testing, Programming, Mandated Reporting, Intake, Discharge, Confidentiality, Privacy, Drug-Free Environment, QI, Treatment Planning, Medication Storage, Critical Incidents, Med Errors, Referrals, Surveys, Clinical Records, MAT, Behavior Modification, Special Treatment, Unsafe Behavior, Attendance, Ethics/Boundaries, Telehealth, Case Management, Input from Served, Cell Phones, Sleeping in Group, Neurofeedback
- Plus: COVID Policy, Cultural Competency Plan, Org Chart, Table of Contents

---

## LIST 5: ComplianceTasks
> Scheduled recurring tasks from Appendix B (46 tasks) + Assignment Sheet (45 tasks)
> Role-based assignment, not individual names

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title | Single line text | Yes | `Annual Fire Drill Documentation` | |
| StandardRef | Single line text | Yes | `1.H.5` | Primary standard code |
| Body | Choice | Yes | `CARF` | Choices: CARF, TJC, State, Federal |
| AssignedToRole | Choice | Yes | `Safety Officer` | Same role choices as Policies.OwnerRole |
| DueDate | Date | Yes | `2026-03-31` | Next due date |
| Status | Choice | Yes | `In Progress` | Choices: Not Started, In Progress, Complete, Overdue |
| Priority | Choice | Yes | `High` | Choices: Critical, High, Medium, Low |
| Frequency | Choice | Yes | `Annual` | Choices: Annual, Semi-Annual, Quarterly, Monthly, Bi-Weekly, Weekly, Org-Determined, One-Time |
| LastCompleted | Date | No | `2025-03-15` | From Appendix B "Last Occurrence" |
| PolicyRef | Single line text | No | `HR-20` | Related policy number |
| TaskCategory | Choice | No | `Inspection` | Choices: Inspection, Documentation, Policy Review, Audit, Training, Credentialing, Quality Improvement, Reporting, Assessment |
| EvidenceLocation | Single line text | No | `Section 1H/1.H.5` | Folder path in CARF 2025 where evidence lives |

**Real frequency distribution (from Appendix B):**
- Annual: 30 tasks
- Semi-Annual: 1
- Quarterly: 2
- Monthly: 2
- Bi-Weekly: 1
- Weekly: 1
- Org-Determined: 9

---

## LIST 6: Training
> Training course catalog — maps to Appendix C (23 required training items)

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title | Single line text | Yes | `Health and Safety Training` | |
| StandardRef | Single line text | Yes | `1.H.4` | Primary CARF/TJC standard |
| Category | Choice | Yes | `Safety` | Choices: Safety, Clinical, Compliance, HR, Leadership, Technology |
| ProvidedTo | Choice | Yes | `Personnel` | From Appendix C. Choices: Personnel, Persons Served, Personnel and Persons Served, Volunteers, All Stakeholders |
| CompetencyBased | Yes/No | Yes | `true` | From Appendix C — determines if competency assessment required |
| Frequency | Choice | Yes | `Orientation and Annually` | Choices: Orientation Only, Orientation and Annually, Annual, Initial and Ongoing, As Needed, None Specified |
| Duration | Single line text | No | `4 hrs` | |
| Status | Choice | Yes | `Active` | Choices: Active, Draft, Archived |

**Real data (from Appendix C, 23 training requirements):**
- Section 1: Ethics (1.A.6.c), Corporate Compliance (1.A.7.d), Continuing Ed (1.A.8), Fundraising (1.A.9.b), Fiscal (1.F.7.b), Physical Risk Reduction (1.H.3), H&S Training (1.H.4), Infection/Communicable Disease (1.H.12.b), Orientation/Onboarding (1.I.5), Workforce Development (1.I.7.f), Cybersecurity (1.J.5), Telehealth Equipment (1.J.7), Equipment for Persons Served (1.J.8), Performance Measurement (1.M.10)
- Section 2: Security Measures (2.A.24.d), Medication Training (2.A.29), Education for Persons Served (2.A.37.a), Recognizing Changing Needs (2.A.45), Person Education (2.C.3), Volunteer Training (2.C.6), Personnel Clinical Training (2.C.7)
- Section 3: Behavioral Modeling (3.E.27.a), Behavior Management (3.E.27.e)

---

## LIST 7: TrainingRecords
> Per-employee completion tracking

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title (employee) | Single line text | Yes | `Sarah Williams` | Maps to Personnel.Title |
| CourseName | Single line text | Yes | `Health and Safety Training` | Maps to Training.Title |
| DueDate | Date | Yes | `2026-04-15` | |
| CompletedDate | Date | No | `2026-02-10` | Null if not completed |
| CompetencyVerified | Yes/No | No | `true` | Required if Training.CompetencyBased = Yes |
| VerifiedBy | Single line text | No | `Clinical Director` | Who verified competency |
| Status | Choice | Yes | `Completed` | Choices: Completed, In Progress, Overdue, Not Started |
| Year | Single line text | No | `2026` | |

---

## LIST 8: Facilities
> Physical locations

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title | Single line text | Yes | `Roaring Brook Recovery` | |
| FacilityType | Choice | Yes | `SUD Residential` | Choices: SUD Residential, IOP/PHP, Sober Living |
| Address | Single line text | Yes | `123 Recovery Ln, Lexington, KY` | |
| Status | Choice | Yes | `Active` | Choices: Active, Inactive, Pending |
| Beds | Number | No | `48` | |
| LicenseNumber | Single line text | No | `AODE-2024-0412` | |
| Programs | Single line text | No | `RT; IOP; PHP` | Semicolon-delimited programs at this facility |

---

## LIST 9: Licenses
> Facility-level licenses, permits, accreditations

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title | Single line text | Yes | `AODE License` | |
| Facility | Single line text | Yes | `Roaring Brook Recovery` | |
| LicenseType | Choice | Yes | `State License` | Choices: State License, Accreditation, Safety Permit, Health Permit, Federal License, Business License |
| IssuingAuthority | Single line text | No | `KY DBHDID` | |
| IssueDate | Date | Yes | `2024-06-01` | |
| ExpirationDate | Date | Yes | `2026-06-01` | |
| Status | Choice | Yes | `Active` | Choices: Active, Critical, Expired |

---

## LIST 10: Personnel
> Staff roster — role-based for task/policy ownership

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title (name) | Single line text | Yes | `Victor Rivera` | |
| JobTitle | Single line text | Yes | `Executive Director` | |
| ComplianceRole | Choice | No | `Executive Director` | Matches OwnerRole/AssignedToRole choices. One person can hold multiple. |
| Department | Choice | Yes | `Management` | Choices: Management, Clinical, Nursing, Operations, Compliance, Peer Support, Administrative |
| Phone | Single line text | No | `(859) 555-0100` | |
| HireDate | Date | Yes | `2023-01-15` | |
| Supervisor | Single line text | No | `Victor Rivera` | |
| Status | Choice | Yes | `Active` | Choices: Active, On Leave, Terminated |
| CredentialsComplete | Yes/No | No | `true` | |
| TrainingComplete | Yes/No | No | `true` | |

---

## LIST 11: Credentials
> Staff licenses, certifications, registrations

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title (employee) | Single line text | Yes | `Sarah Williams` | |
| CredentialType | Choice | Yes | `LPCC License` | Choices: LPCC, LCSW, RN, LPN, MD/DO, DEA, NPI, Board Cert, Peer Support, CPR/BLS, CAQH, Medicare, Medicaid |
| IssuingBody | Single line text | Yes | `KY BSLE` | |
| CredentialNumber | Single line text | Yes | `LPCC-12345` | |
| IssueDate | Date | No | | |
| ExpirationDate | Date | No | | Null for non-expiring (NPI) |
| Status | Choice | Yes | `Active` | Choices: Active, Critical, Expired, Pending, Revoked |

---

## LIST 12: Incidents
> Incident reports and investigations

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title (type) | Single line text | Yes | `Fall` | |
| IncidentDate | Date | Yes | | |
| Facility | Single line text | Yes | | |
| Severity | Choice | Yes | | Choices: Minor, Moderate, Critical |
| ReportedBy | Single line text | Yes | | |
| Description | Multi-line text | Yes | | |
| InvestigationStatus | Choice | Yes | | Choices: Under Review, RCA In Progress, Resolved, Closed |
| CorrectiveAction | Multi-line text | No | | |
| ResolutionDate | Date | No | | |
| RootCause | Single line text | No | | |
| StandardRef | Single line text | No | | |

---

## LIST 13: Evidence
> Tracks documents that prove compliance per sub-standard
> Maps to the physical folder structure in CARF 2025

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title | Single line text | Yes | `Emergency Response Policy` | Document name |
| StandardRef | Single line text | Yes | `1.H.4` | Which standard this evidence supports |
| DocumentType | Choice | Yes | `Policy` | Choices: Policy, Training Record, Form, Report, Certificate, Photo, Meeting Minutes, Plan, Assessment |
| PolicyRef | Single line text | No | `HR-13` | If this evidence is a policy document |
| FileLocation | Single line text | No | `Section 1H/1.H.4/HR-13` | Path in SharePoint document library |
| UploadDate | Date | No | | |
| Status | Choice | Yes | `Current` | Choices: Current, Outdated, Missing, Under Review |

**Real data:** 24 section folders × avg 15 files = ~360 evidence documents already organized by sub-standard

---

## LIST 14: EOCInspections
> Environment of Care inspections

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title | Single line text | Yes | `Safety Walkthrough - March` | |
| InspectionType | Choice | Yes | `Safety Walkthrough` | |
| Area | Single line text | Yes | `All Areas` | |
| Facility | Single line text | Yes | | |
| InspectionDate | Date | Yes | | |
| Inspector | Single line text | Yes | | |
| Status | Choice | Yes | | Choices: Scheduled, Complete, Deficiencies Found, Corrective Action Needed |
| Findings | Multi-line text | No | | |

---

## LIST 15: LigatureRisk
> Ligature risk assessments

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title | Single line text | Yes | | Room/area |
| Facility | Single line text | Yes | | |
| RiskLevel | Choice | Yes | | Choices: Low, Medium, High, Critical |
| AssessmentDate | Date | Yes | | |
| AssessedBy | Single line text | Yes | | |
| Findings | Multi-line text | No | | |
| Mitigation | Multi-line text | No | | |
| Status | Choice | Yes | | Choices: Assessed, Mitigated, Needs Action |

---

## LIST 16: DailyStaffing
> Daily staffing logs for ratio compliance

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title | Single line text | Yes | `Day Shift - 2026-03-12` | |
| ShiftDate | Date | Yes | | |
| Shift | Choice | Yes | | Choices: Day, Evening, Night |
| ClientCount | Number | Yes | | |
| ClinicalStaff | Number | Yes | | |
| NursingStaff | Number | No | | |
| PeerSupport | Number | No | | |
| TotalStaff | Number | No | | |
| RatioMet | Yes/No | No | | |
| Notes | Multi-line text | No | | |

---

## LIST 17: RegulatoryChanges
> Tracks regulation/standard updates

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title | Single line text | Yes | | |
| ChangeDate | Date | Yes | | |
| Body | Choice | Yes | | Choices: CARF, TJC, KY-DBHDID, Federal-HIPAA, Federal-42CFR2 |
| ChangeType | Choice | Yes | | Choices: Standard Revision, New Requirement, Regulation Amendment, Clarification, Rule Change |
| Description | Multi-line text | Yes | | |
| ImpactedStandards | Single line text | No | | Semicolon-delimited |
| ActionRequired | Multi-line text | No | | |
| DueDate | Date | No | | |
| AssignedToRole | Choice | No | | Same role choices |
| Status | Choice | Yes | | Choices: Not Started, In Progress, Complete |
| Priority | Choice | Yes | | Choices: Critical, High, Medium, Low |

---

## LIST 18: Contracts
> Vendor contracts and BAAs

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title (vendor) | Single line text | Yes | `KIPU Health` | |
| ContractType | Choice | Yes | | Choices: Software/SaaS, BAA, Service Agreement, Vendor |
| StartDate | Date | Yes | | |
| EndDate | Date | Yes | | |
| AutoRenew | Yes/No | No | | |
| AnnualValue | Currency | No | | |
| Status | Choice | Yes | | Choices: Active, Expiring Soon, Expired, Terminated |
| OwnerRole | Choice | No | | |

---

## LIST 19: AuditLog
> Auto-generated CRUD log

| Column | SharePoint Type | Required | Example | Notes |
|--------|----------------|----------|---------|-------|
| Title | Single line text | Yes | | Summary of action |
| Timestamp | Date and Time | Yes | | |
| Action | Choice | Yes | | Choices: Create, Update, Delete |
| Entity | Single line text | Yes | | Which list |
| RecordId | Single line text | Yes | | |
| RecordName | Single line text | No | | |
| UserName | Single line text | Yes | | |
| UserEmail | Single line text | No | | |
| UserRole | Choice | No | | Choices: admin, manager, end_user, viewer |
| Changes | Multi-line text | No | | JSON diff |

---

## TOTALS

| Metric | Count |
|--------|-------|
| SharePoint Lists | 19 (+3 from v1: Crosswalk, ProgramApplicability, Evidence) |
| Total Columns | ~155 |
| Real Data Records (estimated) | ~600+ (standards ~150, policies 62, training 23, tasks 46, evidence ~360) |
| Cross-list References | 20 relationships |

---

## LOADING ORDER

```
Phase 1 (no dependencies):
  1. Facilities
  2. Standards (~150 from CARF/TJC/State/Federal)
  3. Personnel

Phase 2 (depends on Phase 1):
  4. Policies (needs Standards) — load 62 existing policies with HR/TS numbers
  5. Training (needs Standards) — load 23 Appendix C requirements
  6. Credentials (needs Personnel)
  7. Licenses (needs Facilities)
  8. Contracts

Phase 3 (depends on Phase 2):
  9. Crosswalk (needs Standards + Policies + Training)
  10. ProgramApplicability (needs Standards)
  11. ComplianceTasks (needs Standards) — load from Appendix B + Assignment Sheet
  12. TrainingRecords (needs Training + Personnel)
  13. Evidence (needs Standards + Policies) — load from CARF 2025 folder structure
  14. Incidents (needs Facilities + Personnel)
  15. EOCInspections (needs Facilities)
  16. LigatureRisk (needs Facilities)
  17. DailyStaffing (needs Facilities)
  18. RegulatoryChanges (needs Standards)

Phase 4 (auto-generated):
  19. AuditLog (populated by app on every CRUD)
```

---

## DATA SOURCES FOR INITIAL LOAD

| Source | What It Provides | Records |
|--------|-----------------|---------|
| Appendix A (Required Docs) | Standards that require written documentation | ~80 entries |
| Appendix B (Timelines) | Recurring task schedule with frequencies | 46 tasks |
| Appendix C (Training) | Required training catalog with audiences/competency | 23 courses |
| Assignment Sheet | Task-to-person-to-policy mapping | 45 tasks |
| Policies folder | HR-00 to HR-28, TS-01 to TS-31 | 62 policies |
| Section folders (1A-3P) | Evidence documents organized by sub-standard | ~360 files |
| CARF 2020 Manual | Full standard text (Section 1, 2, 3) | ~150 standards |

---

## CRITICAL FIXES FOR mockData.js

1. **Wrong KAR reference:** `902 KAR 20:036` → `908 KAR 1:370` (general AODE) and `908 KAR 1:372` (residential)
2. **Add role-based assignment:** Replace person names with ComplianceRole values
3. **Add PolicyNumber field:** Mock policies need HR-XX/TS-XX numbers
4. **Add CARF section standards:** Current mock only has TJC-style codes, needs CARF (1.A.3, 1.H.4, etc.)
