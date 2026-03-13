# ComplianceHub — Implementation Roadmap

> Current state: React app deployed with mock data at compliance.roaringbrookrecovery.com
> Target state: Live SharePoint-backed GRC platform for CARF/TJC survey readiness

---

## PHASE 1: Fix Mock Data + Create SharePoint Lists
**Goal:** Correct the foundation before building on it

### 1.1 Fix mockData.js
- [ ] Replace `902 KAR 20:036` with `908 KAR 1:370` / `908 KAR 1:372`
- [ ] Add CARF-style standard codes (1.A.3, 1.H.4, etc.) alongside TJC codes
- [ ] Add `PolicyNumber` field (HR-XX, TS-XX) to mock policies
- [ ] Switch task/policy assignments from names to roles (ComplianceRole)
- [ ] Add mock Crosswalk, ProgramApplicability, and Evidence records

### 1.2 Create SharePoint Lists (19 lists)
- [ ] Phase 1 lists: Facilities, Standards, Personnel
- [ ] Phase 2 lists: Policies, Training, Credentials, Licenses, Contracts
- [ ] Phase 3 lists: Crosswalk, ProgramApplicability, ComplianceTasks, TrainingRecords, Evidence, Incidents, EOCInspections, LigatureRisk, DailyStaffing, RegulatoryChanges
- [ ] Phase 4: AuditLog
- [ ] Verify all Choice columns match SCHEMA_MAP.md definitions

---

## PHASE 2: Wire App to Live Data
**Goal:** Replace mock imports with SharePoint Graph API calls

### 2.1 Data Layer
- [ ] Update `graphService.js` with CRUD for all 19 lists
- [ ] Update `useSharePointData` hook to handle new lists
- [ ] Add list name constants and column mappings

### 2.2 Page-by-Page Migration (15 pages)
- [ ] Dashboard — wire to live ComplianceTasks, Licenses, TrainingRecords, Incidents
- [ ] Facilities — wire to Facilities list
- [ ] Licenses — wire to Licenses list
- [ ] EOC Inspections — wire to EOCInspections list
- [ ] Ligature Risk — wire to LigatureRisk list
- [ ] Daily Staffing — wire to DailyStaffing list
- [ ] Personnel — wire to Personnel list
- [ ] Credentialing — wire to Credentials list
- [ ] Training — wire to Training + TrainingRecords lists
- [ ] Policies — wire to Policies list (add PolicyNumber display)
- [ ] Incidents — wire to Incidents list
- [ ] Standards — wire to Standards + Crosswalk + ProgramApplicability
- [ ] Regulatory Changes — wire to RegulatoryChanges list
- [ ] Audit Trail — wire to AuditLog list
- [ ] Data Backup — connect to SharePoint document library

### 2.3 New Pages/Components
- [ ] Crosswalk view — show how one requirement maps across CARF/TJC/State/Federal
- [ ] Evidence tracker — link documents to sub-standards
- [ ] Program filter — filter all views by LOC (RT, IOP, PHP, CH)

---

## PHASE 3: Load Real Data
**Goal:** Populate SharePoint with production data from CARF 2025 folder

### 3.1 Standards Load (~150 records)
- [ ] Extract CARF standards from Appendix A, B, C
- [ ] Add TJC equivalent standards
- [ ] Add KY 908 KAR 1:370/372 requirements
- [ ] Add Federal HIPAA + 42 CFR Part 2 requirements

### 3.2 Policies Load (62 records)
- [ ] Load HR-00 through HR-28 (28 policies)
- [ ] Load TS-01 through TS-31 (31 policies)
- [ ] Load misc policies (COVID, Cultural Competency, Org Chart)
- [ ] Set NextReview dates (flag anything older than 12 months)

### 3.3 Training Load (23 records from Appendix C)
- [ ] Load all 23 training requirements with ProvidedTo and CompetencyBased fields
- [ ] Set frequency defaults (most are "Org-Determined")

### 3.4 Tasks Load (~46 records from Appendix B)
- [ ] Load recurring tasks with correct frequencies
- [ ] Map to standards and policies using Assignment Sheet cross-references
- [ ] Assign to ComplianceRoles (not individual names)

### 3.5 Crosswalk Load
- [ ] Map CARF ↔ TJC equivalencies for overlapping standards
- [ ] Link each crosswalk entry to the policy and training that satisfies it

### 3.6 Evidence Load (~360 records)
- [ ] Create Evidence records from CARF 2025 section folder file inventory
- [ ] Link each to its sub-standard code
- [ ] Flag missing evidence (standards with no documents)

### 3.7 Personnel & Credentials
- [ ] Load current staff roster (Victor to provide)
- [ ] Load credential/license data per staff member

---

## PHASE 4: Production Hardening
**Goal:** Ready for real daily use

- [ ] Remove `?test=1` auth bypass
- [ ] Add proper error boundaries for Graph API failures
- [ ] Add loading states for all data-fetching pages
- [ ] Add offline/connection-lost handling
- [ ] Implement real role detection from Azure AD groups (replace mock roles)
- [ ] Add form validation that enforces Choice column values from SCHEMA_MAP.md
- [ ] Add data export (CSV/Excel) for survey prep
- [ ] Set up automated task reminders (email via Power Automate or Graph)

---

## PHASE 5: Survey Readiness Features
**Goal:** Tools for CARF/TJC survey day

- [ ] Survey prep dashboard — compliance score by section, gaps highlighted
- [ ] Evidence packet generator — pull all docs for a given standard/section
- [ ] Training matrix — grid of staff × required training with completion status
- [ ] Policy review calendar — upcoming reviews with responsible roles
- [ ] Incident trend analysis — charts by type, severity, facility, time period
- [ ] Credential expiration alerts — 90/60/30 day warnings
- [ ] Crosswalk report — show surveyors how one action satisfies multiple bodies

---

## STATUS KEY

| Phase | Status | ETA |
|-------|--------|-----|
| Phase 1 | **Next up** | — |
| Phase 2 | Not started | — |
| Phase 3 | Not started | — |
| Phase 4 | Not started | — |
| Phase 5 | Not started | — |
